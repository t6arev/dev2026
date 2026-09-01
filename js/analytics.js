(function () {
    var counterId = Number(window.SITE_CONFIG && window.SITE_CONFIG.metrikaId) || 106920579;
    var tagSrc = 'https://mc.yandex.ru/metrika/tag.js';

    // Loader (same as homepage). Skip inserting tag.js if it is already on the page.
    (function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
        m[i].l = 1 * new Date();
        for (var j = 0; j < document.scripts.length; j++) {
            if (document.scripts[j].src === r) { return; }
        }
        k = e.createElement(t);
        a = e.getElementsByTagName(t)[0];
        k.async = 1;
        k.src = r;
        a.parentNode.insertBefore(k, a);
    })(window, document, 'script', tagSrc, 'ym');

    // Single init per page (head snippet and/or this file).
    if (!window.__ymInit106920579) {
        window.__ymInit106920579 = true;
        ym(counterId, 'init', {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true
        });
    }

    function reachGoal(goal) {
        if (!goal || typeof ym !== 'function') return;
        try {
            ym(counterId, 'reachGoal', goal);
        } catch (_) { /* ignore */ }
    }

    window.trackMetrikaGoal = reachGoal;

    function isT6arevTelegramLink(href) {
        var raw = String(href || '').trim();
        if (!raw) return false;
        if (/^tg:/i.test(raw)) {
            return /t6arev/i.test(raw);
        }
        try {
            var u = new URL(raw, window.location.origin);
            var host = (u.hostname || '').replace(/^www\./i, '').toLowerCase();
            if (host !== 't.me') return false;
            var path = (u.pathname || '').replace(/\/+$/, '').toLowerCase();
            return path === '/t6arev';
        } catch (_) {
            return /(?:^|\/\/)(?:www\.)?t\.me\/t6arev(?:[/?#]|$)/i.test(raw);
        }
    }

    // telegram_click: fire first, then allow default navigation (do not preventDefault).
    document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a') : null;
        if (!a) return;
        if (isT6arevTelegramLink(a.getAttribute('href'))) {
            reachGoal('telegram_click');
        }
    }, true);
})();
