<?php

/**
 * ============================================================================
 * RECEBE O FORMULARIO DA LANDING E AVISA O COMERCIAL DA ZT
 * ----------------------------------------------------------------------------
 * Roda no PHP da propria HostGator: o dado do lead nao passa por terceiro.
 *
 * Fluxo:
 *   1. valida origem, metodo e limites anti-spam (honeypot, tempo, IP);
 *   2. valida os campos de novo (validacao de front-end nao vale nada:
 *      qualquer um pode postar direto neste endereco);
 *   3. envia o e-mail por SMTP autenticado;
 *   4. grava o lead em JSONL, com o resultado do envio;
 *   5. opcionalmente espelha o Lead na Conversions API da Meta;
 *   6. responde JSON, que e o que o front espera.
 *
 * GET ?status=1 devolve um diagnostico da instalacao — util no primeiro deploy.
 * ============================================================================
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

const CAMINHO_CONFIG = __DIR__ . '/config.php';

// Rotulos dos campos de escolha. Servem para validar o que chegou e para
// escrever o e-mail sem codigo interno ("saude_odontologia" vira "Saude e
// odontologia"). Espelham FORM_OPTIONS em src/content/landing.ts.
const SEGMENTOS = [
    'saude_odontologia' => 'Saúde e odontologia',
    'estetica_beleza' => 'Estética e beleza',
    'varejo' => 'Varejo / loja',
    'servicos' => 'Prestação de serviços',
    'industria' => 'Indústria',
    'educacao' => 'Educação',
    'imobiliario' => 'Imobiliário e construção',
    'outro' => 'Outro',
];
const FATURAMENTOS = [
    'ate_20k' => 'Até R$ 20 mil',
    '20k_50k' => 'R$ 20 mil a R$ 50 mil',
    '50k_100k' => 'R$ 50 mil a R$ 100 mil',
    '100k_300k' => 'R$ 100 mil a R$ 300 mil',
    'acima_300k' => 'Acima de R$ 300 mil',
    'nao_informar' => 'Prefiro não informar',
];
const INTERESSES = [
    'assessoria_completa' => 'Assessoria completa',
    'trafego' => 'Tráfego pago',
    'crm' => 'CRM',
    'conteudo' => 'Conteúdo',
    'social' => 'Mídias sociais',
    'sites' => 'Site',
    'design' => 'Design',
    'copy' => 'Copywriting',
];
const ASSESSORIA_ANTERIOR = [
    'sim' => 'Sim, já teve',
    'nao' => 'Não, seria a primeira',
];
const UFS = [
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
    'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

/** Resposta JSON e encerra. */
function responder(int $codigo, array $corpo): void
{
    http_response_code($codigo);
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Registra falha no log do servidor, sem vazar detalhe para o navegador. */
function registrar(string $mensagem): void
{
    error_log('[zt-lead] ' . $mensagem);
}

$config = is_readable(CAMINHO_CONFIG) ? require CAMINHO_CONFIG : [];
$origensPermitidas = $config['allowed_origins'] ?? ['https://ztdigital.com.br', 'https://www.ztdigital.com.br'];

$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origem, $origensPermitidas, true)) {
    header('Access-Control-Allow-Origin: ' . $origem);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

// ---------------------------------------------------------------------------
// Preflight
// ---------------------------------------------------------------------------
if ($metodo === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---------------------------------------------------------------------------
// Diagnostico da instalacao — GET ?status=1
// Nao expoe senha, token nem os enderecos de destino: so diz o que falta.
// ---------------------------------------------------------------------------
if ($metodo === 'GET' && isset($_GET['status'])) {
    $temConfig = is_readable(CAMINHO_CONFIG);
    $smtp = $config['smtp'] ?? [];
    $pastaDados = $config['data_dir'] ?? __DIR__ . '/data';

    responder(200, [
        'ok' => true,
        'php' => PHP_VERSION,
        'phpmailer' => class_exists(PHPMailer::class),
        'openssl' => extension_loaded('openssl'),
        'config_encontrada' => $temConfig,
        'smtp_configurado' => !empty($smtp['host']) && !empty($smtp['user']) && !empty($smtp['pass']),
        // Host e porta nao sao segredo (o MX do dominio ja os denuncia) e sao o
        // que mais erra na configuracao: cPanel x Titan, 465 x 587.
        'smtp_host' => (string)($smtp['host'] ?? ''),
        'smtp_porta' => (int)($smtp['port'] ?? 0),
        'destinatarios' => count(array_filter((array)($config['notify_to'] ?? []))),
        'capi_ligada' => !empty($config['meta_capi']['access_token']),
        'pasta_gravavel' => is_dir($pastaDados) ? is_writable($pastaDados) : is_writable(__DIR__),
    ]);
}

if ($metodo !== 'POST') {
    header('Allow: POST');
    responder(405, ['ok' => false, 'erro' => 'metodo_nao_permitido']);
}

if ($origem !== '' && !in_array($origem, $origensPermitidas, true)) {
    registrar('origem recusada: ' . $origem);
    responder(403, ['ok' => false, 'erro' => 'origem_nao_autorizada']);
}

if (!is_readable(CAMINHO_CONFIG)) {
    registrar('config.php ausente em ' . CAMINHO_CONFIG);
    responder(500, ['ok' => false, 'erro' => 'configuracao_ausente']);
}

// ---------------------------------------------------------------------------
// Pasta de dados (leads + contadores de limite)
// ---------------------------------------------------------------------------
$pastaDados = rtrim((string)($config['data_dir'] ?? __DIR__ . '/data'), '/');
if (!is_dir($pastaDados) && !mkdir($pastaDados, 0750, true) && !is_dir($pastaDados)) {
    registrar('nao foi possivel criar ' . $pastaDados);
    responder(500, ['ok' => false, 'erro' => 'armazenamento_indisponivel']);
}

$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';

// ---------------------------------------------------------------------------
// Limite por IP — um arquivo por IP basta nesta escala e evita depender de banco
// ---------------------------------------------------------------------------
$arquivoLimite = $pastaDados . '/rate-' . hash('sha256', $ip) . '.json';
$agora = time();
$janela = (int)($config['rate_limit_window'] ?? 600);
$maximo = (int)($config['rate_limit_max'] ?? 5);

$marcas = [];
if (is_readable($arquivoLimite)) {
    $marcas = json_decode((string)file_get_contents($arquivoLimite), true) ?: [];
}
$marcas = array_values(array_filter($marcas, static fn ($t) => is_int($t) && $t > $agora - $janela));
if (count($marcas) >= $maximo) {
    responder(429, ['ok' => false, 'erro' => 'muitas_tentativas']);
}
$marcas[] = $agora;
@file_put_contents($arquivoLimite, json_encode($marcas), LOCK_EX);

// ---------------------------------------------------------------------------
// Corpo da requisicao
// ---------------------------------------------------------------------------
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== 0) {
    responder(415, ['ok' => false, 'erro' => 'content_type_invalido']);
}

$bruto = file_get_contents('php://input');
if ($bruto === false || strlen($bruto) > 32000) {
    responder(400, ['ok' => false, 'erro' => 'corpo_invalido']);
}

$dados = json_decode((string)$bruto, true);
if (!is_array($dados)) {
    responder(400, ['ok' => false, 'erro' => 'json_invalido']);
}

// O front manda o lead dentro de "lead", com "tracking", "attribution" e "meta"
// ao lado. Aceitamos tambem o formato plano, por seguranca.
$lead = is_array($dados['lead'] ?? null) ? $dados['lead'] : $dados;
$rastreio = is_array($dados['tracking'] ?? null) ? $dados['tracking'] : [];
$atrib = is_array($dados['attribution'] ?? null) ? $dados['attribution'] : [];

/** Campo de uma linha: sem \r\n, que e como se injeta cabecalho falso no e-mail. */
$texto = static function (string $campo, int $limite = 200) use ($lead): string {
    $valor = $lead[$campo] ?? '';
    if (!is_string($valor)) {
        return '';
    }
    return mb_substr(trim(preg_replace('/[\r\n]+/', ' ', $valor) ?? ''), 0, $limite);
};

// ---------- Armadilhas anti-robo ----------
// Campo invisivel: humano nunca preenche, robo que varre o HTML quase sempre.
$honeypot = $dados['honeypot'] ?? ($lead['website'] ?? '');
if (is_string($honeypot) && trim($honeypot) !== '') {
    registrar('honeypot preenchido — descartado silenciosamente');
    responder(200, ['ok' => true]); // finge sucesso para o robo nao insistir
}

$abertoEm = (int)($dados['form_opened_at'] ?? 0);
$minimo = (int)($config['segundos_minimos_no_form'] ?? 3);
if ($abertoEm > 0) {
    $segundos = $agora - (int)($abertoEm / 1000);
    if ($segundos >= 0 && $segundos < $minimo) {
        registrar("preenchido em {$segundos}s — abaixo do minimo de {$minimo}s");
        responder(200, ['ok' => true]);
    }
}

// ---------- Validacao ----------
$nome = preg_replace('/\s+/u', ' ', $texto('name', 120)) ?? '';
$email = mb_strtolower($texto('email', 160));
$telefone = $texto('phone', 40);
$empresa = $texto('company', 160);
$segmento = $texto('segment', 40);
$faturamento = $texto('revenue', 40);
$assessoria = $texto('had_agency', 10);
$cidade = $texto('city', 120);
$uf = strtoupper($texto('uf', 2));
$instagram = $texto('instagram', 200);
$mensagem = mb_substr(trim((string)($lead['message'] ?? '')), 0, 2000);
$consentimento = !empty($lead['privacy_accepted']) || !empty($lead['privacy']);

$interesses = array_values(array_intersect(
    array_map('strval', is_array($lead['interests'] ?? null) ? $lead['interests'] : []),
    array_keys(INTERESSES)
));

$digitos = preg_replace('/\D/', '', $telefone) ?? '';
$erros = [];

if (count(preg_split('/\s+/u', $nome, -1, PREG_SPLIT_NO_EMPTY)) < 2) {
    $erros[] = 'name';
}
if (strlen($digitos) < 10 || strlen($digitos) > 11) {
    $erros[] = 'phone';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erros[] = 'email';
}
if (mb_strlen($empresa) < 2) {
    $erros[] = 'company';
}
if (!isset(SEGMENTOS[$segmento])) {
    $erros[] = 'segment';
}
if (!isset(FATURAMENTOS[$faturamento])) {
    $erros[] = 'revenue';
}
if (!$interesses) {
    $erros[] = 'interests';
}
if (!isset(ASSESSORIA_ANTERIOR[$assessoria])) {
    $erros[] = 'had_agency';
}
if (mb_strlen($cidade) < 2) {
    $erros[] = 'city';
}
if (!in_array($uf, UFS, true)) {
    $erros[] = 'uf';
}
if (!$consentimento) {
    $erros[] = 'privacy';
}

if ($erros) {
    responder(422, ['ok' => false, 'erro' => 'validacao', 'campos' => $erros]);
}

// ---------------------------------------------------------------------------
// Monta o e-mail
// ---------------------------------------------------------------------------
$origemCampanha = [];
foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'] as $chave) {
    if (!empty($atrib[$chave]) && is_string($atrib[$chave])) {
        $origemCampanha[$chave] = mb_substr($atrib[$chave], 0, 200);
    }
}

