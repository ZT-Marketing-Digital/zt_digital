<?php

/**
 * Exemplo do config do backend do formulário.
 *
 * ATENÇÃO: em produção este arquivo é GERADO PELO DEPLOY a partir dos secrets
 * do GitHub (ver .github/workflows/deploy.yml). Ele existe aqui como
 * documentação e para rodar o endpoint fora do CI — copie para `config.php`,
 * que está no .gitignore e nunca é versionado.
 */

return [
    // Quem recebe o lead. Pode ser uma lista.
    'notify_to' => ['ztagenciamktdigital@gmail.com'],

    // Remetente: precisa ser a caixa autenticada no SMTP, senão o Gmail trata
    // como falsificação. O e-mail de quem preencheu vai no Reply-To.
    'notify_from' => 'noreply@ztdigital.com.br',
    'notify_from_name' => 'Site ZT Digital',

    // Origens aceitas no POST.
    'allowed_origins' => [
        'https://ztdigital.com.br',
        'https://www.ztdigital.com.br',
    ],

    // Anti-spam
    'rate_limit_max' => 5,        // envios por IP...
    'rate_limit_window' => 600,   // ...nesta janela, em segundos
    'segundos_minimos_no_form' => 3, // envio mais rápido que isso é robô

    // Leads em JSONL + contadores do limite. Protegida pelo .htaccess.
    'data_dir' => __DIR__ . '/data',

    // SMTP autenticado (PHPMailer). Sem host, cai no mail() do servidor.
    //   caixa criada no cPanel  → mail.ztdigital.com.br, porta 465, SSL
    //   plano de e-mail grátis  → smtp.titan.email, porta 465, SSL
    //   se a 465 estiver bloqueada → porta 587 (STARTTLS)
    'smtp' => [
        'host' => 'mail.ztdigital.com.br',
        'port' => 465,
        'user' => 'noreply@ztdigital.com.br',
        'pass' => 'SUA_SENHA_AQUI',
    ],

    // Meta Conversions API (opcional). Sem token, fica desligada.
    // Usa o mesmo event_id do Pixel no navegador (deduplicação) e só dispara
    // quando o visitante aceitou a medição no banner.
    'meta_capi' => [
        'pixel_id' => '1400437541519673',
        'access_token' => '',
        'test_event_code' => '', // ex.: TEST12345 enquanto valida no Events Manager
        'api_version' => 'v25.0',
    ],
];
