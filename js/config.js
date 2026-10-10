window.SITE_CONFIG = {
    siteUrl: 'https://dev2026.ru',
    imgBase: '/assets/img/',
    // Основное лого для favicon/brand-сигналов в поиске.
    brandLogo: 'assets/brand/logo.jpg',
    brandLogoFallback: 'assets/brand/logo.jpg',
    // Public HTTPS path: RU nginx (snoviai) → VPS :8080 → Node :3001.
    // Direct sslip.io:443 TLS is filtered on many networks.
    apiUrl: 'https://snoviai.ru/dev2026-leads/api/leads',
    // Local/dev override: when site is opened from localhost, prefer direct VPS Node (bot path).
    apiUrlLocal: 'http://153.80.242.53:3001/api/leads',
    telegramLeadUsername: 't6arev',
    telegramTargetChatId: '8519277765',
    // Never open personal t.me — leads must go through the bot API only.
    allowTelegramFallback: false,
    metrikaId: 106920579,
    background: {
        // Easy rollback: switch to 'simple' if advanced V2 feels too busy.
        particlePreset: 'advanced'
    }
};