$e = static fn (string $v): string => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
$whatsappLink = 'https://wa.me/55' . $digitos;
$recebidoEm = (new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo')))->format('d/m/Y \à\s H:i');
$interessesTexto = implode(', ', array_map(static fn ($i) => INTERESSES[$i], $interesses));

$linhas = [
    'Nome' => $e($nome),
    'WhatsApp' => '<a href="' . $e($whatsappLink) . '" style="color:#b04a00">' . $e($telefone) . '</a>',
    'E-mail' => '<a href="mailto:' . $e($email) . '" style="color:#b04a00">' . $e($email) . '</a>',
    'Empresa' => $e($empresa),
    'Segmento' => $e(SEGMENTOS[$segmento]),
    'Faturamento mensal' => $e(FATURAMENTOS[$faturamento]),
    'Quer ajuda com' => $e($interessesTexto),
    'Já teve assessoria' => $e(ASSESSORIA_ANTERIOR[$assessoria]),
    'Cidade / UF' => $e($cidade . ' - ' . $uf),
];
if ($instagram !== '') {
    $linhas['Instagram / site'] = $e($instagram);
}
if ($mensagem !== '') {
    $linhas['Mensagem'] = nl2br($e($mensagem));
}

$tabela = '';
foreach ($linhas as $rotulo => $valor) {
    $tabela .= '<tr>'
        . '<td style="padding:10px 16px;border-bottom:1px solid #e9edee;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#5a6b70;white-space:nowrap;vertical-align:top">' . $rotulo . '</td>'
        . '<td style="padding:10px 16px;border-bottom:1px solid #e9edee;font:400 15px/1.5 Arial,sans-serif;color:#101c1f">' . $valor . '</td>'
        . '</tr>';
}

if ($origemCampanha) {
    $itens = '';
    foreach ($origemCampanha as $chave => $valor) {
        $itens .= '<div style="font:400 13px/1.6 Arial,sans-serif;color:#5a6b70"><strong>' . $e($chave) . ':</strong> ' . $e($valor) . '</div>';
    }
    $blocoCampanha = '<div style="margin-top:24px;padding:16px;background:#f6f4ef;border-left:3px solid #ff7d00">'
        . '<div style="font:700 11px/1.4 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#b04a00;margin-bottom:8px">Origem da campanha</div>'
        . $itens . '</div>';
} else {
    $blocoCampanha = '<div style="margin-top:24px;font:400 13px/1.6 Arial,sans-serif;color:#7e8a8d">'
        . 'Sem UTMs — provavelmente tráfego direto ou orgânico.</div>';
}

$corpoHtml = '<!doctype html><html lang="pt-BR"><body style="margin:0;padding:24px;background:#f6f4ef">'
    . '<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e9edee;border-radius:12px;overflow:hidden">'
    . '<div style="background:#0b1315;padding:20px 24px">'
    . '<div style="font:700 11px/1.4 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#ff9433">ZT Marketing Digital</div>'
    . '<div style="font:700 22px/1.3 Arial,sans-serif;color:#fff;margin-top:6px">Novo lead pelo site</div>'
    . '</div>'
    . '<div style="padding:24px">'
    . '<div style="font:400 13px/1.5 Arial,sans-serif;color:#7e8a8d;margin-bottom:16px">Recebido em ' . $e($recebidoEm) . '</div>'
    . '<table style="width:100%;border-collapse:collapse">' . $tabela . '</table>'
    . '<a href="' . $e($whatsappLink) . '" style="display:inline-block;margin-top:24px;padding:14px 24px;background:#25d366;color:#0b3d23;font:700 13px/1 Arial,sans-serif;text-decoration:none;border-radius:999px">Responder pelo WhatsApp</a>'
    . '<a href="mailto:' . $e($email) . '" style="display:inline-block;margin:24px 0 0 8px;padding:14px 24px;background:#ff7d00;color:#0b1315;font:700 13px/1 Arial,sans-serif;text-decoration:none;border-radius:999px">Responder por e-mail</a>'
    . $blocoCampanha
    . '</div></div>'
    . '<div style="max-width:600px;margin:12px auto 0;font:400 11px/1.5 Arial,sans-serif;color:#7e8a8d;text-align:center">'
    . 'Enviado automaticamente pelo formulário de ztdigital.com.br</div>'
    . '</body></html>';

$corpoTexto = "NOVO LEAD PELO SITE\n"
    . "Recebido em {$recebidoEm}\n\n"
    . "Nome: {$nome}\n"
    . "WhatsApp: {$telefone}  ({$whatsappLink})\n"
    . "E-mail: {$email}\n"
    . "Empresa: {$empresa}\n"
    . 'Segmento: ' . SEGMENTOS[$segmento] . "\n"
    . 'Faturamento mensal: ' . FATURAMENTOS[$faturamento] . "\n"
    . "Quer ajuda com: {$interessesTexto}\n"
    . 'Ja teve assessoria: ' . ASSESSORIA_ANTERIOR[$assessoria] . "\n"
    . "Cidade/UF: {$cidade} - {$uf}\n"
    . ($instagram !== '' ? "Instagram/site: {$instagram}\n" : '')
    . ($mensagem !== '' ? "Mensagem: {$mensagem}\n" : '')
    . ($origemCampanha ? "\nOrigem: " . json_encode($origemCampanha, JSON_UNESCAPED_UNICODE) . "\n" : '');

// ---------------------------------------------------------------------------
// Envia
// ---------------------------------------------------------------------------
$destinatarios = array_values(array_filter((array)($config['notify_to'] ?? [])));
$smtp = $config['smtp'] ?? [];
$assunto = 'Novo lead no site: ' . $empresa;
$enviado = false;

if ($destinatarios && !empty($smtp['host'])) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = (string)$smtp['host'];
        $mail->Port = (int)($smtp['port'] ?? 465);
        $mail->SMTPAuth = true;
        $mail->Username = (string)$smtp['user'];
        $mail->Password = (string)$smtp['pass'];
        // 465 = SSL implicito; 587 = STARTTLS.
        $mail->SMTPSecure = $mail->Port === 587
            ? PHPMailer::ENCRYPTION_STARTTLS
            : PHPMailer::ENCRYPTION_SMTPS;
        $mail->CharSet = PHPMailer::CHARSET_UTF8;
        $mail->Timeout = 20;

        // O remetente precisa ser a propria caixa autenticada. Usar o e-mail do
        // lead aqui faria o Gmail tratar como falsificacao — ele vai no Reply-To.
        $mail->setFrom((string)$config['notify_from'], (string)($config['notify_from_name'] ?? 'Site ZT Digital'));
        foreach ($destinatarios as $destino) {
            $mail->addAddress((string)$destino);
        }
        $mail->addReplyTo($email, $nome);

        $mail->Subject = $assunto;
        $mail->isHTML(true);
        $mail->Body = $corpoHtml;
        $mail->AltBody = $corpoTexto;

        $enviado = $mail->send();
    } catch (PHPMailerException $erro) {
        registrar('falha SMTP: ' . $mail->ErrorInfo);
    }
} elseif ($destinatarios) {
    // Sem SMTP configurado: mail() do servidor, que o HostGator entrega mal.
    $cabecalhos = implode("\r\n", [
        'From: =?UTF-8?B?' . base64_encode((string)($config['notify_from_name'] ?? 'Site ZT Digital')) . '?= <' . $config['notify_from'] . '>',
        'Reply-To: ' . $email,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
    ]);
    $enviado = mail(
        implode(', ', $destinatarios),
        '=?UTF-8?B?' . base64_encode($assunto) . '?=',
        $corpoHtml,
        $cabecalhos,
        '-f' . $config['notify_from']
    );
}

