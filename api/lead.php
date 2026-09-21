<?php
declare(strict_types=1);

/**
 * Recebe o formulário da landing (POST JSON), valida de novo no servidor,
 * descarta bots (honeypot), aplica rate limit, grava em JSONL e envia e-mail.
 * Opcional: repassa o Lead para a Meta Conversions API com o mesmo event_id do Pixel.
 *
 * Contrato: ver README.md, seção "Contrato do formulário".
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Envia a notificação do lead. Usa SMTP autenticado (PHPMailer) quando há host
 * configurado; sem isso, cai no mail() do servidor, que o HostGator entrega mal.
 */
function send_notification(array $config, string $subject, string $body, string $replyTo, string $replyName): bool
{
    $smtp = $config['smtp'] ?? [];

    if (!empty($smtp['host'])) {
        $base = __DIR__ . '/lib/PHPMailer/';
        require_once $base . 'Exception.php';
        require_once $base . 'PHPMailer.php';
        require_once $base . 'SMTP.php';

        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = $smtp['host'];
            $mail->SMTPAuth = true;
            $mail->Username = $smtp['user'];
            $mail->Password = $smtp['pass'];
            $mail->Port = (int)($smtp['port'] ?? 465);
            // 465 = SSL implícito; 587 = STARTTLS.
            $mail->SMTPSecure = $mail->Port === 587
                ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS
                : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            $mail->Timeout = 20;
            $mail->CharSet = 'UTF-8';

            $mail->setFrom($config['notify_from'], $config['notify_from_name']);
            $mail->addAddress($config['notify_to']);
            $mail->addReplyTo($replyTo, $replyName !== '' ? $replyName : $replyTo);
            $mail->Subject = $subject;
            $mail->Body = $body;

            return $mail->send();
        } catch (Throwable $e) {
            error_log('[lead] SMTP falhou: ' . $e->getMessage());
            return false;
        }
    }

    $headers = implode("\r\n", [
        'From: =?UTF-8?B?' . base64_encode($config['notify_from_name']) . '?= <' . $config['notify_from'] . '>',
        'Reply-To: ' . $replyTo,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    $encoded = '=?UTF-8?B?' . base64_encode($subject) . '?=';

    return mail($config['notify_to'], $encoded, $body, $headers, '-f' . $config['notify_from']);
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    error_log('[lead] config.php ausente');
    respond(500, ['ok' => false, 'error' => 'config']);
}
$config = require $configFile;

// ---------- Método, origem e tamanho ----------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $config['allowed_origins'], true)) {
    respond(403, ['ok' => false, 'error' => 'origin']);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== 0) {
    respond(415, ['ok' => false, 'error' => 'content_type']);
}

$raw = file_get_contents('php://input', false, null, 0, 32 * 1024);
$data = json_decode($raw ?: '', true);
if (!is_array($data) || !isset($data['lead']) || !is_array($data['lead'])) {
    respond(400, ['ok' => false, 'error' => 'payload']);
}

// ---------- Honeypot: finge sucesso para o bot não insistir ----------

