/* ==========================================================================
   motion.js — calm DOM/CSS motion system for homepage
   ========================================================================== */
(function () {
    'use strict';

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var processSection = null;
    var processTrack = null;
    var scrollTicking = false;
    var pointerTicking = false;
    var pointer = { x: 0, y: 0 };

    function clamp(v, a, b) {
        return v < a ? a : (v > b ? b : v);
    }

    function pad(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    function updatePageMotion() {
        scrollTicking = false;

        var doc = document.documentElement;
        var maxScroll = (doc.scrollHeight - window.innerHeight) || 1;
        var scrollProgress = clamp(window.scrollY / maxScroll, 0, 1);

        var bar = document.querySelector('.scroll-progress');
        if (bar) bar.style.setProperty('--sp', scrollProgress.toFixed(4));

        document.body.style.setProperty('--scroll-soft', scrollProgress.toFixed(4));

        updateHud();
        updateProcessScrollLink();
        updateServiceHeroParallax();
    }

    function updateServiceHeroParallax() {
        if (prefersReduced || window.matchMedia('(max-width: 768px)').matches) return;
        if (!document.body.classList.contains('service-page')) return;
        var visual = document.getElementById('serviceHeroVisual');
        if (!visual) return;

        var rect = visual.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh) return;

        var center = rect.top + rect.height * 0.5;
        var norm = clamp((center - vh * 0.5) / vh, -1, 1);
        var scrollY = norm * -10;
        var mx = parseFloat(getComputedStyle(document.body).getPropertyValue('--mx')) || 0;
        var my = parseFloat(getComputedStyle(document.body).getPropertyValue('--my')) || 0;
        var pointerX = mx * 6;
        var pointerY = my * 4;

        visual.style.setProperty('--hero-parallax-x', pointerX.toFixed(2) + 'px');
        visual.style.setProperty('--hero-parallax-y', (scrollY + pointerY).toFixed(2) + 'px');
    }

    function updateAmbientBreathe() {
        if (prefersReduced) return;
        var t = performance.now() * 0.00032;
        var breathe = 0.5 + 0.5 * Math.sin(t);
        document.body.style.setProperty('--bg-breathe', breathe.toFixed(4));
    }

    function startAmbientBreathe() {
        if (prefersReduced) return;
        function tick() {
            updateAmbientBreathe();
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function requestScrollUpdate() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(updatePageMotion);
    }

    function initPointerParallax() {
        if (prefersReduced || window.matchMedia('(max-width: 768px)').matches) return;

        window.addEventListener('pointermove', function (event) {
            pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
            pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
            if (pointerTicking) return;
            pointerTicking = true;
            requestAnimationFrame(function () {
                pointerTicking = false;
                document.body.style.setProperty('--mx', pointer.x.toFixed(3));
                document.body.style.setProperty('--my', pointer.y.toFixed(3));
                updateServiceHeroParallax();
            });
        }, { passive: true });
    }

    function initReveal() {
        var els = document.querySelectorAll('[data-reveal]');
        if (!els.length) return;

        els.forEach(function (el) {
            var delay = Number(el.getAttribute('data-delay') || 0);
            if (delay) el.style.setProperty('--reveal-delay', (delay * 0.08).toFixed(2) + 's');
        });

        if (prefersReduced || !('IntersectionObserver' in window)) {
            els.forEach(function (el) { el.classList.add('is-in'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

        els.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.92) {
                el.classList.add('is-in');
                return;
            }
            io.observe(el);
        });
    }

    function updateHud() {
        var counter = document.querySelector('.hud-counter');
        if (!counter) return;

        var sections = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
        if (!sections.length) return;

        var marker = window.scrollY + window.innerHeight * 0.4;
        var active = 0;
        for (var i = 0; i < sections.length; i++) {
            if (sections[i].offsetTop <= marker) active = i;
        }

        var label = sections[active].getAttribute('data-count') || '';
        counter.innerHTML = '<b>' + pad(active + 1) + '</b> / ' + pad(sections.length) + ' — ' + label;
    }

    function updateProcessScrollLink() {
        if (!processSection || !processTrack) return;

        var rect = processSection.getBoundingClientRect();
        var vh = window.innerHeight || 1;
        var isServiceTimeline = processTrack.classList.contains('service-process-track');

        if (isServiceTimeline) {
            var seen = clamp((vh * 0.78 - rect.top) / ((rect.height || 1) + vh * 0.35), 0, 1);
            processTrack.style.setProperty('--process-progress', seen.toFixed(4));
            return;
        }

        var raw = clamp((vh * 0.72 - rect.top) / (rect.height || 1), 0, 1);
        var progress = clamp(raw * 1.12, 0, 1);
        var steps = Array.prototype.slice.call(processTrack.querySelectorAll('.process-step'));
        var activeFloat = progress * Math.max(steps.length - 1, 1);

        processTrack.style.setProperty('--process-progress', progress.toFixed(4));

        steps.forEach(function (step, i) {
            var isActive = i <= Math.round(activeFloat);
            step.classList.toggle('is-in', isActive);
            step.classList.toggle('was-in', i < Math.round(activeFloat));
        });
    }

    function initHeroRotator() {
        var root = document.getElementById('heroRotator');
        if (!root) return;

        var words = root.querySelectorAll('.hero-rotator-word');
        if (words.length < 2) return;

        var index = 0;
        setInterval(function () {
            words[index].classList.remove('is-visible');
            index = (index + 1) % words.length;
            words[index].classList.add('is-visible');
        }, 2600);
    }

    function closeMobileMenu() {
        document.body.classList.remove('nav-open');
        document.body.style.overflow = '';
        var toggle = document.querySelector('.nav-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    function initMobileMenu() {
        if (document.body.dataset.mobileMenuBound === '1') return;
        document.body.dataset.mobileMenuBound = '1';

        document.addEventListener('click', function (e) {
            var toggle = e.target.closest('.nav-toggle');
            if (toggle) {
                e.preventDefault();
                var open = document.body.classList.toggle('nav-open');
                document.body.style.overflow = open ? 'hidden' : '';
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                return;
            }

            var menuLink = e.target.closest('#mobileMenu a');
            if (!menuLink) return;

            var href = menuLink.getAttribute('href') || '';
            closeMobileMenu();

            if (href.indexOf('#') === -1) return;

            var hashIndex = href.indexOf('#');
            var path = href.slice(0, hashIndex) || window.location.pathname;
            var hash = href.slice(hashIndex);
            var samePage = !path || path === window.location.pathname || path === '/' + window.location.pathname.replace(/^\//, '');

            if (!samePage) return;

            if (hash.length > 1) {
                e.preventDefault();
                if (window.location.hash !== hash) {
                    history.pushState(null, '', hash);
                }
                requestAnimationFrame(function () {
                    var target = document.querySelector(hash);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            }
        });
    }

    window.initMobileMenu = initMobileMenu;
    window.closeMobileMenu = closeMobileMenu;

    function runStepCounter(card, el, target, step, duration, startFrom) {
        var values = [];
        var start = startFrom || 0;
        var v;

        if (start > 0) {
            for (v = start; v <= target; v += step) {
                values.push(v);
            }
        } else {
            for (v = step; v <= target; v += step) {
                values.push(v);
            }
        }

        if (!values.length) {
            el.textContent = String(target);
            card.classList.add('is-complete');
            return;
        }

        var index = 0;
        var stepMs = Math.max(70, duration / Math.max(values.length - 1, 1));
        el.textContent = String(values[0]);
        card.classList.add('is-active');

        function tick() {
            index += 1;
            if (index >= values.length) {
                el.textContent = String(target);
                el.classList.remove('is-tick');
                card.classList.add('is-complete');
                return;
            }
            el.textContent = String(values[index]);
            el.classList.remove('is-tick');
            void el.offsetWidth;
            el.classList.add('is-tick');
            setTimeout(tick, stepMs);
        }

        if (values.length > 1) {
            setTimeout(tick, stepMs);
        } else {
            card.classList.add('is-complete');
        }
    }

    function initAboutStats() {
        var grid = document.querySelector('.about-highlights');
        if (!grid) return;

        var cards = grid.querySelectorAll('.about-stat');
        if (!cards.length) return;

        function finishCard(card) {
            card.classList.add('is-active', 'is-complete');
            var counter = card.querySelector('.stat-counter');
            var target = parseInt(card.getAttribute('data-stat-target') || '0', 10);
            if (counter && target) counter.textContent = String(target);
        }

        function animateCard(card) {
            if (card.classList.contains('is-active')) return;

            var type = card.getAttribute('data-stat-type');
            if (type === 'text') {
                card.classList.add('is-active', 'is-complete');
                return;
            }

            var counter = card.querySelector('.stat-counter');
            if (!counter) return;

            var target = parseInt(card.getAttribute('data-stat-target') || '0', 10);
            var step = parseInt(card.getAttribute('data-stat-step') || '1', 10);
            var start = parseInt(card.getAttribute('data-stat-start') || '0', 10);
            var duration = parseInt(card.getAttribute('data-stat-duration') || '0', 10);

            if (!duration) {
                if (target <= 10) duration = 900;
                else if (target <= 100) duration = 1100;
                else duration = 950;
            }

            runStepCounter(card, counter, target, step, duration, start);
        }

        if (prefersReduced) {
            cards.forEach(finishCard);
            return;
        }

        if (!('IntersectionObserver' in window)) {
            cards.forEach(function (card, i) {
                setTimeout(function () { animateCard(card); }, i * 80);
            });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var pending = entry.target.querySelectorAll('.about-stat:not(.is-active)');
                pending.forEach(function (card, i) {
                    setTimeout(function () { animateCard(card); }, i * 50);
                });
                io.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px 14% 0px' });

        io.observe(grid);
    }

    function initFaqMotion() {
        var roots = Array.prototype.slice.call(document.querySelectorAll('#faq, #service-faq'));
        if (!roots.length) return;

        var items = [];
        for (var r = 0; r < roots.length; r++) {
            items = items.concat(Array.prototype.slice.call(roots[r].querySelectorAll('.faq-item')));
        }
        if (!items.length) return;

        var fromDirs = ['right', 'left', 'right', 'left', 'right', 'left'];
        var isMobile = window.matchMedia('(max-width: 768px)').matches;
        var stagger = isMobile ? 45 : 65;

        items.forEach(function (item, index) {
            item.setAttribute('data-faq-from', fromDirs[index % fromDirs.length]);
        });

        function revealItem(item, delay) {
            setTimeout(function () {
                item.classList.add('is-in');
                var cleanup = function (e) {
                    if (e && e.propertyName !== 'transform') return;
                    item.style.willChange = 'auto';
                    item.removeEventListener('transitionend', cleanup);
                };
                item.addEventListener('transitionend', cleanup);
                setTimeout(cleanup, 900);
            }, delay);
        }

        if (prefersReduced || !('IntersectionObserver' in window)) {
            items.forEach(function (item) { item.classList.add('is-in'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var item = entry.target;
                var idx = Number(item.dataset.faqIndex || 0);
                revealItem(item, idx * stagger);
                io.unobserve(item);
            });
        }, {
            threshold: isMobile ? 0.18 : 0.12,
            rootMargin: '0px 0px 10% 0px'
        });

        items.forEach(function (item, index) {
            if (item.dataset.faqMotionBound === '1') return;
            item.dataset.faqMotionBound = '1';
            item.dataset.faqIndex = String(index);
            var rect = item.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
                revealItem(item, index * stagger);
                return;
            }
            io.observe(item);
        });
    }

    window.initFaqMotion = initFaqMotion;

    function bindServiceProcessTimeline() {
        processSection = document.getElementById('service-steps') || processSection;
        processTrack = document.getElementById('serviceStepsTimeline') || processTrack;
        updateProcessScrollLink();
    }

    window.bindServiceProcessTimeline = bindServiceProcessTimeline;

    function bindServiceProcessScrollSteps() {
        var track = document.getElementById('serviceStepsTimeline');
        if (!track || track.dataset.scrollBound === '1') return;
        track.dataset.scrollBound = '1';

        var steps = Array.prototype.slice.call(track.querySelectorAll('.process-step'));
        if (!steps.length) return;

        if (prefersReduced) {
            steps.forEach(function (step) { step.classList.add('is-in'); });
            track.style.setProperty('--process-progress', '1');
            return;
        }

        var ticking = false;

        function updateSteps() {
            ticking = false;
            var trackRect = track.getBoundingClientRect();
            var vh = window.innerHeight || 1;
            var progress = clamp((vh * 0.72 - trackRect.top) / ((trackRect.height || 1) + vh * 0.25), 0, 1);
            track.style.setProperty('--process-progress', progress.toFixed(4));

            steps.forEach(function (step) {
                var rect = step.getBoundingClientRect();
                var marker = rect.top + rect.height * 0.35;
                var visible = marker <= vh * 0.82;
                step.classList.toggle('is-in', visible);
            });
        }

        function requestStepUpdate() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updateSteps);
        }

        updateSteps();
        window.addEventListener('scroll', requestStepUpdate, { passive: true });
        window.addEventListener('resize', requestStepUpdate, { passive: true });
    }

    window.bindServiceProcessScrollSteps = bindServiceProcessScrollSteps;

    function initServiceAudienceRotator(pool) {
        var root = document.querySelector('.service-audience-rotator');
        if (!root || !pool || !pool.length || root.dataset.rotatorBound === '1') return;
        root.dataset.rotatorBound = '1';

        var slots = Array.prototype.slice.call(root.querySelectorAll('.service-audience-slot'));
        if (!slots.length) return;

        var offset = 0;

        function setSlotLabel(slot, poolIndex) {
            var label = slot.querySelector('.service-audience-label');
            if (!label) return;
            var next = pool[poolIndex % pool.length];
            if (label.textContent === next) return;

            label.classList.remove('is-in');
            label.classList.add('is-out');
            setTimeout(function () {
                label.textContent = next;
                label.classList.remove('is-out');
                label.classList.add('is-in', 'is-tick');
                setTimeout(function () { label.classList.remove('is-tick'); }, 220);
            }, 180);
        }

        function rotate() {
            offset = (offset + 1) % pool.length;
            slots.forEach(function (slot, i) {
                setSlotLabel(slot, offset + i);
            });
        }

        if (prefersReduced) return;
        setInterval(rotate, 3200);
    }

    window.initServiceAudienceRotator = initServiceAudienceRotator;

    function initServiceCasesMotion() {
        var section = document.getElementById('service-cases');
        if (!section || section.dataset.casesMotionBound === '1') return;
        section.dataset.casesMotionBound = '1';

        var cards = section.querySelectorAll('.service-case-card');
        if (!cards.length || prefersReduced) return;

        section.addEventListener('mousemove', function (e) {
            var rect = section.getBoundingClientRect();
            var px = (e.clientX - rect.left) / (rect.width || 1) - 0.5;
            var py = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
            cards.forEach(function (card, i) {
                var depth = 1 + (i % 3) * 0.15;
                card.style.setProperty('--case-tilt-x', (py * -4 * depth).toFixed(2) + 'deg');
                card.style.setProperty('--case-tilt-y', (px * 5 * depth).toFixed(2) + 'deg');
            });
        });

        section.addEventListener('mouseleave', function () {
            cards.forEach(function (card) {
                card.style.setProperty('--case-tilt-x', '0deg');
                card.style.setProperty('--case-tilt-y', '0deg');
            });
        });
    }

    window.initServiceCasesMotion = initServiceCasesMotion;

    function initWebglMotion() {
        var canvas = document.getElementById('motionWebgl');
        if (!canvas || prefersReduced) return;

        var gl = canvas.getContext('webgl', { alpha: true, antialias: true });
        if (!gl) return;

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, 'attribute vec2 a_position; attribute vec4 a_color; varying vec4 v_color; void main(){ gl_Position = vec4(a_position, 0.0, 1.0); v_color = a_color; }');
        gl.compileShader(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, 'precision mediump float; varying vec4 v_color; void main(){ gl_FragColor = v_color; }');
        gl.compileShader(fragmentShader);

        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        var buffer = gl.createBuffer();
        var positionLocation = gl.getAttribLocation(program, 'a_position');
        var colorLocation = gl.getAttribLocation(program, 'a_color');
        var vertices = [];
        var width = 1;
        var height = 1;
        var dpr = Math.min(window.devicePixelRatio || 1, 1.6);

        function collectAnchors() {
            var list = [];
            var heroEl = document.querySelector('.hero-visual');
            var heroFallback = document.querySelector('.motion-hero');
            if (heroEl) {
                list.push({
                    el: heroEl,
                    fallbackEl: heroFallback,
                    kind: 'hero',
                    isShowcase: false,
                    isExpanded: false,
                    customColor: null
                });
            }
            document.querySelectorAll('.service-slide-visual[data-webgl-kind]').forEach(function (el) {
                var colorAttr = el.getAttribute('data-webgl-color');
                var customColor = null;
                if (colorAttr) {
                    var parts = colorAttr.split(',').map(Number);
                    if (parts.length === 3 && parts.every(function (n) { return !isNaN(n); })) {
                        customColor = parts;
                    }
                }
                list.push({
                    el: el,
                    fallbackEl: null,
                    kind: el.getAttribute('data-webgl-kind') || 'hero',
                    isShowcase: true,
                    isExpanded: false,
                    customColor: customColor
                });
            });
            return list;
        }

        function isMobileLayout() {
            return (window.innerWidth || 0) <= 900;
        }

        function getAnchorRect(anchor) {
            if (anchor.kind === 'hero' && !anchor.isShowcase && isMobileLayout() && anchor.fallbackEl) {
                return anchor.fallbackEl.getBoundingClientRect();
            }
            if (anchor.el) {
                return anchor.el.getBoundingClientRect();
            }
            return { top: 0, left: 0, width: 0, height: 0, bottom: 0 };
        }

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        function resize() {
            width = window.innerWidth || 1;
            height = window.innerHeight || 1;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        function pushVertex(x, y, color, alpha) {
            vertices.push((x / width) * 2 - 1, 1 - (y / height) * 2, color[0], color[1], color[2], alpha);
        }

        function addLine(x1, y1, x2, y2, color, alpha) {
            pushVertex(x1, y1, color, alpha);
            pushVertex(x2, y2, color, alpha);
        }

        var heroIntroAt = performance.now();

        function rotate3(p, ax, ay, az) {
            var x = p[0], y = p[1], z = p[2];
            var cx = Math.cos(ax), sx = Math.sin(ax);
            var cy = Math.cos(ay), sy = Math.sin(ay);
            var cz = Math.cos(az), sz = Math.sin(az);
            var y1 = y * cx - z * sx;
            var z1 = y * sx + z * cx;
            var x2 = x * cy + z1 * sy;
            var z2 = -x * sy + z1 * cy;
            return [x2 * cz - y1 * sz, x2 * sz + y1 * cz, z2];
        }

        function projectPoint(p, rect, scale, time, kind, scrollBoost) {
            var isHero = kind === 'hero';
            var rotY = isHero ? time * 0.3 + scrollBoost * 0.22 : time * 0.16 + (kind === 'web' ? -0.7 : 0.25);
            var rotX = isHero
                ? 0.32 + Math.sin(time * 0.62) * 0.05 + scrollBoost * 0.08
                : 0.35 + Math.sin(time * 0.35) * 0.08;
            var rotZ = kind === 'phone' ? -0.12 : (isHero ? 0.06 + scrollBoost * 0.05 : 0.05);
            var rot = rotate3(p, rotX, rotY, rotZ);
            var depth = 520 / (520 + rot[2] * scale);
            return {
                x: rect.left + rect.width * 0.5 + rot[0] * scale * depth,
                y: rect.top + rect.height * 0.5 - rot[1] * scale * depth,
                z: rot[2],
                depth: depth
            };
        }

        function surface(kind, u, v, time) {
            var a = (u - 0.5) * Math.PI * 2;
            var b = (v - 0.5) * Math.PI;
            var breathe = 1 + Math.sin(time * 1.1 + u * 5 + v * 4) * 0.025;

            if (kind === 'phone') {
                return [(u - 0.5) * 1.05, (v - 0.5) * 1.85, Math.sin(u * Math.PI) * 0.16 + Math.cos(v * Math.PI * 2) * 0.05];
            }
            if (kind === 'brain') {
                var r = 0.72 + Math.sin(a * 3 + time * 0.5) * 0.08 + Math.cos(b * 4) * 0.06;
                return [Math.cos(a) * Math.cos(b) * r * 1.05, Math.sin(b) * r * 0.82, Math.sin(a) * Math.cos(b) * r * 0.74];
            }
            if (kind === 'integration') {
                var ring = 0.72 + Math.sin(a * 6 + time * 0.5) * 0.035;
                return [Math.cos(a) * ring, (v - 0.5) * 0.36 + Math.sin(a * 2) * 0.08, Math.sin(a) * ring * 0.62];
            }
            if (kind === 'web') {
                return [(u - 0.5) * 1.7, (v - 0.5) * 1.05, Math.sin(u * Math.PI * 2) * 0.08 + Math.cos(v * Math.PI * 2) * 0.04];
            }
            if (kind === 'custom') {
                var diamond = 1 - Math.abs(v - 0.5) * 0.95;
                return [Math.cos(a) * diamond * 0.78, (v - 0.5) * 1.4, Math.sin(a) * diamond * 0.78];
            }
            if (kind === 'hero') {
                var pulse = 0.94 + Math.sin(time * 1.45 + u * 3 + v * 3) * 0.022;
                return [Math.cos(a) * Math.cos(b) * pulse, Math.sin(b) * pulse, Math.sin(a) * Math.cos(b) * pulse];
            }
            return [Math.cos(a) * Math.cos(b) * breathe, Math.sin(b) * breathe, Math.sin(a) * Math.cos(b) * breathe];
        }

        function getHeroBuild(rect, scroll) {
            var intro = clamp((performance.now() - heroIntroAt) / 1500, 0, 1);
            var introEase = intro * intro * (3 - 2 * intro);
            var leave = clamp((Math.max(0, -rect.top + height * 0.08)) / (rect.height * 0.72), 0, 1);
            var leaveEase = leave * leave;
            var scrollPull = clamp(scroll * 1.2, 0, 1) * 0.14;
            return clamp(introEase * (1 - leaveEase * 0.98 - scrollPull * 0.12), 0, 1);
        }

        function drawTriangleEdge(rect, kind, points, localProgress, time, color, alpha, scrollBoost, buildProgress) {
            var isHero = kind === 'hero';
            var center = [
                (points[0][0] + points[1][0] + points[2][0]) / 3,
                (points[0][1] + points[1][1] + points[2][1]) / 3,
                (points[0][2] + points[1][2] + points[2][2]) / 3
            ];
            var scatterAmount = isHero ? 1.28 : 0.62;
            var scatter = (1 - localProgress) * scatterAmount;
            if (isHero && buildProgress < 0.98) {
                scatter += (1 - buildProgress) * 0.85;
            }
            var mobileHero = isHero && isMobileLayout();
            var scale = Math.min(rect.width, rect.height) * (mobileHero ? 0.58 : (isHero ? 0.48 : 0.42));
            var projected = points.map(function (point) {
                var wobble = isHero ? Math.sin(time * 1.2 + center[1] * 3) * 0.008 * localProgress : Math.sin(time + center[1] * 4) * 0.02;
                var drift = [
                    point[0] + center[0] * scatter + wobble,
                    point[1] + center[1] * scatter,
                    point[2] + center[2] * scatter
                ];
                return projectPoint(drift, rect, scale, time, kind, scrollBoost);
            });
            var edgeAlpha = alpha * localProgress * (isHero ? 0.92 + projected[0].depth * 0.18 : 1);
            addLine(projected[0].x, projected[0].y, projected[1].x, projected[1].y, color, edgeAlpha);
            addLine(projected[1].x, projected[1].y, projected[2].x, projected[2].y, color, edgeAlpha);
            addLine(projected[2].x, projected[2].y, projected[0].x, projected[0].y, color, edgeAlpha * (isHero ? 0.88 : 0.74));
        }

        function getShowcaseBuild(rect, isExpanded) {
            var center = rect.top + rect.height * 0.5;
            var dist = Math.abs(center - window.innerHeight * 0.48);
            var vis = clamp(1 - dist / (window.innerHeight * 0.62), 0, 1);
            var scroll = clamp((clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height * 0.5), 0, 1) - 0.08) * 1.4, 0, 1);
            var build = Math.max(vis * 0.85, scroll);
            return isExpanded ? Math.max(build, 0.92) : build;
        }

        function getServiceCardBuild(rect, isOpen) {
            var vis = clamp((clamp((height - rect.top) / (height + rect.height * 0.6), 0, 1) - 0.04) * 1.55, 0, 1);
            return isOpen ? Math.max(vis, 0.94) : vis * 0.88;
        }

        function drawTessellation(anchor, time) {
            var rect = getAnchorRect(anchor);
            if (rect.bottom < -180 || rect.top > height + 180 || rect.width < 8) return;

            var isHero = anchor.kind === 'hero' && !anchor.isShowcase;
            var isShowcase = anchor.isShowcase;
            var meshKind = anchor.kind;
            var scroll = Number(getComputedStyle(document.body).getPropertyValue('--scroll-soft')) || 0;
            var scrollBoost = isHero ? clamp(scroll * 1.1, 0, 1) : (isShowcase ? clamp(scroll * 0.5, 0, 1) : 0);
            var build = isHero
                ? getHeroBuild(rect, scroll)
                : (isShowcase
                    ? getShowcaseBuild(rect, anchor.isExpanded)
                    : clamp((clamp((height - rect.top) / (height + rect.height), 0, 1) - 0.12) * 1.45, 0, 1));
            var rows = isHero ? 12 : (isShowcase ? (anchor.isExpanded ? 12 : 10) : 7);
            var cols = isHero ? 16 : (isShowcase ? (anchor.isExpanded ? 14 : 12) : 10);
            var blue = [0.34, 0.62, 0.96];
            var white = [0.88, 0.92, 0.98];
            var heroColor = anchor.customColor || [0.64, 0.84, 1.0];
            var color = isHero
                ? heroColor
                : (meshKind === 'brain' || meshKind === 'custom' ? white : (anchor.customColor || blue));
            var alpha = isHero ? 0.44 : (isShowcase ? (meshKind === 'phone' ? 0.42 : 0.32) : 0.24);
            var drawKind = isHero ? 'hero' : meshKind;

            for (var y = 0; y < rows; y++) {
                for (var x = 0; x < cols; x++) {
                    var u = x / cols;
                    var v = y / rows;
                    var p1 = surface(meshKind, u, v, time);
                    var p2 = surface(meshKind, (x + 1) / cols, v, time);
                    var p3 = surface(meshKind, u, (y + 1) / rows, time);
                    var p4 = surface(meshKind, (x + 1) / cols, (y + 1) / rows, time);
                    var delay = (x + y) / (rows + cols) * (isHero || isShowcase ? 0.28 : 0.34);
                    var local = clamp((build - delay) * (isHero || isShowcase ? 2.4 : 1.9), 0, 1);
                    if (local > 0) {
                        drawTriangleEdge(rect, drawKind, [p1, p2, p3], local, time, color, alpha, scrollBoost, build);
                        drawTriangleEdge(rect, drawKind, [p2, p4, p3], local, time, color, alpha * (isHero || isShowcase ? 0.92 : 0.85), scrollBoost, build);
                    }
                }
            }
        }

        function render(now) {
            var time = now * 0.001;
            vertices.length = 0;
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            collectAnchors().forEach(function (anchor) {
                drawTessellation(anchor, time);
            });

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 24, 0);
            gl.enableVertexAttribArray(colorLocation);
            gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 24, 8);
            gl.drawArrays(gl.LINES, 0, vertices.length / 6);
            requestAnimationFrame(render);
        }

        resize();
        window.addEventListener('resize', resize, { passive: true });
        requestAnimationFrame(render);
    }

    function initServicesSlideMotion() {
        var items = document.querySelectorAll('.service-slide');
        if (!items.length) return;

        var ticking = false;
        function update() {
            ticking = false;
            var vh = window.innerHeight;
            items.forEach(function (item) {
                var rect = item.getBoundingClientRect();
                var raw = clamp((vh - rect.top) / (vh * 1.15), 0, 1);
                var p = raw * raw * (3 - 2 * raw);
                item.style.setProperty('--p', p.toFixed(4));
            });
        }

        function requestUpdate() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        document.addEventListener('services:home-rendered', function () {
            items = document.querySelectorAll('.service-slide');
            update();
        });
        update();
    }

    function initServicesSlideReveal() {
        var root = document.querySelector('#services');
        if (!root) return;

        var isMobile = window.matchMedia('(max-width: 768px)').matches;
        var stagger = isMobile ? 40 : 60;
        var io = null;

        function bindSlides() {
            var slides = root.querySelectorAll('.service-slide');
            if (!slides.length) return;

            function revealSlide(slide, delay) {
                setTimeout(function () {
                    slide.classList.add('is-in');
                }, delay);
            }

            if (prefersReduced || !('IntersectionObserver' in window)) {
                slides.forEach(function (slide) { slide.classList.add('is-in'); });
                return;
            }

            if (io) io.disconnect();
            io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var slide = entry.target;
                    var idx = Number(slide.dataset.index || 0);
                    revealSlide(slide, idx * stagger);
                    io.unobserve(slide);
                });
            }, {
                threshold: isMobile ? 0.2 : 0.14,
                rootMargin: '0px 0px 8% 0px'
            });

            slides.forEach(function (slide) {
                if (!slide.classList.contains('is-in')) io.observe(slide);
            });
        }

        bindSlides();
        document.addEventListener('services:home-rendered', bindSlides);
    }

    function initServicePageLists() {
        if (!document.body.classList.contains('service-page')) return;

        var isMobile = window.matchMedia('(max-width: 768px)').matches;

        function revealNode(node, delay) {
            setTimeout(function () {
                node.classList.add('is-in');
            }, delay);
        }

        function bindRows(selector, stagger, options) {
            options = options || {};
            var nodes = document.querySelectorAll(selector);
            if (!nodes.length || nodes[0].dataset.motionBound === '1') return;

            nodes.forEach(function (node) {
                node.dataset.motionBound = '1';
            });

            if (prefersReduced || !('IntersectionObserver' in window)) {
                nodes.forEach(function (node) { node.classList.add('is-in'); });
                return;
            }

            var root = nodes[0].closest('.service-block');
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var node = entry.target;
                    var idx = Number(node.getAttribute(options.indexAttr || 'data-type-index') || 0);
                    revealNode(node, idx * stagger);
                    io.unobserve(node);
                });
            }, {
                threshold: isMobile ? 0.16 : 0.1,
                rootMargin: '0px 0px 8% 0px'
            });

            nodes.forEach(function (node) {
                var nodeRect = node.getBoundingClientRect();
                if (nodeRect.top < window.innerHeight * 0.92 && nodeRect.bottom > 0) {
                    var idx = Number(node.getAttribute(options.indexAttr || 'data-type-index') || 0);
                    revealNode(node, idx * stagger);
                    return;
                }
                io.observe(node);
            });
        }

        bindRows('.service-type-row', isMobile ? 55 : 75, { indexAttr: 'data-type-index' });
        bindRows('.service-problem-item', isMobile ? 40 : 60, { indexAttr: 'data-problem-index' });
        bindRows('.service-case-card', isMobile ? 50 : 80, { indexAttr: 'data-case-index' });
    }

    window.initServicePageLists = initServicePageLists;

    function refreshMotionReveal(root) {
        var scope = root || document;
        var els = scope.querySelectorAll('[data-reveal]:not(.is-in)');
        if (!els.length) return;

        if (prefersReduced || !('IntersectionObserver' in window)) {
            els.forEach(function (el) { el.classList.add('is-in'); });
            return;
        }

        els.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.94) {
                el.classList.add('is-in');
            }
        });
    }

    window.refreshMotionReveal = refreshMotionReveal;

    function boot() {
        document.body.classList.add('motion-ready');
        var isCasePage = document.body.classList.contains('case-page');
        var isLightPage = document.body.classList.contains('service-page') ||
            document.body.classList.contains('services-hub-page');

        if (!isCasePage) {
            processSection = document.getElementById('process') || document.getElementById('service-steps');
            processTrack = document.getElementById('processTrack') || document.getElementById('serviceStepsTimeline');
        }

        initPointerParallax();

        if (!isCasePage && !isLightPage) {
            initWebglMotion();
            initAboutStats();
            initHeroRotator();
            initServicesSlideMotion();
            initServicesSlideReveal();
        }

        initReveal();
        initFaqMotion();
        initServicePageLists();
        if (document.body.classList.contains('service-page') && typeof bindServiceProcessScrollSteps === 'function') {
            bindServiceProcessScrollSteps();
        }
        initMobileMenu();
        updatePageMotion();
        startAmbientBreathe();

        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
        window.addEventListener('resize', requestScrollUpdate, { passive: true });
    }

    if (document.readyState === 'complete') {
        boot();
    } else {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    }
})();