if (!$enviado) {
    registrar('e-mail nao enviado — o lead esta gravado no JSONL');
}

// ---------------------------------------------------------------------------
// Grava o lead (vale como backup mesmo se o e-mail falhar)
// ---------------------------------------------------------------------------
$eventId = preg_replace('/[^A-Za-z0-9_\-]/', '', (string)($rastreio['event_id'] ?? '')) ?: ('lead_' . bin2hex(random_bytes(8)));
$consent = (string)($rastreio['consent_tracking'] ?? 'unknown');

$registro = [
    'received_at' => date('c'),
    'lead' => [
        'name' => $nome,
        'phone' => $telefone,
        'email' => $email,
        'company' => $empresa,
        'segment' => $segmento,
        'revenue' => $faturamento,
        'interests' => $interesses,
        'had_agency' => $assessoria,
        'city' => $cidade,
        'uf' => $uf,
        'instagram' => $instagram,
        'message' => $mensagem,
        'privacy_accepted' => true,
    ],
    'event_id' => $eventId,
    'consent_tracking' => $consent,
    'attribution' => array_map(static fn ($v) => mb_substr((string)$v, 0, 300), $atrib),
    'ip_hash' => hash('sha256', $ip),
    'mail_sent' => $enviado,
];
@file_put_contents(
    $pastaDados . '/leads-' . date('Y-m') . '.jsonl',
    json_encode($registro, JSON_UNESCAPED_UNICODE) . "\n",
    FILE_APPEND | LOCK_EX
);

