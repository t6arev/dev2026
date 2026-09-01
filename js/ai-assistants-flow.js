(function () {
    'use strict';

    function pageY() {
        return window.scrollY || document.documentElement.scrollTop || 0;
    }

    function initVerbRotation() {
        var verb = document.getElementById('flowVerb');
        if (!verb) return;
        var words = ['консультирует', 'следит за клиентами', 'отвечает', 'создаёт КП', 'анализирует'];
        var i = 0;
        setInterval(function () {
            i = (i + 1) % words.length;
            verb.textContent = words[i];
        }, 1800);
    }

    function initBlackTheme() {
        if (!document.body.classList.contains('flow-page')) return;

        var directions = document.getElementById('directions');
        var themeLock = document.getElementById('themeLock');
        var themeLatched = false;
        var scrollTick = 0;

        function setThemeActive(on) {
            document.body.classList.toggle('flow-theme-black', !!on);
        }

        function updateThemeFromScroll() {
            var lockEl = themeLock || directions;
            if (!lockEl) {
                setThemeActive(true);
                return;
            }
            var y = pageY();
            var lockTop = lockEl.offsetTop;
            var lockAt = Math.max(0, lockTop - window.innerHeight * 0.55);
            var unlockAt = Math.max(0, (directions ? directions.offsetTop : lockTop) - window.innerHeight * 0.15);

            if (!themeLatched && y >= lockAt) themeLatched = true;
            if (themeLatched && y <= unlockAt) themeLatched = false;

            setThemeActive(themeLatched);
        }

        window.addEventListener('scroll', function () {
            if (scrollTick) return;
            scrollTick = requestAnimationFrame(function () {
                scrollTick = 0;
                updateThemeFromScroll();
            });
        }, { passive: true });
        window.addEventListener('resize', updateThemeFromScroll, { passive: true });
        updateThemeFromScroll();
    }

    function initProcessTrack() {
        var track = document.getElementById('processTrack');
        if (!track) return;

        var steps = Array.from(track.querySelectorAll('.process-step'));
        function syncProgress() {
            var done = steps.filter(function (s) { return s.classList.contains('is-in'); }).length;
            var p = steps.length ? done / steps.length : 0;
            track.style.setProperty('--process-progress', p.toFixed(4));
        }

        syncProgress();
        var mo = new MutationObserver(syncProgress);
        steps.forEach(function (s) {
            mo.observe(s, { attributes: true, attributeFilter: ['class'] });
        });
        window.addEventListener('scroll', syncProgress, { passive: true });
    }

    function boot() {
        initVerbRotation();
        initBlackTheme();
        initProcessTrack();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