if (trim((string)($data['honeypot'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}

// ---------- Rate limit por IP (arquivo, sem banco) ----------

$dataDir = rtrim($config['data_dir'] ?? __DIR__ . '/data', '/');
if (!is_dir($dataDir) && !mkdir($dataDir, 0750, true) && !is_dir($dataDir)) {
    error_log('[lead] não foi possível criar data_dir');
    respond(500, ['ok' => false, 'error' => 'storage']);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rateFile = $dataDir . '/rate-' . hash('sha256', $ip) . '.json';
$now = time();
$hits = [];
if (is_file($rateFile)) {
    $hits = json_decode((string)file_get_contents($rateFile), true) ?: [];
}
$hits = array_values(array_filter($hits, static fn ($t) => is_int($t) && $t > $now - (int)$config['rate_limit_window']));
if (count($hits) >= (int)$config['rate_limit_max']) {
    respond(429, ['ok' => false, 'error' => 'rate_limit']);
}
$hits[] = $now;
file_put_contents($rateFile, json_encode($hits), LOCK_EX);

// ---------- Validação (mesmas regras do front) ----------

$lead = $data['lead'];
$str = static fn (string $key, int $max = 200): string => mb_substr(trim((string)($lead[$key] ?? '')), 0, $max);

$allowed = [
    'segment' => ['saude_odontologia', 'estetica_beleza', 'varejo', 'servicos', 'industria', 'educacao', 'imobiliario', 'outro'],
    'revenue' => ['ate_20k', '20k_50k', '50k_100k', '100k_300k', 'acima_300k', 'nao_informar'],
    'interests' => ['assessoria_completa', 'trafego', 'crm', 'conteudo', 'social', 'sites', 'design', 'copy'],
    'had_agency' => ['sim', 'nao'],
    'uf' => ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
];

$clean = [
    'name' => preg_replace('/\s+/u', ' ', $str('name', 120)),
    'phone' => $str('phone', 20),
    'email' => mb_strtolower($str('email', 160)),
    'company' => $str('company', 160),
    'segment' => $str('segment', 40),
    'revenue' => $str('revenue', 40),
    'interests' => array_values(array_intersect(
        array_map('strval', is_array($lead['interests'] ?? null) ? $lead['interests'] : []),
        $allowed['interests']
    )),
    'had_agency' => $str('had_agency', 10),
    'city' => $str('city', 120),
    'uf' => strtoupper($str('uf', 2)),
    'instagram' => $str('instagram', 200),
    'message' => $str('message', 2000),
    'privacy_accepted' => ($lead['privacy_accepted'] ?? false) === true,
];

$errors = [];
if (count(preg_split('/\s+/u', $clean['name'], -1, PREG_SPLIT_NO_EMPTY)) < 2) $errors[] = 'name';
$phoneDigits = preg_replace('/\D/', '', $clean['phone']);
if (strlen($phoneDigits) < 10 || strlen($phoneDigits) > 11) $errors[] = 'phone';
if (!filter_var($clean['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if (mb_strlen($clean['company']) < 2) $errors[] = 'company';
if (!in_array($clean['segment'], $allowed['segment'], true)) $errors[] = 'segment';
if (!in_array($clean['revenue'], $allowed['revenue'], true)) $errors[] = 'revenue';
if (count($clean['interests']) === 0) $errors[] = 'interests';
if (!in_array($clean['had_agency'], $allowed['had_agency'], true)) $errors[] = 'had_agency';
if (mb_strlen($clean['city']) < 2) $errors[] = 'city';
if (!in_array($clean['uf'], $allowed['uf'], true)) $errors[] = 'uf';
if (!$clean['privacy_accepted']) $errors[] = 'privacy';

if ($errors) {
    respond(422, ['ok' => false, 'error' => 'validation', 'fields' => $errors]);
}

$tracking = is_array($data['tracking'] ?? null) ? $data['tracking'] : [];
$attribution = is_array($data['attribution'] ?? null) ? $data['attribution'] : [];
$eventId = preg_replace('/[^A-Za-z0-9_\-]/', '', (string)($tracking['event_id'] ?? '')) ?: ('lead_' . bin2hex(random_bytes(8)));
$consent = (string)($tracking['consent_tracking'] ?? 'unknown');

// ---------- Gravação (backup) ----------

$record = [
    'received_at' => date('c'),
    'lead' => $clean,
    'event_id' => $eventId,
    'consent_tracking' => $consent,
    'attribution' => array_map(static fn ($v) => mb_substr((string)$v, 0, 300), $attribution),
    'ip_hash' => hash('sha256', $ip),
];
// O arquivo é gravado depois do e-mail, para registrar junto se o envio deu certo.

// ---------- E-mail de notificação ----------

$labels = [
    'name' => 'Nome', 'phone' => 'WhatsApp', 'email' => 'E-mail', 'company' => 'Empresa',
    'segment' => 'Segmento', 'revenue' => 'Faturamento mensal', 'interests' => 'Interesses',
    'had_agency' => 'Já teve assessoria', 'city' => 'Cidade', 'uf' => 'UF',
    'instagram' => 'Instagram/site', 'message' => 'Mensagem',
];
$lines = [];
foreach ($labels as $key => $label) {
    $value = is_array($clean[$key]) ? implode(', ', $clean[$key]) : $clean[$key];
    $lines[] = $label . ': ' . ($value !== '' ? $value : '—');
}
$utm = [];
foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as $key) {
    if (!empty($attribution[$key])) $utm[] = $key . '=' . $attribution[$key];
}
$lines[] = '';
$lines[] = 'Origem: ' . ($utm ? implode(' · ', $utm) : 'direto/orgânico');
$lines[] = 'Página: ' . (string)($attribution['landing_url'] ?? '');
$lines[] = 'Recebido em: ' . date('d/m/Y H:i');
$lines[] = 'WhatsApp direto: https://wa.me/55' . $phoneDigits;

$subject = 'Novo lead no site: ' . $clean['company'];
$body = implode("\n", $lines);
$safeReply = filter_var($clean['email'], FILTER_VALIDATE_EMAIL) ? $clean['email'] : $config['notify_from'];

$mailed = send_notification($config, $subject, $body, $safeReply, $clean['name']);
if (!$mailed) {
    // O lead já está gravado no JSONL; registra e segue.
    error_log('[lead] falha no envio do e-mail para ' . $config['notify_to']);
}
// Guarda no registro se o e-mail saiu, para dar para auditar depois.
$record['mail_sent'] = $mailed;
file_put_contents($dataDir . '/leads-' . date('Y-m') . '.jsonl', json_encode($record, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

// ---------- Meta Conversions API (opcional, só com consentimento) ----------

$capi = $config['meta_capi'] ?? [];
if (!empty($capi['access_token']) && $consent === 'granted') {
    $hash = static fn (string $v): string => hash('sha256', $v);
    $nameParts = preg_split('/\s+/u', mb_strtolower($clean['name']), -1, PREG_SPLIT_NO_EMPTY);
    $userData = array_filter([
        'em' => [$hash($clean['email'])],
        'ph' => [$hash('55' . $phoneDigits)],
        'fn' => [$hash($nameParts[0] ?? '')],
        'ln' => [$hash(end($nameParts) ?: '')],
        'ct' => [$hash(preg_replace('/[^a-z]/', '', iconv('UTF-8', 'ASCII//TRANSLIT', mb_strtolower($clean['city'])) ?: ''))],
        'st' => [$hash(mb_strtolower($clean['uf']))],
        'country' => [$hash('br')],
        'client_ip_address' => $ip,
        'client_user_agent' => mb_substr((string)($tracking['user_agent'] ?? ''), 0, 400),
        'fbp' => $tracking['fbp'] ?? null,
        'fbc' => $tracking['fbc'] ?? null,
    ]);
    $event = [
        'event_name' => 'Lead',
        'event_time' => (int)($tracking['event_time'] ?? time()),
        'event_id' => $eventId,
        'action_source' => 'website',
        'event_source_url' => mb_substr((string)($tracking['event_source_url'] ?? ''), 0, 500),
        'user_data' => $userData,
        // Sem segmento/faturamento: a Meta proíbe dados financeiros ou de saúde nos eventos.
        'custom_data' => [
            'content_name' => 'ZT Digital — Assessoria de marketing',
            'lead_type' => 'contato_comercial',
        ],
    ];
    $body = ['data' => [$event]];
    if (!empty($capi['test_event_code'])) $body['test_event_code'] = $capi['test_event_code'];

    $url = sprintf('https://graph.facebook.com/%s/%s/events?access_token=%s', $capi['api_version'], rawurlencode($capi['pixel_id']), rawurlencode($capi['access_token']));
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
    ]);
    $result = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($status < 200 || $status >= 300) {
        error_log('[lead] CAPI falhou: HTTP ' . $status . ' ' . mb_substr((string)$result, 0, 300));
    }
}

respond(200, ['ok' => true]);