// ---------------------------------------------------------------------------
// Meta Conversions API — opcional, so com consentimento
// ---------------------------------------------------------------------------
$capi = $config['meta_capi'] ?? [];
if (!empty($capi['access_token']) && $consent === 'granted') {
    $hash = static fn (string $v): string => hash('sha256', $v);
    $partesNome = preg_split('/\s+/u', mb_strtolower($nome), -1, PREG_SPLIT_NO_EMPTY) ?: [];
    $cidadeAscii = preg_replace('/[^a-z]/', '', mb_strtolower((string)iconv('UTF-8', 'ASCII//TRANSLIT', $cidade))) ?? '';

    $userData = array_filter([
        'em' => [$hash($email)],
        'ph' => [$hash('55' . $digitos)],
        'fn' => [$hash($partesNome[0] ?? '')],
        'ln' => [$hash(end($partesNome) ?: '')],
        'ct' => [$hash($cidadeAscii)],
        'st' => [$hash(mb_strtolower($uf))],
        'country' => [$hash('br')],
        'client_ip_address' => $ip,
        'client_user_agent' => mb_substr((string)($rastreio['user_agent'] ?? ''), 0, 400),
        'fbp' => $rastreio['fbp'] ?? null,
        'fbc' => $rastreio['fbc'] ?? null,
    ]);

    $evento = [
        'event_name' => 'Lead',
        'event_time' => (int)($rastreio['event_time'] ?? time()),
        'event_id' => $eventId,
        'action_source' => 'website',
        'event_source_url' => mb_substr((string)($rastreio['event_source_url'] ?? ''), 0, 500),
        'user_data' => $userData,
        // Sem segmento nem faturamento: a Meta proibe dado financeiro ou de saude.
        'custom_data' => [
            'content_name' => 'ZT Digital — Assessoria de marketing',
            'lead_type' => 'contato_comercial',
        ],
    ];

    $carga = ['data' => [$evento]];
    if (!empty($capi['test_event_code'])) {
        $carga['test_event_code'] = $capi['test_event_code'];
    }

    $url = sprintf(
        'https://graph.facebook.com/%s/%s/events?access_token=%s',
        (string)($capi['api_version'] ?? 'v25.0'),
        rawurlencode((string)$capi['pixel_id']),
        rawurlencode((string)$capi['access_token'])
    );
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($carga),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
    ]);
    $resposta = curl_exec($ch);
    $codigo = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($codigo < 200 || $codigo >= 300) {
        registrar('CAPI falhou: HTTP ' . $codigo . ' ' . mb_substr((string)$resposta, 0, 300));
    }
}

// Se o e-mail nao saiu, o lead esta salvo: responder erro faria o visitante
// preencher de novo e a ZT receber o mesmo lead duas vezes.
responder(200, ['ok' => true]);
