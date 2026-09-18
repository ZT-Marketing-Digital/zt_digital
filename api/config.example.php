<?php
// Copie para config.php (NÃO versionado) e ajuste. Fica fora do alcance público via api/.htaccess.

return [
    // Quem recebe a notificação de novo lead.
    'notify_to' => 'contato@ztdigital.com.br',
    // Remetente: use uma caixa do próprio domínio, criada no cPanel (evita cair em spam).
    'notify_from' => 'noreply@ztdigital.com.br',
    'notify_from_name' => 'Site ZT Digital',

    // Origens aceitas no POST (proteção básica contra envio de outros sites).
    'allowed_origins' => [
        'https://ztdigital.com.br',
        'https://www.ztdigital.com.br',
    ],

    // Limite por IP: no máximo N envios a cada janela (segundos).
    'rate_limit_max' => 5,
    'rate_limit_window' => 600,

    // Pasta onde os leads ficam gravados em JSONL (backup do e-mail) e os contadores de rate limit.
    // Protegida por api/data/.htaccess. Pode ser movida para fora do public_html.
    'data_dir' => __DIR__ . '/data',

    // Meta Conversions API (opcional). Deixe o token vazio para desligar.
    // O evento usa o mesmo event_id do Pixel no navegador (deduplicação).
    // Só é enviado quando o visitante aceitou a medição no banner (consent_tracking = granted).
    'meta_capi' => [
        'pixel_id' => '1400437541519673',
        'access_token' => '',
        'test_event_code' => '', // ex.: TEST12345 enquanto valida no Events Manager
        'api_version' => 'v25.0', // atual em set/2026; conferir em developers.facebook.com/docs/graph-api/changelog
    ],
];
