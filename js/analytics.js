(function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
    k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

ym(window.SITE_CONFIG.metrikaId, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true
});

(function () {
    const counterId = window.SITE_CONFIG.metrikaId;

    document.addEventListener('click', function (e) {
        const a = e.target && e.target.closest ? e.target.closest('a') : null;
        if (!a) return;
        const href = (a.getAttribute('href') || '').trim();
        if (!href) return;

        const isTelegram =
            href.startsWith('https://t.me/') ||
            href.startsWith('http://t.me/') ||
            href.startsWith('tg://') ||
            href.includes('t.me/');

        if (isTelegram && typeof ym === 'function') {
            ym(counterId, 'reachGoal', 'tg_click');
        }
    }, true);
})();
