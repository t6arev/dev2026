(function () {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const preset = window.SITE_CONFIG?.background?.particlePreset || 'advanced';
    const mouse = { x: 0, y: 0, active: false };

    const NEON = [
        { dot: 'rgba(56, 189, 248, 0.95)', line: 'rgba(56, 189, 248,', glow: 'rgba(34, 211, 238, 0.95)' },
        { dot: 'rgba(96, 165, 250, 0.95)', line: 'rgba(96, 165, 250,', glow: 'rgba(59, 130, 246, 0.9)' },
        { dot: 'rgba(167, 139, 250, 0.92)', line: 'rgba(167, 139, 250,', glow: 'rgba(139, 92, 246, 0.88)' },
        { dot: 'rgba(192, 132, 252, 0.88)', line: 'rgba(192, 132, 252,', glow: 'rgba(168, 85, 247, 0.82)' }
    ];

    const PRESETS = {
        simple: {
            mouseRadius: 120,
            mouseStrength: prefersReduced || isMobile ? 0 : 0.014,
            parallaxStrength: 0,
            pulseChance: 0,
            layers: [
                {
                    count: isMobile ? 16 : 28,
                    linkDistance: isMobile ? 100 : 130,
                    baseSpeed: prefersReduced ? 0 : (isMobile ? 0.15 : 0.25),
                    drift: prefersReduced ? 0 : 0.012,
                    radius: [0.7, 1.4],
                    alpha: 0.38,
                    shadowBlur: 12,
                    lineShadowBlur: 6
                }
            ]
        },
        advanced: {
            mouseRadius: 135,
            mouseStrength: prefersReduced || isMobile ? 0 : 0.01,
            parallaxStrength: prefersReduced || isMobile ? 0 : 14,
            pulseChance: prefersReduced ? 0 : (isMobile ? 0.0025 : 0.006),
            layers: [
                {
                    count: isMobile ? 7 : 18,
                    linkDistance: isMobile ? 92 : 115,
                    baseSpeed: prefersReduced ? 0 : (isMobile ? 0.11 : 0.18),
                    drift: prefersReduced ? 0 : 0.018,
                    radius: [0.8, 1.6],
                    alpha: 0.34,
                    shadowBlur: 14,
                    lineShadowBlur: 8
                },
                {
                    count: isMobile ? 4 : 12,
                    linkDistance: isMobile ? 120 : 155,
                    baseSpeed: prefersReduced ? 0 : (isMobile ? 0.06 : 0.1),
                    drift: prefersReduced ? 0 : 0.01,
                    radius: [0.5, 1.05],
                    alpha: 0.18,
                    shadowBlur: 8,
                    lineShadowBlur: 4,
                    depth: 0.55
                }
            ]
        }
    };

    const config = PRESETS[preset] || PRESETS.advanced;
    let particles = [];
    let width = 0;
    let height = 0;
    let animId = null;
    let running = true;

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function pickNeon() {
        return NEON[Math.floor(Math.random() * NEON.length)];
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
        particles = [];
        config.layers.forEach((layer, layerIndex) => {
            for (let i = 0; i < layer.count; i++) {
                const angle = rand(0, Math.PI * 2);
                const speed = rand(0.3, 1) * layer.baseSpeed;
                particles.push({
                    x: rand(0, width),
                    y: rand(0, height),
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    r: rand(layer.radius[0], layer.radius[1]),
                    neon: pickNeon(),
                    wander: rand(0, Math.PI * 2),
                    wanderSpeed: rand(0.008, 0.03),
                    layerIndex,
                    layer,
                    pulse: 0
                });
            }
        });
    }

    function getParallaxOffset(depth) {
        if (!mouse.active || !config.parallaxStrength) return { x: 0, y: 0 };
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = (mouse.x - centerX) / centerX;
        const dy = (mouse.y - centerY) / centerY;
        return {
            x: dx * config.parallaxStrength * depth,
            y: dy * config.parallaxStrength * depth
        };
    }

    function drawDot(p) {
        const depth = p.layer.depth || 1;
        const offset = getParallaxOffset(depth);
        ctx.save();
        ctx.shadowBlur = p.layer.shadowBlur;
        ctx.shadowColor = p.neon.glow;
        ctx.beginPath();
        ctx.arc(p.x + offset.x, p.y + offset.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.neon.dot;
        ctx.fill();
        ctx.restore();
    }

    function updateParticle(p) {
        if (p.layer.baseSpeed <= 0) return;

        p.wander += p.wanderSpeed;
        p.vx += Math.cos(p.wander) * p.layer.drift;
        p.vy += Math.sin(p.wander * 1.37) * p.layer.drift;

        if (Math.random() < 0.006) {
            p.vx += rand(-0.06, 0.06);
            p.vy += rand(-0.06, 0.06);
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        if (mouse.active && config.mouseStrength > 0) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < config.mouseRadius && dist > 0) {
                const force = (config.mouseRadius - dist) / config.mouseRadius;
                p.vx += (dx / dist) * force * config.mouseStrength;
                p.vy += (dy / dist) * force * config.mouseStrength;
            }
        }

        const maxSpeed = p.layer.baseSpeed * 3.2;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > maxSpeed) {
            p.vx = (p.vx / speed) * maxSpeed;
            p.vy = (p.vy / speed) * maxSpeed;
        }

        if (p.pulse > 0) p.pulse *= 0.92;
    }

    function drawLink(p1, p2, alpha) {
        const depth = Math.min(p1.layer.depth || 1, p2.layer.depth || 1);
        const offset = getParallaxOffset(depth);
        const pulsed = Math.random() < config.pulseChance;
        const pulseBoost = pulsed ? 0.22 : 0;
        if (pulsed) {
            p1.pulse = 1;
            p2.pulse = 1;
        }

        ctx.save();
        ctx.shadowBlur = p1.layer.lineShadowBlur + (pulsed ? 8 : 0);
        ctx.shadowColor = p1.neon.glow;
        ctx.strokeStyle = `${p1.neon.line}${Math.min(alpha + pulseBoost, 0.7)})`;
        ctx.lineWidth = pulsed ? 1.15 : 0.8;
        ctx.beginPath();
        ctx.moveTo(p1.x + offset.x, p1.y + offset.y);
        ctx.lineTo(p2.x + offset.x, p2.y + offset.y);
        ctx.stroke();
        ctx.restore();
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            updateParticle(p);

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const linkDistance = Math.min(p.layer.linkDistance, p2.layer.linkDistance);
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.hypot(dx, dy);
                if (dist < linkDistance) {
                    const alpha = (1 - dist / linkDistance) * Math.min(p.layer.alpha, p2.layer.alpha);
                    drawLink(p, p2, alpha);
                }
            }

            drawDot(p);
            if (p.pulse > 0.02) {
                ctx.save();
                ctx.shadowBlur = 20;
                ctx.shadowColor = p.neon.glow;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * (1.2 + p.pulse), 0, Math.PI * 2);
                ctx.fillStyle = `${p.neon.line}${0.08 * p.pulse})`;
                ctx.fill();
                ctx.restore();
            }
        }

        if (running) animId = requestAnimationFrame(draw);
    }

    function onMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    }

    function onMouseLeave() {
        mouse.active = false;
    }

    function onVisibilityChange() {
        if (document.hidden) {
            running = false;
            if (animId) cancelAnimationFrame(animId);
        } else {
            running = true;
            draw();
        }
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });

    if (!isMobile && !prefersReduced) {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseleave', onMouseLeave);
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
})();
