/* ==========================================================================
   RobotScrollHero — full-page scroll-driven video backdrop
   ========================================================================== */
(function () {
    'use strict';

    var MEDIA = {
        intrinsicW: 1280,
        intrinsicH: 720
    };

    // Normalized against the source frame (object-fit: cover remapped in JS).
    var visorRect = {
        centerX: 0.5,
        centerY: 0.43,
        width: 0.36,
        height: 0.016
    };

    var root = document.getElementById('robotScrollHero');
    if (!root) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var debugMode = /(?:\?|&)robotDebug=1(?:&|$)/.test(window.location.search);

    var sticky = root.querySelector('.robot-scroll-sticky');
    var media = root.querySelector('.robot-scroll-media');
    var video = root.querySelector('.robot-scroll-video');
    // prefer the high-quality local source if present
    try {
        if (video && video.dataset) {
            video.dataset.srcHq = video.dataset.srcHq || '/assets/motion/robot-source-hq.mp4';
        }
    } catch (e) { /* ignore */ }

    // Lazy-load video & choose best source based on network/screen
    function prefersHighQuality() {
        try {
            var et = navigator.connection && navigator.connection.effectiveType;
            if (et) {
                if (et === '4g') return true;
                if (et.indexOf('2g') === 0 || et.indexOf('slow-2g') === 0) return false;
            }
        } catch (e) { /* ignore */ }
        // for mobile we still allow video; prefer high quality on wide screens
        return window.innerWidth >= 1200;
    }

    function canPlayWebM() {
        try {
            var vid = document.createElement('video');
            return !!(vid.canPlayType && (vid.canPlayType('video/webm; codecs=\"vp9\"') || vid.canPlayType('video/webm')));
        } catch (e) { return false; }
    }

    function pickSource() {
        if (!video || !video.dataset) return null;
        // prefer webm on fast connections if supported
        if (canPlayWebM() && prefersHighQuality() && video.dataset.srcWebm) return video.dataset.srcWebm;
        if (prefersHighQuality() && video.dataset.srcHq) return video.dataset.srcHq;
        return video.dataset.srcLite || video.dataset.srcHq || video.dataset.srcWebm;
    }

    // Only initialize heavy video loading when hero is near viewport
    var heroObserver = null;
    function initWhenVisible() {
        if (!video) return;
        // if already loaded, skip
        if (video.getAttribute('data-loaded') === '1') return;
        var src = pickSource();
        if (src) {
            video.src = src;
            try { video.load(); } catch (_) {}
            video.setAttribute('data-loaded', '1');
        }
    }

    if ('IntersectionObserver' in window) {
        heroObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    initWhenVisible();
                    // once loaded, no need to observe
                    if (heroObserver) heroObserver.disconnect();
                }
            });
        }, { root: null, threshold: 0.05 });
        heroObserver.observe(root);
    } else {
        // fallback: init immediately
        initWhenVisible();
    }
    var finalImg = root.querySelector('.robot-scroll-final');
    var poster = root.querySelector('.robot-scroll-poster');
    var dim = root.querySelector('.robot-scroll-dim');
    var glow = root.querySelector('.robot-scroll-visor-glow');
    var reveal = root.querySelector('.robot-scroll-reveal');
    var readability = root.querySelector('.robot-scroll-readability');
    var copy = root.querySelector('.robot-scroll-copy .hero-main');

    if (!sticky || !media || !video || !finalImg || !copy) return;

    // Only apply hero-wide body class on the homepage (avoid affecting case pages)
    try {
        var path = (window.location && window.location.pathname) || '';
        var isHome = path === '/' || /index\\.html?$/.test(path);
        if (isHome) document.body.classList.add('has-robot-hero');
    } catch (e) {
        // fallback: do not add class
    }

    var duration = 0;
    var ready = false;
    var rafId = 0;
    var displayedTime = 0;
    var progress = 0;
    var targetProgress = 0;
    var active = true;
    var lastSetTime = -1;
    var debugEls = null;
    var scrubEase = 0.38; // higher = tighter to scroll (less lag)

    function clamp(v, a, b) {
        return v < a ? a : (v > b ? b : v);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function smoothstep(edge0, edge1, x) {
        var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }

    function getObjectPosition() {
        var styles = getComputedStyle(root);
        var x = parseFloat(styles.getPropertyValue('--robot-obj-x')) || 50;
        var y = parseFloat(styles.getPropertyValue('--robot-obj-y')) || 45;
        return { x: x / 100, y: y / 100 };
    }

    function getCoverLayout(viewW, viewH) {
        var pos = getObjectPosition();
        var scale = Math.max(viewW / MEDIA.intrinsicW, viewH / MEDIA.intrinsicH);
        var w = MEDIA.intrinsicW * scale;
        var h = MEDIA.intrinsicH * scale;
        var left = (viewW - w) * pos.x;
        var top = (viewH - h) * pos.y;
        return { left: left, top: top, width: w, height: h, scale: scale };
    }

    function visorInViewport(cover) {
        return {
            x: cover.left + visorRect.centerX * cover.width,
            y: cover.top + visorRect.centerY * cover.height,
            w: Math.max(2, visorRect.width * cover.width),
            h: Math.max(1, visorRect.height * cover.height)
        };
    }

    // Scrub across most of the homepage so the robot keeps moving while browsing.
    function measureProgress() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (max <= 1) return 0;
        return clamp(window.scrollY / max, 0, 1);
    }

    function mapVideoTime(p) {
        if (!duration) return 0;
        var end = Math.max(0, duration - 0.05);
        if (p <= 0.02) return 0;
        if (p <= 0.72) return end * ((p - 0.02) / 0.7);
        return end;
    }

    function applyCurrentTime(time) {
        if (!ready || !isFinite(time)) return;
        var next = clamp(time, 0, Math.max(0, duration - 0.001));
        // Skip microscopic seeks; keep threshold low so scroll feels locked to frames.
        if (Math.abs(next - lastSetTime) < 0.006) return;
        lastSetTime = next;
        try {
            // Prefer fastSeek — no play/pause thrash (was causing scroll lag).
            if (typeof video.fastSeek === 'function') {
                video.fastSeek(next);
            } else {
                video.currentTime = next;
            }
        } catch (_) {
            try { video.currentTime = next; } catch (__) { /* ignore */ }
        }
    }

    function updateScene(p) {
        progress = clamp(p, 0, 1);
        var viewW = window.innerWidth;
        var viewH = window.innerHeight;
        var cover = getCoverLayout(viewW, viewH);
        var band = visorInViewport(cover);

        // Hero copy fades as cases approach
        var textOut = smoothstep(0.06, 0.24, progress);
        copy.style.opacity = String(1 - textOut);
        copy.style.transform = 'translateY(' + (-18 * textOut).toFixed(2) + 'px)';
        copy.style.filter = 'none';
        copy.style.pointerEvents = textOut > 0.85 ? 'none' : 'auto';

        var readHero = 1 - smoothstep(0.05, 0.24, progress);
        var readPage = smoothstep(0.16, 0.42, progress) * 0.5;
        readability.style.opacity = String(clamp(readHero + readPage, 0, 0.88));

        var target = mapVideoTime(progress);
        displayedTime = lerp(displayedTime, target, scrubEase);

        // ensure final frame locks after 0.72 — soft crossfade, no double stack
        if (progress < 0.70) {
            finalImg.style.opacity = '0';
            video.style.opacity = '1';
            applyCurrentTime(displayedTime);
        } else {
            applyCurrentTime(mapVideoTime(0.72));
            var cross = smoothstep(0.70, 0.84, progress);
            finalImg.style.opacity = String(cross);
            video.style.opacity = String(1 - cross);
        }

        // Push into the visor across the full page (softer scale ramp)
        var scaleT = smoothstep(0.38, 1, progress);
        var scale = lerp(1, 1.14, scaleT);
        media.style.transform = 'scale(' + scale.toFixed(4) + ')';
        media.style.transformOrigin = '50% 42%';

        // Kill extra red glow before FAQ / "5 направлений" to avoid double-image look
        var glowPulse = smoothstep(0.52, 0.68, progress) * (1 - smoothstep(0.72, 0.82, progress));
        glow.style.left = band.x + 'px';
        glow.style.top = band.y + 'px';
        glow.style.width = (band.w * 2.2) + 'px';
        glow.style.height = Math.max(28, band.h * 10) + 'px';
        glow.style.opacity = String(glowPulse * 0.55);

        // Stronger veil late in the page so content sits cleanly over the robot
        var veil = smoothstep(0.38, 0.72, progress);
        var deepVeil = smoothstep(0.72, 0.92, progress);
        reveal.style.opacity = String(clamp(veil * 0.72 + deepVeil * 0.35, 0, 0.95));
        dim.style.background = 'rgba(3, 5, 10, ' + (veil * 0.22 + deepVeil * 0.28).toFixed(3) + ')';

        if (debugEls) updateDebug(band);
    }

    function tick() {
        rafId = 0;
        if (!active) return;
        targetProgress = measureProgress();
        var prev = progress;
        var prevTime = displayedTime;
        updateScene(lerp(progress, targetProgress, 0.52));
        // Keep animating until progress + video time settle (short inertia, not lag)
        var unsettled =
            Math.abs(targetProgress - progress) > 0.0008 ||
            Math.abs(mapVideoTime(targetProgress) - displayedTime) > 0.012 ||
            Math.abs(progress - prev) > 0.0003 ||
            Math.abs(displayedTime - prevTime) > 0.006;
        if (unsettled) requestTick();
    }

    function requestTick() {
        if (rafId) return;
        rafId = requestAnimationFrame(tick);
    }

    function onScroll() {
        if (!active || prefersReduced) return;
        targetProgress = measureProgress();
        requestTick();
    }

    function onResize() {
        MEDIA.intrinsicW = video.videoWidth || MEDIA.intrinsicW;
        MEDIA.intrinsicH = video.videoHeight || MEDIA.intrinsicH;
        requestTick();
    }

    function setupDebug() {
        var outline = document.createElement('div');
        outline.className = 'robot-debug-outline';
        sticky.appendChild(outline);

        var panel = document.createElement('div');
        panel.className = 'robot-debug';
        panel.innerHTML =
            '<h4>Robot visor debug</h4>' +
            '<div class="robot-debug-stats"></div>' +
            '<label><span>centerX</span><input type="range" min="0.2" max="0.8" step="0.001" data-k="centerX"><span data-v="centerX"></span></label>' +
            '<label><span>centerY</span><input type="range" min="0.2" max="0.8" step="0.001" data-k="centerY"><span data-v="centerY"></span></label>' +
            '<label><span>width</span><input type="range" min="0.05" max="0.9" step="0.001" data-k="width"><span data-v="width"></span></label>' +
            '<label><span>height</span><input type="range" min="0.004" max="0.08" step="0.001" data-k="height"><span data-v="height"></span></label>' +
            '<button type="button" data-copy>Copy visorRect</button>';
        document.body.appendChild(panel);

        Array.prototype.forEach.call(panel.querySelectorAll('input[type="range"]'), function (input) {
            input.value = String(visorRect[input.dataset.k]);
            input.addEventListener('input', function () {
                visorRect[input.dataset.k] = parseFloat(input.value);
                requestTick();
            });
        });

        panel.querySelector('[data-copy]').addEventListener('click', function () {
            var text =
                'const visorRect = {\n' +
                '  centerX: ' + visorRect.centerX + ',\n' +
                '  centerY: ' + visorRect.centerY + ',\n' +
                '  width: ' + visorRect.width + ',\n' +
                '  height: ' + visorRect.height + ',\n' +
                '};';
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text);
            } else {
                window.prompt('Copy visorRect', text);
            }
        });

        debugEls = {
            outline: outline,
            stats: panel.querySelector('.robot-debug-stats'),
            values: panel.querySelectorAll('[data-v]')
        };
    }

    function updateDebug(band) {
        if (!debugEls) return;
        debugEls.outline.style.left = band.x + 'px';
        debugEls.outline.style.top = band.y + 'px';
        debugEls.outline.style.width = band.w + 'px';
        debugEls.outline.style.height = Math.max(band.h, 2) + 'px';
        debugEls.stats.textContent =
            'progress: ' + progress.toFixed(3) +
            '\ntime: ' + (video.currentTime || 0).toFixed(3) + ' / ' + duration.toFixed(3);
        Array.prototype.forEach.call(debugEls.values, function (el) {
            el.textContent = Number(visorRect[el.getAttribute('data-v')]).toFixed(3);
        });
    }

    function enableReduced() {
        root.classList.add('is-reduced', 'is-ready');
        poster.style.opacity = '1';
        video.style.display = 'none';
        finalImg.style.opacity = '0';
        copy.style.opacity = '1';
        copy.style.filter = 'none';
        copy.style.transform = 'none';
        active = false;
    }

    function onReady() {
        if (ready) return;
        duration = video.duration || 8;
        MEDIA.intrinsicW = video.videoWidth || MEDIA.intrinsicW;
        MEDIA.intrinsicH = video.videoHeight || MEDIA.intrinsicH;
        ready = true;
        root.classList.add('is-ready');
        // Ensure the video layer is visible and poster/final are hidden so the
        // decoded frames can be painted to the canvas/viewport immediately.
        try {
            video.style.display = 'block';
            video.style.opacity = '1';
        } catch (_) { /* ignore */ }
        try { poster.style.opacity = '0'; } catch (_) { /* ignore */ }
        try { finalImg.style.opacity = '0'; } catch (_) { /* ignore */ }

        // Pause and seek to start frame, then kick the render loop.
        video.pause();
        applyCurrentTime(0);
        requestTick();
    }

    function warmDecoder() {
        // Some browsers only paint seeked frames after a play/pause cycle.
        function finish() {
            // Wait until the media reports a real seekable range.
            var tries = 0;
            (function waitSeekable() {
                var ok = video.seekable && video.seekable.length && video.seekable.end(0) > 0.5;
                if (ok || tries > 40) {
                    onReady();
                    return;
                }
                tries += 1;
                setTimeout(waitSeekable, 50);
            })();
        }

        var p = video.play();
        if (p && typeof p.then === 'function') {
            p.then(function () {
                video.pause();
                finish();
            }).catch(function () {
                finish();
            });
        } else {
            try { video.pause(); } catch (_) { /* ignore */ }
            finish();
        }
    }

    function init() {
        if (prefersReduced) {
            enableReduced();
            return;
        }

        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.preload = 'auto';
        video.controls = false;
        video.disablePictureInPicture = true;

        video.addEventListener('loadeddata', warmDecoder, { once: true });
        video.addEventListener('error', function () {
            root.classList.add('is-ready');
            poster.style.opacity = '1';
            video.style.opacity = '0';
        });

        // Kick network fetch if needed
        try { video.load(); } catch (_) { /* ignore */ }
        if (video.readyState >= 2) warmDecoder();
        else if (video.readyState >= 1) {
            video.addEventListener('canplay', warmDecoder, { once: true });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);

        if (debugMode) setupDebug();
        requestTick();
    }

    init();
})();
