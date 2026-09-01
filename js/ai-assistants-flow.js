(function () {
    'use strict';

    function initVerbRotation() {
        var verb = document.getElementById('flowVerb');
        if (!verb) return;

        var words = ['консультирует', 'отвечает', 'создаёт КП', 'анализирует'];
        var i = 0;
        var swapping = false;

        setInterval(function () {
            if (swapping) return;
            swapping = true;
            i = (i + 1) % words.length;

            verb.style.opacity = '0';
            window.setTimeout(function () {
                verb.textContent = words[i];
                verb.style.opacity = '1';
                swapping = false;
            }, 260);
        }, 2200);
    }

    function initCollageLightbox() {
        document.querySelectorAll('.case-collage [data-open-image]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var src = btn.getAttribute('data-open-image');
                if (!src || typeof openLightbox !== 'function') return;
                openLightbox(src);
            });
        });
    }

    function initBlackTheme() {
        if (!document.body.classList.contains('flow-page')) return;

        var trigger = document.getElementById('themeLock') || document.getElementById('directions');
        if (!trigger) return;

        var isBlack = false;

        function setTheme(on) {
            var next = !!on;
            if (isBlack === next) return;
            isBlack = next;
            document.body.classList.toggle('flow-theme-black', next);
        }

        if ('IntersectionObserver' in window) {
            var lineRatio = 0.48;

            function updateFromGeometry() {
                var rect = trigger.getBoundingClientRect();
                setTheme(rect.top < window.innerHeight * lineRatio);
            }

            var observer = new IntersectionObserver(function () {
                updateFromGeometry();
            }, {
                root: null,
                threshold: [0, 0.01, 0.25, 0.5, 0.75, 1]
            });

            observer.observe(trigger);
            window.addEventListener('scroll', updateFromGeometry, { passive: true });
            window.addEventListener('resize', updateFromGeometry, { passive: true });
            updateFromGeometry();
            return;
        }

        var latched = false;
        function updateThemeFromScroll() {
            var y = window.scrollY || document.documentElement.scrollTop || 0;
            var lockTop = trigger.offsetTop;
            var lockAt = Math.max(0, lockTop - window.innerHeight * 0.52);
            var unlockAt = Math.max(0, lockTop - window.innerHeight * 0.2);
            if (!latched && y >= lockAt) latched = true;
            if (latched && y <= unlockAt) latched = false;
            setTheme(latched);
        }

        window.addEventListener('scroll', updateThemeFromScroll, { passive: true });
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
        initCollageLightbox();
        initBlackTheme();
        initProcessTrack();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
