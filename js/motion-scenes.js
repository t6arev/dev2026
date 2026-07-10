/* ==========================================================================
   motion-scenes.js — 3D iPhone-силуэт (референс), пустой экран, без обрезки
   ========================================================================== */
(function () {
    'use strict';

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scenes = [];
    var rafId = 0;
    var CANVAS_PAD = 0.24;
    var HERO_CYCLE = 9;

    function clamp(v, a, b) {
        return v < a ? a : (v > b ? b : v);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function ease(t) {
        return t * t * (3 - 2 * t);
    }

    function rotateY3(x, y, z, a) {
        var c = Math.cos(a);
        var s = Math.sin(a);
        return [x * c + z * s, y, -x * s + z * c];
    }

    function rotateX3(x, y, z, a) {
        var c = Math.cos(a);
        var s = Math.sin(a);
        return [x, y * c - z * s, y * s + z * c];
    }

    function rotate3(x, y, z, rotX, rotY) {
        var p = rotateY3(x, y, z, rotY);
        return rotateX3(p[0], p[1], p[2], rotX);
    }

    function project3(p, focal) {
        var f = focal / (focal + p[2]);
        return { x: p[0] * f, y: -p[1] * f, z: p[2], f: f };
    }

    function roundRectPerimeter(cx, cy, w, h, rad, z, arcSegs) {
        var pts = [];
        var r = Math.min(rad, w / 2, h / 2);
        var x0 = cx - w / 2;
        var y0 = cy - h / 2;

        function arc(ax, ay, a0, a1) {
            for (var i = 0; i <= arcSegs; i++) {
                var a = a0 + (a1 - a0) * (i / arcSegs);
                pts.push([ax + Math.cos(a) * r, ay + Math.sin(a) * r, z]);
            }
        }

        arc(x0 + r, y0 + r, Math.PI, Math.PI * 1.5);
        arc(x0 + w - r, y0 + r, Math.PI * 1.5, Math.PI * 2);
        arc(x0 + w - r, y0 + h - r, 0, Math.PI * 0.5);
        arc(x0 + r, y0 + h - r, Math.PI * 0.5, Math.PI);
        return pts;
    }

    function drawPolyline3D(ctx, points, tp, alpha, width, close) {
        if (points.length < 2 || alpha < 0.02) return;
        var proj = points.map(function (p) { return tp(p[0], p[1], p[2]); });
        var depth = 0;
        proj.forEach(function (p) { depth += p.f; });
        depth /= proj.length;

        ctx.strokeStyle = 'rgba(210, 225, 245, ' + (alpha * clamp(depth, 0.55, 1.12)) + ')';
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(proj[0].x, proj[0].y);
        for (var i = 1; i < proj.length; i++) {
            ctx.lineTo(proj[i].x, proj[i].y);
        }
        if (close !== false) ctx.closePath();
        ctx.stroke();
    }

    function drawLine3D(ctx, a, b, tp, alpha, width) {
        var p1 = tp(a[0], a[1], a[2]);
        var p2 = tp(b[0], b[1], b[2]);
        var depth = (p1.f + p2.f) * 0.5;
        if (alpha * depth < 0.02) return;
        ctx.strokeStyle = 'rgba(200, 218, 240, ' + (alpha * depth) + ')';
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    function fillQuad3D(ctx, quad, tp, fillStyle) {
        var p = quad.map(function (v) { return tp(v[0], v[1], v[2]); });
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (var i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
        ctx.closePath();
        ctx.fill();
    }

    /** iPhone-силуэт с выраженной 3D-глубиной */
    function drawPhoneWire3D(ctx, cx, cy, unit, rotX, rotY, build) {
        var hw = 72;
        var hh = 148;
        var hd = 22;
        var focal = 260;
        var scatter = (1 - build) * 0.22;
        var frontZ = hd;
        var backZ = -hd;

        function tp(x, y, z) {
            var sx = x * (1 + scatter * 0.18);
            var sy = y * (1 + scatter * 0.18);
            var sz = z * (1 + scatter * 0.1);
            var r = rotate3(sx, sy, sz, rotX, rotY);
            var pr = project3(r, focal);
            return { x: cx + pr.x * unit, y: cy + pr.y * unit, f: pr.f };
        }

        var body = roundRectPerimeter(0, 0, hw * 2, hh * 2, 28, frontZ, 7);
        var bodyBack = roundRectPerimeter(0, 0, hw * 2, hh * 2, 28, backZ, 7);
        var bezel = roundRectPerimeter(0, 0, hw * 2 - 14, hh * 2 - 14, 24, frontZ + 0.5, 5);
        var screen = roundRectPerimeter(0, 0, hw * 2 - 24, hh * 2 - 24, 20, frontZ + 0.8, 4);
        var notchY = -hh + 22;
        var notch = roundRectPerimeter(0, notchY, 46, 11, 5, frontZ + 1, 3);

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        var sideA = 0.35 + build * 0.45;
        var cosY = Math.cos(rotY);

        if (Math.abs(rotY) > 0.06) {
            var visSide = rotY > 0 ? 1 : -1;
            var joints = [-hh + 24, -hh * 0.34, hh * 0.34, hh - 24];
            drawPolyline3D(ctx, bodyBack, tp, 0.18 + build * 0.28, 1.05);
            joints.forEach(function (jy, idx) {
                drawLine3D(
                    ctx,
                    [visSide * hw, jy, frontZ],
                    [visSide * hw, jy, backZ],
                    tp,
                    sideA * (idx % 2 ? 0.52 : 0.68),
                    1
                );
            });
        } else if (cosY < -0.15) {
            drawPolyline3D(ctx, bodyBack, tp, 0.16 + build * 0.2, 1);
        }

        drawPolyline3D(ctx, body, tp, 0.55 + build * 0.4, 2.2);
        drawPolyline3D(ctx, bezel, tp, 0.3 + build * 0.28, 1.2);
        drawPolyline3D(ctx, screen, tp, 0.2 + build * 0.18, 0.95);
        drawPolyline3D(ctx, notch, tp, 0.38 + build * 0.28, 1.05);

        ctx.restore();
    }

    function getSlideProgress(slideEl) {
        if (!slideEl) return 0;
        var rect = slideEl.getBoundingClientRect();
        var vh = window.innerHeight;
        return ease(clamp((vh - rect.top) / (vh * 1.15), 0, 1));
    }

    function drawNodeSphere(ctx, cx, cy, radius, t, alpha) {
        var pts = [];
        var total = 70;
        var i;
        var j;

        ctx.save();
        ctx.lineCap = 'round';

        for (i = 0; i < total; i++) {
            var lon = (i / total) * Math.PI * 2;
            var lat = Math.sin(i * 1.73) * 0.85;
            var wobble = Math.sin(t * 0.9 + i * 0.41) * 0.13;
            var x = cx + Math.cos(lon + wobble) * Math.cos(lat) * radius;
            var y = cy + Math.sin(lat * 1.35) * radius * 0.7 + Math.sin(lon * 1.4 - wobble) * radius * 0.14;
            pts.push([x, y]);
        }

        ctx.strokeStyle = 'rgba(190, 210, 245, ' + (0.16 * alpha) + ')';
        ctx.lineWidth = 0.75;
        for (i = 0; i < total; i += 2) {
            for (j = i + 3; j < total; j += 8) {
                var dx = pts[i][0] - pts[j][0];
                var dy = pts[i][1] - pts[j][1];
                if (dx * dx + dy * dy < radius * radius * 0.65) {
                    ctx.beginPath();
                    ctx.moveTo(pts[i][0], pts[i][1]);
                    ctx.lineTo(pts[j][0], pts[j][1]);
                    ctx.stroke();
                }
            }
        }

        ctx.fillStyle = 'rgba(230, 238, 255, ' + (0.44 * alpha) + ')';
        for (i = 0; i < total; i++) {
            ctx.beginPath();
            ctx.arc(pts[i][0], pts[i][1], 1.15, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawMeshRibbon(ctx, x, y, w, h, t, progress, alpha) {
        var cols = 10;
        var rows = 6;
        var pts = [];
        var i;
        var j;

        function idx(cx, cy) {
            return cy * (cols + 1) + cx;
        }

        for (j = 0; j <= rows; j++) {
            for (i = 0; i <= cols; i++) {
                var u = i / cols;
                var v = j / rows;
                var wave = Math.sin(t * 1.2 + u * 6.2 + v * 3.1) * 0.06;
                var swell = Math.cos(t * 0.72 + u * 4.6 - v * 2.8) * 0.07;
                pts.push([
                    x + u * w + (wave * h * 0.65),
                    y + v * h + (swell * h * 0.45) + Math.sin(t * 0.8 + u * 5.4) * 2.1
                ]);
            }
        }

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(168, 198, 246, ' + (alpha * (0.22 + progress * 0.28)) + ')';
        ctx.lineWidth = 0.85;

        for (j = 0; j < rows; j++) {
            for (i = 0; i < cols; i++) {
                var p1 = pts[idx(i, j)];
                var p2 = pts[idx(i + 1, j)];
                var p3 = pts[idx(i, j + 1)];
                if ((i + j) % 2) continue;

                ctx.beginPath();
                ctx.moveTo(p1[0], p1[1]);
                ctx.lineTo(p2[0], p2[1]);
                ctx.lineTo(p3[0], p3[1]);
                ctx.closePath();
                ctx.stroke();
            }
        }

        ctx.fillStyle = 'rgba(218, 232, 255, ' + (alpha * 0.46) + ')';
        for (i = 0; i < pts.length; i += 2) {
            ctx.beginPath();
            ctx.arc(pts[i][0], pts[i][1], 1.05, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawFloatingHud(ctx, x, y, w, h, alpha) {
        ctx.save();
        ctx.strokeStyle = 'rgba(170, 196, 245, ' + (0.42 * alpha) + ')';
        ctx.fillStyle = 'rgba(18, 26, 48, ' + (0.2 * alpha) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 10, y);
        ctx.lineTo(x + w - 10, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + 10);
        ctx.lineTo(x + w, y + h - 10);
        ctx.quadraticCurveTo(x + w, y + h, x + w - 10, y + h);
        ctx.lineTo(x + 10, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - 10);
        ctx.lineTo(x, y + 10);
        ctx.quadraticCurveTo(x, y, x + 10, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(214, 226, 252, ' + (0.35 * alpha) + ')';
        ctx.beginPath();
        ctx.moveTo(x + 14, y + 16);
        ctx.lineTo(x + w - 14, y + 16);
        ctx.moveTo(x + 14, y + 30);
        ctx.lineTo(x + w * 0.72, y + 30);
        ctx.moveTo(x + 14, y + 44);
        ctx.lineTo(x + w * 0.58, y + 44);
        ctx.stroke();
        ctx.restore();
    }

    function drawTelegramScene(ctx, w, h, t, p, slideEl) {
        if (!slideEl) {
            drawTelegramChatHero(ctx, w, h, t);
            return;
        }

        ctx.clearRect(0, 0, w, h);

        var progress = getSlideProgress(slideEl);
        var build = clamp(progress, 0, 1);

        if (build < 0.01 && p < 0.01) return;

        var idleY = prefersReduced ? 0 : Math.sin(t * 0.55) * 0.045;
        var idleX = prefersReduced ? 0 : Math.sin(t * 0.48 + 0.6) * 0.02;

        var rotY = lerp(-0.62, 0.72, build) + idleY + 0.16;
        var rotX = lerp(0.2, -0.08, build) + idleX;

        var cx = w * 0.69;
        var fit = Math.min((w * 0.54) / 176, (h * 0.92) / 350);
        var unit = fit * lerp(0.96, 1.02, build);
        var cy = h * 0.09 + 148 * unit;
        drawPhoneWire3D(ctx, cx, cy, unit, rotX, rotY, build);
    }

    var BOT_PHRASES = [
        'Здравствуйте! Чем можем помочь?',
        'Принял заявку — передам в CRM',
        'AI-ассистент уже отвечает'
    ];

    function roundRectPath(ctx, x, y, rw, rh, rad) {
        var r = Math.min(rad, rw / 2, rh / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + rw, y, x + rw, y + rh, r);
        ctx.arcTo(x + rw, y + rh, x, y + rh, r);
        ctx.arcTo(x, y + rh, x, y, r);
        ctx.arcTo(x, y, x + rw, y, r);
        ctx.closePath();
    }

    function truncateText(ctx, text, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) return text;
        var trimmed = text;
        while (trimmed.length > 1 && ctx.measureText(trimmed + '…').width > maxWidth) {
            trimmed = trimmed.slice(0, -1);
        }
        return trimmed + '…';
    }

    function getBotTypewriterText(t, phrases) {
        var charType = 0.048;
        var charDel = 0.03;
        var holdFull = 1.15;
        var holdEmpty = 0.35;
        var total = 0;
        var segments = phrases.map(function (text) {
            var typeDur = text.length * charType;
            var delDur = text.length * charDel;
            return { text: text, dur: holdEmpty + typeDur + holdFull + delDur + holdEmpty };
        });
        segments.forEach(function (s) { total += s.dur; });

        var local = t % total;
        var acc = 0;
        var i;

        for (i = 0; i < segments.length; i++) {
            var s = segments[i];
            if (local < acc + s.dur) {
                var phase = local - acc;
                var typeDur = s.text.length * charType;
                var chars = 0;
                var typing = false;

                if (phase < holdEmpty) {
                    chars = 0;
                } else if (phase < holdEmpty + typeDur) {
                    typing = true;
                    chars = Math.floor((phase - holdEmpty) / charType);
                } else if (phase < holdEmpty + typeDur + holdFull) {
                    chars = s.text.length;
                } else {
                    chars = s.text.length - Math.floor((phase - holdEmpty - typeDur - holdFull) / charDel);
                }

                chars = clamp(chars, 0, s.text.length);
                return {
                    text: s.text.substring(0, chars),
                    typing: typing
                };
            }
            acc += s.dur;
        }

        return { text: '', typing: false };
    }

    function drawHeroGlassBubble(ctx, x, y, w, h, radius, opts) {
        opts = opts || {};
        ctx.save();
        if (opts.alpha != null) ctx.globalAlpha = opts.alpha;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 36;
        ctx.shadowOffsetY = 6;

        roundRectPath(ctx, x, y, w, h, radius);
        if (opts.accent === 'user') {
            var userGrad = ctx.createLinearGradient(x, y, x + w, y + h);
            userGrad.addColorStop(0, 'rgba(59, 130, 246, 0.14)');
            userGrad.addColorStop(1, 'rgba(37, 99, 235, 0.06)');
            ctx.fillStyle = userGrad;
        } else if (opts.fill) {
            ctx.fillStyle = opts.fill;
        } else {
            var grad = ctx.createLinearGradient(x, y, x + w, y + h);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0.015)');
            ctx.fillStyle = grad;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.strokeStyle = opts.stroke || 'rgba(226, 232, 240, 0.05)';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        ctx.save();
        roundRectPath(ctx, x + 1, y + 1, w - 2, h * 0.45, radius - 1);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + radius, y + 1.5);
        ctx.lineTo(x + w - radius, y + 1.5);
        ctx.stroke();
        ctx.restore();

        if (opts.label) {
            ctx.font = opts.font || '500 16px Inter, system-ui, sans-serif';
            ctx.fillStyle = opts.textColor || 'rgba(236, 242, 255, 0.94)';
            ctx.textAlign = opts.align || 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(opts.label, opts.tx != null ? opts.tx : x + 20, opts.ty != null ? opts.ty : y + h / 2);
            ctx.textAlign = 'left';
        }

        ctx.restore();
    }

    function drawFloatingBotChatHero(ctx, w, h, t) {
        ctx.clearRect(0, 0, w, h);

        var compact = w > 500;
        var fs = compact
            ? Math.max(14, Math.min(16, w * 0.037))
            : Math.max(15, Math.min(18, w * 0.042));
        var radius = compact ? 20 : 24;
        var drift = prefersReduced ? 0 : Math.sin(t * 0.55) * 4;
        var driftB = prefersReduced ? 0 : Math.sin(t * 0.48 + 1.1) * 3;
        var startAlpha = ease(clamp(t / 0.8, 0, 1));
        var bot = getBotTypewriterText(t, BOT_PHRASES);
        var botText = bot.text;
        if (bot.typing && !prefersReduced && Math.floor(t * 2.2) % 2 === 0) {
            botText += '|';
        }

        var edgePad = compact ? w * 0.04 : w * 0.1;

        ctx.font = '600 ' + fs + 'px Inter, system-ui, sans-serif';
        var startW = ctx.measureText('/start').width + 44;
        var startH = Math.max(48, fs * 2.5);
        var startX = w - startW - edgePad + drift;
        var startY = compact ? h * 0.1 : h * 0.08;

        drawHeroGlassBubble(ctx, startX, startY, startW, startH, radius, {
            alpha: startAlpha,
            accent: 'user',
            stroke: 'rgba(147, 197, 253, 0.1)',
            label: '/start',
            font: '600 ' + fs + 'px Inter, system-ui, sans-serif',
            textColor: 'rgba(236, 242, 255, 0.94)',
            align: 'center',
            tx: startX + startW / 2,
            ty: startY + startH / 2
        });

        ctx.font = '500 ' + fs + 'px Inter, system-ui, sans-serif';
        var botPadX = 22;
        var botW = compact
            ? Math.min(w - edgePad * 2, Math.max(260, ctx.measureText(BOT_PHRASES[0]).width + botPadX * 2))
            : Math.min(w * 0.88, Math.max(280, ctx.measureText(BOT_PHRASES[0]).width + botPadX * 2));
        var botH = Math.max(56, fs * 2.7);
        var botX = edgePad + driftB;
        var botY = startY + startH + (compact ? 14 : 18);

        drawHeroGlassBubble(ctx, botX, botY, botW, botH, radius, {
            label: truncateText(ctx, botText, botW - botPadX * 2),
            font: '500 ' + fs + 'px Inter, system-ui, sans-serif',
            textColor: 'rgba(232, 240, 255, 0.92)',
            tx: botX + botPadX,
            ty: botY + botH / 2
        });
    }

    var AI_CYCLE = HERO_CYCLE;
    var AI_SCENARIOS = [
        {
            user: 'Нарисуй логотип',
            status: 'Генерирую изображение',
            mode: 'image',
            answer: 'Вот черновик — минималистичный знак для бренда.'
        },
        {
            user: 'Напиши код бота',
            status: 'Пишу код',
            mode: 'code',
            code: 'async def start(msg, ctx):'
        },
        {
            user: 'Напиши текст для лендинга',
            status: 'Генерирую текст',
            mode: 'text',
            answer: 'Заголовок: AI-платформа для роста продаж и автоматизации.'
        }
    ];

    function getAiHeroState(t) {
        var cycle = AI_CYCLE;
        var local = t % cycle;
        var seg = cycle / AI_SCENARIOS.length;
        var idx = Math.floor(local / seg);
        var phase = (local % seg) / seg;
        var sc = AI_SCENARIOS[idx];
        var panelFade = phase > 0.86 ? ease((phase - 0.86) / 0.14) : 0;
        var userAlpha = ease(clamp(phase / 0.14, 0, 1)) * (1 - panelFade);

        var statusAlpha = 0;
        var imageProgress = 0;
        var imageAlpha = 0;
        var codeText = '';
        var codeTyping = false;
        var codeAlpha = 0;
        var answerText = '';
        var answerTyping = false;
        var answerAlpha = 0;

        if (sc.mode === 'image') {
            if (phase >= 0.12 && phase < 0.52) {
                statusAlpha = phase < 0.42 ? 1 : 1 - ease((phase - 0.42) / 0.1);
                imageAlpha = phase < 0.18 ? ease((phase - 0.12) / 0.06) : (phase < 0.48 ? 1 : 1 - ease((phase - 0.42) / 0.1));
                imageProgress = ease(clamp((phase - 0.18) / 0.28, 0, 1));
            }
            if (phase >= 0.52 && phase < 0.86) {
                answerAlpha = phase < 0.58 ? ease((phase - 0.52) / 0.06) : (1 - panelFade);
                var imgChars = Math.min(sc.answer.length, Math.floor((phase - 0.56) / 0.028));
                answerText = sc.answer.substring(0, Math.max(0, imgChars));
                answerTyping = imgChars < sc.answer.length && phase < 0.78;
            }
        } else if (sc.mode === 'code') {
            if (phase >= 0.12 && phase < 0.3) {
                statusAlpha = ease(clamp((phase - 0.12) / 0.08, 0, 1)) * (phase < 0.28 ? 1 : 1 - ease((phase - 0.28) / 0.04));
            }
            if (phase >= 0.3 && phase < 0.84) {
                codeAlpha = phase < 0.36 ? ease((phase - 0.3) / 0.06) : (phase < 0.78 ? 1 : 1 - ease((phase - 0.72) / 0.12));
                var code = sc.code || '';
                var codeChars = Math.min(code.length, Math.floor((phase - 0.34) / 0.05));
                codeText = code.substring(0, Math.max(0, codeChars));
                codeTyping = codeChars < code.length && phase < 0.72;
            }
        } else if (sc.mode === 'text') {
            if (phase >= 0.12 && phase < 0.34) {
                statusAlpha = ease(clamp((phase - 0.12) / 0.08, 0, 1)) * (phase < 0.3 ? 1 : 1 - ease((phase - 0.3) / 0.04));
            }
            if (phase >= 0.34 && phase < 0.86) {
                answerAlpha = phase < 0.4 ? ease((phase - 0.34) / 0.06) : (1 - panelFade);
                var txtChars = Math.min(sc.answer.length, Math.floor((phase - 0.38) / 0.03));
                answerText = sc.answer.substring(0, Math.max(0, txtChars));
                answerTyping = txtChars < sc.answer.length && phase < 0.78;
            }
        }

        return {
            userAlpha: userAlpha,
            userLabel: sc.user,
            statusLabel: sc.status,
            statusAlpha: statusAlpha,
            imageProgress: imageProgress,
            imageAlpha: imageAlpha,
            codeText: codeText,
            codeTyping: codeTyping,
            codeAlpha: codeAlpha,
            answerText: answerText,
            answerTyping: answerTyping,
            answerAlpha: answerAlpha,
            loopFade: panelFade
        };
    }

    function drawAiAvatar(ctx, x, y, r) {
        ctx.save();
        var g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
        g.addColorStop(0, 'rgba(139, 92, 246, 0.95)');
        g.addColorStop(1, 'rgba(56, 189, 248, 0.85)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = '700 9px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI', x, y + 0.5);
        ctx.restore();
    }

    function drawAiStatusDots(ctx, x, y, t) {
        ctx.save();
        ctx.fillStyle = 'rgba(167, 139, 250, 0.9)';
        for (var i = 0; i < 3; i++) {
            var pulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 5.2 + i * 1.35));
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.arc(x + i * 7, y, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawAiImageGenBox(ctx, x, y, boxW, boxH, progress, t) {
        var rad = 10;
        ctx.save();
        roundRectPath(ctx, x, y, boxW, boxH, rad);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        roundRectPath(ctx, x, y, boxW, boxH, rad);
        ctx.clip();

        var shimmerX = x - boxW + ((t * 0.35) % 2) * boxW * 1.4;
        var shimmer = ctx.createLinearGradient(shimmerX, y, shimmerX + boxW * 0.7, y + boxH);
        shimmer.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shimmer.addColorStop(0.45, 'rgba(167, 139, 250, 0.12)');
        shimmer.addColorStop(0.55, 'rgba(56, 189, 248, 0.1)');
        shimmer.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shimmer;
        ctx.fillRect(x, y, boxW, boxH);

        if (progress > 0.08) {
            var previewA = ease(progress) * (progress < 0.98 ? 1 : 1);
            ctx.globalAlpha = previewA * 0.92;
            var cx = x + boxW * 0.5;
            var cy = y + boxH * 0.52;
            var bloom = ctx.createRadialGradient(cx, cy, 4, cx, cy, boxW * 0.42);
            bloom.addColorStop(0, 'rgba(196, 181, 253, 0.55)');
            bloom.addColorStop(0.55, 'rgba(56, 189, 248, 0.22)');
            bloom.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = bloom;
            ctx.beginPath();
            ctx.arc(cx, cy, boxW * 0.38 * ease(progress), 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(240, 235, 255, 0.45)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(cx - boxW * 0.14 * progress, cy + boxH * 0.08);
            ctx.lineTo(cx, cy - boxH * 0.16 * progress);
            ctx.lineTo(cx + boxW * 0.18 * progress, cy + boxH * 0.1);
            ctx.stroke();
        }

        var barH = 3;
        var barY = y + boxH - barH - 8;
        var barX = x + 10;
        var barW = boxW - 20;
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        roundRectPath(ctx, barX, barY, barW, barH, 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(139, 92, 246, 0.75)';
        roundRectPath(ctx, barX, barY, Math.max(4, barW * progress), barH, 2);
        ctx.fill();

        ctx.restore();
        ctx.restore();
    }

    function drawAiCodeBlock(ctx, x, y, boxW, text, typing, t) {
        var pad = 10;
        var lineH = 15;
        var boxH = pad * 2 + lineH;
        var rad = 8;

        ctx.save();
        roundRectPath(ctx, x, y, boxW, boxH, rad);
        ctx.fillStyle = 'rgba(8, 12, 24, 0.72)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.14)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '500 9px ui-monospace, "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('python', x + pad, y + 5);

        var codeY = y + pad + 4;
        ctx.font = '500 11px ui-monospace, "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(110, 231, 183, 0.92)';
        var display = text;
        if (typing && !prefersReduced && Math.floor(t * 2.4) % 2 === 0) {
            display += '|';
        }
        ctx.fillText(display, x + pad, codeY);
        ctx.restore();
        return boxH;
    }

    function drawFloatingAiChatHero(ctx, w, h, t) {
        ctx.clearRect(0, 0, w, h);

        var state = getAiHeroState(t);
        var panelAlpha = 1 - state.loopFade * 0.35;
        var pad = Math.max(8, w * 0.04);
        var panelX = pad;
        var panelY = pad * 0.6;
        var panelW = w - pad * 2;
        var panelH = h - pad * 1.4;
        var radius = 16;
        var fs = Math.max(11, Math.min(13, w * 0.03));
        var drift = prefersReduced ? 0 : Math.sin(t * 0.45) * 2;
        var estContentH = 300;
        var fitScale = panelH < estContentH ? panelH / estContentH : 1;

        ctx.save();
        ctx.globalAlpha = panelAlpha;
        ctx.translate(0, drift);
        if (fitScale < 1) {
            ctx.translate(panelX + panelW / 2, panelY);
            ctx.scale(fitScale, fitScale);
            ctx.translate(-(panelX + panelW / 2), -panelY);
        }

        roundRectPath(ctx, panelX, panelY, panelW, panelH, radius);
        ctx.fillStyle = 'rgba(12, 18, 36, 0.55)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        roundRectPath(ctx, panelX, panelY, panelW, panelH, radius);
        ctx.clip();

        var headerY = panelY + 14;
        drawAiAvatar(ctx, panelX + 22, headerY, 10);
        ctx.font = '600 ' + fs + 'px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(226, 232, 240, 0.88)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI Assistant', panelX + 38, headerY);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        for (var d = 0; d < 3; d++) {
            ctx.beginPath();
            ctx.arc(panelX + panelW - 18 - d * 10, headerY, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        var userLabel = state.userLabel || 'Нарисуй логотип';
        ctx.font = '500 ' + fs + 'px Inter, system-ui, sans-serif';
        var userPadX = 14;
        var userW = ctx.measureText(userLabel).width + userPadX * 2;
        var userH = Math.max(34, fs * 2.4);
        var userX = panelX + panelW - userW - 14;
        var userY = panelY + 38;

        ctx.save();
        ctx.globalAlpha = state.userAlpha;
        roundRectPath(ctx, userX, userY, userW, userH, 12);
        var userGrad = ctx.createLinearGradient(userX, userY, userX + userW, userY + userH);
        userGrad.addColorStop(0, 'rgba(139, 92, 246, 0.22)');
        userGrad.addColorStop(1, 'rgba(59, 130, 246, 0.14)');
        ctx.fillStyle = userGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.2)';
        ctx.stroke();
        ctx.fillStyle = 'rgba(240, 235, 255, 0.95)';
        ctx.textAlign = 'center';
        ctx.fillText(userLabel, userX + userW / 2, userY + userH / 2);
        ctx.restore();

        var assistX = panelX + 14;
        var slotY = userY + userH + 16;
        var contentW = panelW - 28;
        var imgW = Math.min(contentW, Math.min(168, w * 0.52));
        var imgH = imgW * 0.72;

        if (state.statusAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = state.statusAlpha;
            drawAiAvatar(ctx, assistX + 10, slotY + 10, 8);
            ctx.font = '500 ' + fs + 'px Inter, system-ui, sans-serif';
            ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(state.statusLabel || 'Генерирую изображение', assistX + 26, slotY + 4);
            drawAiStatusDots(ctx, assistX + 26 + ctx.measureText(state.statusLabel || 'Генерирую изображение').width + 6, slotY + 11, t);
            ctx.restore();
        }

        if (state.imageAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = state.imageAlpha;
            drawAiImageGenBox(ctx, assistX + 26, slotY + 30, imgW, imgH, state.imageProgress, t);
            ctx.restore();
        }

        if (state.codeAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = state.codeAlpha;
            drawAiAvatar(ctx, assistX + 10, slotY + 10, 8);
            drawAiCodeBlock(ctx, assistX + 26, slotY + 4, Math.min(contentW - 26, 210), state.codeText, state.codeTyping, t);
            ctx.restore();
        }

        if (state.answerAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = state.answerAlpha;
            drawAiAvatar(ctx, assistX + 10, slotY + 10, 8);
            ctx.font = '400 ' + fs + 'px Inter, system-ui, sans-serif';
            ctx.fillStyle = 'rgba(226, 232, 240, 0.88)';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            var answer = state.answerText;
            if (state.answerTyping && !prefersReduced && Math.floor(t * 2.2) % 2 === 0) {
                answer += '|';
            }
            var maxW = contentW - 30;
            var lines = [];
            var words = answer.split(' ');
            var line = '';
            words.forEach(function (word) {
                var test = line ? line + ' ' + word : word;
                if (ctx.measureText(test).width > maxW && line) {
                    lines.push(line);
                    line = word;
                } else {
                    line = test;
                }
            });
            if (line) lines.push(line);
            lines.forEach(function (ln, li) {
                ctx.fillText(ln, assistX + 26, slotY + 4 + li * (fs + 5));
            });
            ctx.restore();
        }

        ctx.restore();
        ctx.restore();
    }

    function drawTelegramChatHero(ctx, w, h, t) {
        drawFloatingBotChatHero(ctx, w, h, t * (14 / HERO_CYCLE));
    }

    function smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    function heroLayout(w, h) {
        var compact = w < 300 || h < 220;
        var scale = compact ? Math.min(w / 300, h / 220) : Math.min(w / 400, h / 320, 1.15);
        scale = Math.max(0.72, scale);
        return {
            compact: compact,
            scale: scale,
            cx: w * 0.5,
            cy: h * 0.5,
            pad: compact ? 6 : 10
        };
    }

    function drawSoftGlow(ctx, cx, cy, r, color) {
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawFlowPill(ctx, x, y, label, alpha, scale, accent) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '600 ' + Math.round(13 * scale) + 'px Inter, system-ui, sans-serif';
        var tw = ctx.measureText(label).width;
        var pw = tw + 22 * scale;
        var ph = 30 * scale;
        var px = x - pw / 2;
        var py = y - ph / 2;
        roundRectPath(ctx, px, py, pw, ph, ph * 0.45);
        ctx.fillStyle = accent ? 'rgba(56, 189, 248, 0.16)' : 'rgba(30, 41, 59, 0.55)';
        ctx.fill();
        ctx.strokeStyle = accent ? 'rgba(56, 189, 248, 0.55)' : 'rgba(148, 163, 184, 0.22)';
        ctx.lineWidth = accent ? 1.4 : 1;
        ctx.stroke();
        ctx.fillStyle = accent ? 'rgba(240, 249, 255, 0.96)' : 'rgba(203, 213, 225, 0.78)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y + 0.5);
        ctx.restore();
        return { w: pw, h: ph };
    }

    function drawFlowLink(ctx, x1, y1, x2, y2, pulse, t, scale) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, ' + (0.18 + pulse * 0.35) + ')';
        ctx.lineWidth = 1.2 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        if (!prefersReduced) {
            var dot = (t * 0.35 + pulse) % 1;
            var dx = x1 + (x2 - x1) * dot;
            var dy = y1 + (y2 - y1) * dot;
            ctx.fillStyle = 'rgba(125, 211, 252, ' + (0.45 + pulse * 0.45) + ')';
            ctx.beginPath();
            ctx.arc(dx, dy, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawAgentAvatar(ctx, x, y, r) {
        ctx.save();
        var g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
        g.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
        g.addColorStop(1, 'rgba(99, 102, 241, 0.88)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = '700 8px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AG', x, y + 0.5);
        ctx.restore();
    }

    function drawUserBubble(ctx, x, y, w, h, label, alpha, fs) {
        ctx.save();
        ctx.globalAlpha = alpha;
        roundRectPath(ctx, x, y, w, h, 12);
        var userGrad = ctx.createLinearGradient(x, y, x + w, y + h);
        userGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        userGrad.addColorStop(1, 'rgba(99, 102, 241, 0.14)');
        ctx.fillStyle = userGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';
        ctx.stroke();
        ctx.fillStyle = 'rgba(240, 249, 255, 0.95)';
        ctx.font = '500 ' + fs + 'px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + w / 2, y + h / 2);
        ctx.restore();
    }

    function drawAgentSearchBox(ctx, x, y, boxW, boxH, progress, t) {
        var rad = 10;
        ctx.save();
        roundRectPath(ctx, x, y, boxW, boxH, rad);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();

        var docs = ['Политика возврата.pdf', 'FAQ_клиенты.docx', 'Прайс_2026.xlsx'];
        var lineH = 22;
        var pad = 12;
        docs.forEach(function (name, i) {
            var show = progress > i * 0.28;
            if (!show) return;
            var ly = y + pad + i * lineH;
            var rowA = ease(clamp((progress - i * 0.28) / 0.35, 0, 1));
            ctx.globalAlpha = rowA * 0.92;
            roundRectPath(ctx, x + pad, ly, boxW - pad * 2, 16, 5);
            ctx.fillStyle = i === 0 && progress > 0.55 ? 'rgba(56, 189, 248, 0.14)' : 'rgba(30, 41, 59, 0.55)';
            ctx.fill();
            ctx.fillStyle = i === 0 && progress > 0.55 ? 'rgba(186, 230, 253, 0.95)' : 'rgba(203, 213, 225, 0.78)';
            ctx.font = '500 10px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(name, x + pad + 8, ly + 8);
        });

        if (!prefersReduced) {
            var scanY = y + pad + ((t * 0.5) % (docs.length * lineH));
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
            ctx.fillRect(x + pad, scanY, boxW - pad * 2, 2);
        }
        ctx.restore();
    }

    function drawAgentIndexBox(ctx, x, y, boxW, boxH, progress, t) {
        var rad = 10;
        ctx.save();
        roundRectPath(ctx, x, y, boxW, boxH, rad);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
        ctx.stroke();

        var pad = 12;
        ctx.font = '500 10px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Индексирую фрагменты…', x + pad, y + pad);

        var barY = y + pad + 22;
        var barW = boxW - pad * 2;
        var barH = 5;
        roundRectPath(ctx, x + pad, barY, barW, barH, 3);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fill();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
        roundRectPath(ctx, x + pad, barY, Math.max(6, barW * progress), barH, 3);
        ctx.fill();

        var chunks = Math.floor(progress * 8);
        for (var i = 0; i < chunks; i++) {
            var cy = barY + 16 + i * 10;
            if (cy > y + boxH - pad) break;
            ctx.globalAlpha = 0.35 + (i / 8) * 0.5;
            ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
            roundRectPath(ctx, x + pad + (i % 3) * 18, cy, barW * (0.35 + (i % 4) * 0.12), 6, 3);
            ctx.fill();
        }
        ctx.restore();
    }

    var AGENT_CYCLE = HERO_CYCLE;
    var AGENT_USER = 'Где политика возврата?';
    var AGENT_ANSWER = 'Нашёл 3 документа в базе знаний — вот краткий ответ для клиента.';

    function getAgentHeroState(t) {
        var local = t % AGENT_CYCLE;
        var userAlpha = ease(clamp(local / 0.55, 0, 1));
        var searchStatusAlpha = 0;
        var searchProgress = 0;
        var searchAlpha = 0;
        var indexStatusAlpha = 0;
        var indexProgress = 0;
        var indexAlpha = 0;
        var answerText = '';
        var answerTyping = false;
        var answerAlpha = 0;

        if (local >= 0.45 && local < 4.0) {
            searchStatusAlpha = local < 3.3 ? 1 : 1 - ease(clamp((local - 3.3) / 0.7, 0, 1));
            searchAlpha = local < 0.75 ? 0 : (local < 3.3 ? 1 : 1 - ease(clamp((local - 3.3) / 0.7, 0, 1)));
            searchProgress = ease(clamp((local - 0.75) / 2.2, 0, 1));
        } else if (local >= 4.05 && local < 7.1) {
            indexStatusAlpha = local < 4.35 ? ease(clamp((local - 4.05) / 0.3, 0, 1))
                : (local < 6.6 ? 1 : 1 - ease(clamp((local - 6.6) / 0.5, 0, 1)));
            indexAlpha = indexStatusAlpha;
            indexProgress = ease(clamp((local - 4.2) / 2.2, 0, 1));
        } else if (local >= 7.1 && local < 12.3) {
            answerAlpha = local < 7.4 ? ease(clamp((local - 7.1) / 0.3, 0, 1)) : 1;
            var answerChars = Math.min(AGENT_ANSWER.length, Math.floor((local - 7.25) / 0.038));
            answerText = AGENT_ANSWER.substring(0, Math.max(0, answerChars));
            answerTyping = answerChars < AGENT_ANSWER.length && local < 10.5;
        }

        return {
            userAlpha: userAlpha,
            searchStatusAlpha: searchStatusAlpha,
            searchProgress: searchProgress,
            searchAlpha: searchAlpha,
            indexStatusAlpha: indexStatusAlpha,
            indexProgress: indexProgress,
            indexAlpha: indexAlpha,
            answerText: answerText,
            answerTyping: answerTyping,
            answerAlpha: answerAlpha,
            loopFade: local > 12.3 ? clamp((local - 12.3) / 1.0, 0, 1) : 0
        };
    }

    function drawFloatingAgentsHero(ctx, w, h, t) {
        ctx.clearRect(0, 0, w, h);
        var state = getAgentHeroState(t);
        var panelAlpha = 1 - state.loopFade * 0.35;
        var pad = Math.max(8, w * 0.04);
        var panelX = pad;
        var panelY = pad * 0.6;
        var panelW = w - pad * 2;
        var panelH = h - pad * 1.4;
        var radius = 16;
        var fs = Math.max(11, Math.min(13, w * 0.03));
        var drift = prefersReduced ? 0 : Math.sin(t * 0.45) * 2;
        var estContentH = 300;
        var fitScale = panelH < estContentH ? panelH / estContentH : 1;

        ctx.save();
        ctx.globalAlpha = panelAlpha;
        ctx.translate(0, drift);
        if (fitScale < 1) {
            ctx.translate(panelX + panelW / 2, panelY);
            ctx.scale(fitScale, fitScale);
            ctx.translate(-(panelX + panelW / 2), -panelY);
        }

        roundRectPath(ctx, panelX, panelY, panelW, panelH, radius);
        ctx.fillStyle = 'rgba(12, 18, 36, 0.55)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        roundRectPath(ctx, panelX, panelY, panelW, panelH, radius);
        ctx.clip();

        var headerY = panelY + 14;
        drawAgentAvatar(ctx, panelX + 22, headerY, 10);
        ctx.font = '600 ' + fs + 'px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(226, 232, 240, 0.88)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI Agent', panelX + 38, headerY);

        ctx.font = '500 ' + fs + 'px Inter, system-ui, sans-serif';
        var userPadX = 14;
        var userW = ctx.measureText(AGENT_USER).width + userPadX * 2;
        var userH = Math.max(34, fs * 2.4);
        var userX = panelX + panelW - userW - 14;
        var userY = panelY + 38;
        drawUserBubble(ctx, userX, userY, userW, userH, AGENT_USER, state.userAlpha, fs);

        var assistX = panelX + 14;
        var slotY = userY + userH + 16;
        var contentW = panelW - 28;
        var boxW = Math.min(contentW, Math.min(200, w * 0.58));
        var boxH = Math.min(118, boxW * 0.62);

        if (state.searchStatusAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = state.searchStatusAlpha;
            drawAgentAvatar(ctx, assistX + 10, slotY + 10, 8);
            ctx.font = '500 ' + fs + 'px Inter, system-ui, sans-serif';
            ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText('Ищу по базе данных', assistX + 26, slotY + 4);
            drawAiStatusDots(ctx, assistX + 26 + ctx.measureText('Ищу по базе данных').width + 6, slotY + 11, t);
            ctx.restore();
        }

        if (state.searchAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = state.searchAlpha;
            drawAgentSearchBox(ctx, assistX + 26, slotY + 30, boxW, boxH, state.searchProgress, t);
            ctx.restore();
        }

        if (state.indexStatusAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = state.indexStatusAlpha;
            drawAgentAvatar(ctx, assistX + 10, slotY + 10, 8);
            ctx.font = '500 ' + fs + 'px Inter, system-ui, sans-serif';
            ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText('Индексирую данные', assistX + 26, slotY + 4);
            drawAiStatusDots(ctx, assistX + 26 + ctx.measureText('Индексирую данные').width + 6, slotY + 11, t);
            ctx.restore();
        }

        if (state.indexAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = state.indexAlpha;
            drawAgentIndexBox(ctx, assistX + 26, slotY + 30, boxW, boxH, state.indexProgress, t);
            ctx.restore();
        }

        if (state.answerAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = state.answerAlpha;
            drawAgentAvatar(ctx, assistX + 10, slotY + 10, 8);
            ctx.font = '400 ' + fs + 'px Inter, system-ui, sans-serif';
            ctx.fillStyle = 'rgba(226, 232, 240, 0.88)';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            var answer = state.answerText;
            if (state.answerTyping && !prefersReduced && Math.floor(t * 2.2) % 2 === 0) {
                answer += '|';
            }
            var maxW = contentW - 30;
            var lines = [];
            var words = answer.split(' ');
            var line = '';
            words.forEach(function (word) {
                var test = line ? line + ' ' + word : word;
                if (ctx.measureText(test).width > maxW && line) {
                    lines.push(line);
                    line = word;
                } else {
                    line = test;
                }
            });
            if (line) lines.push(line);
            lines.forEach(function (ln, li) {
                ctx.fillText(ln, assistX + 26, slotY + 4 + li * (fs + 5));
            });
            ctx.restore();
        }

        ctx.restore();
        ctx.restore();
    }

    function drawGear(ctx, cx, cy, teeth, radius, rot, fill, stroke) {
        ctx.save();
        ctx.beginPath();
        var i;
        for (i = 0; i < teeth * 2; i++) {
            var angle = rot + (i * Math.PI) / teeth;
            var r = (i % 2 === 0) ? radius : radius * 0.82;
            var px = cx + Math.cos(angle) * r;
            var py = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = Math.max(1, radius * 0.028);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8, 12, 24, 0.9)';
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = Math.max(1, radius * 0.022);
        ctx.stroke();
        ctx.restore();
    }

    function drawFloatingCustomDevHero(ctx, w, h, t) {
        ctx.clearRect(0, 0, w, h);

        var pad = Math.max(14, Math.min(w, h) * 0.1);
        var availW = w - pad * 2;
        var availH = h - pad * 2;

        var r1 = 62;
        var r2 = 36;
        var r3 = 24;
        var g1 = { x: 0, y: 0 };
        var g2 = { x: r1 + r2, y: 0 };
        var g3 = { x: -(r1 + r3) * 0.62, y: r1 + r3 * 0.82 };

        var minX = Math.min(g1.x - r1, g2.x - r2, g3.x - r3);
        var maxX = Math.max(g1.x + r1, g2.x + r2, g3.x + r3);
        var minY = Math.min(g1.y - r1, g2.y - r2, g3.y - r3);
        var maxY = Math.max(g1.y + r1, g2.y + r2, g3.y + r3);
        var bw = maxX - minX;
        var bh = maxY - minY;
        var scale = Math.min(availW / bw, availH / bh) * 0.96;
        scale = clamp(scale, 0.55, 1.2);

        var drift = prefersReduced ? 0 : Math.sin(t * 0.28) * 2 * scale;
        var cx = w * 0.5 - ((minX + maxX) / 2) * scale;
        var cy = h * 0.5 - ((minY + maxY) / 2) * scale + drift;

        drawSoftGlow(ctx, cx, cy, Math.min(w, h) * 0.38, 'rgba(148, 163, 184, 0.06)');

        var fill = 'rgba(148, 163, 184, 0.12)';
        var stroke = 'rgba(226, 232, 240, 0.5)';
        var rot1 = prefersReduced ? 0 : t * 0.32;
        var rot2 = prefersReduced ? 0 : -t * 0.44;
        var rot3 = prefersReduced ? 0 : t * 0.58;

        drawGear(ctx, cx + g1.x * scale, cy + g1.y * scale, 12, r1 * scale, rot1, fill, stroke);
        drawGear(ctx, cx + g2.x * scale, cy + g2.y * scale, 8, r2 * scale, rot2, fill, stroke);
        drawGear(ctx, cx + g3.x * scale, cy + g3.y * scale, 6, r3 * scale, rot3, fill, stroke);
    }

    /* —— Integration: volumetric mecha robot —— */
    function getRobotPowerCycle(t) {
        if (prefersReduced) return 0.72;
        var cycle = HERO_CYCLE;
        var p = (t % cycle) / cycle;
        if (p < 0.3) return smoothstep(p / 0.3);
        if (p < 0.44) return 1;
        if (p < 0.74) return 1 - smoothstep((p - 0.44) / 0.3);
        return 0.05 + smoothstep((p - 0.74) / 0.26) * 0.06;
    }

    function drawMechaPanel(ctx, points, fill, stroke, lineW) {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (var i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
        ctx.closePath();
        if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
        }
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = lineW;
            ctx.stroke();
        }
    }

    function drawAsianMechaRobot(ctx, cx, cy, s, power, t) {
        var shellDark = 'rgba(15, 23, 42, ' + (0.55 + power * 0.35) + ')';
        var shellMid = 'rgba(30, 41, 59, ' + (0.45 + power * 0.4) + ')';
        var edge = 'rgba(148, 163, 184, ' + (0.22 + power * 0.45) + ')';
        var edgeBright = 'rgba(186, 230, 253, ' + (0.15 + power * 0.65) + ')';
        var visorGlow = 'rgba(56, 189, 248, ' + (0.08 + power * 0.72) + ')';
        var coreGlow = 'rgba(167, 139, 250, ' + (0.1 + power * 0.75) + ')';
        var lw = Math.max(0.8, 1.1 * s);

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        var shoulderY = cy + 58 * s;
        var shoulderW = 118 * s;
        var shGrad = ctx.createLinearGradient(cx - shoulderW / 2, shoulderY, cx + shoulderW / 2, shoulderY + 28 * s);
        shGrad.addColorStop(0, 'rgba(8, 12, 24, ' + (0.5 + power * 0.3) + ')');
        shGrad.addColorStop(0.5, shellMid);
        shGrad.addColorStop(1, 'rgba(8, 12, 24, ' + (0.5 + power * 0.3) + ')');
        drawMechaPanel(ctx, [
            [cx - shoulderW / 2, shoulderY],
            [cx - shoulderW / 2 + 18 * s, shoulderY + 32 * s],
            [cx - 22 * s, shoulderY + 38 * s],
            [cx + 22 * s, shoulderY + 38 * s],
            [cx + shoulderW / 2 - 18 * s, shoulderY + 32 * s],
            [cx + shoulderW / 2, shoulderY]
        ], shGrad, edge, lw);

        var chestGrad = ctx.createLinearGradient(cx, cy + 18 * s, cx, cy + 52 * s);
        chestGrad.addColorStop(0, shellMid);
        chestGrad.addColorStop(1, shellDark);
        drawMechaPanel(ctx, [
            [cx - 34 * s, cy + 20 * s],
            [cx + 34 * s, cy + 20 * s],
            [cx + 28 * s, cy + 54 * s],
            [cx - 28 * s, cy + 54 * s]
        ], chestGrad, edgeBright, lw * 0.9);

        if (power > 0.12) {
            var coreR = 10 * s * (0.7 + power * 0.35);
            var coreG = ctx.createRadialGradient(cx, cy + 38 * s, 0, cx, cy + 38 * s, coreR * 2.2);
            coreG.addColorStop(0, coreGlow);
            coreG.addColorStop(0.45, 'rgba(56, 189, 248, ' + (power * 0.35) + ')');
            coreG.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = coreG;
            ctx.beginPath();
            ctx.arc(cx, cy + 38 * s, coreR * 2.2, 0, Math.PI * 2);
            ctx.fill();
            roundRectPath(ctx, cx - 8 * s, cy + 32 * s, 16 * s, 14 * s, 4 * s);
            ctx.fillStyle = 'rgba(15, 23, 42, ' + (0.7 - power * 0.2) + ')';
            ctx.fill();
            ctx.strokeStyle = edgeBright;
            ctx.lineWidth = lw * 0.8;
            ctx.stroke();
        }

        var neckGrad = ctx.createLinearGradient(cx, cy + 8 * s, cx, cy + 22 * s);
        neckGrad.addColorStop(0, shellDark);
        neckGrad.addColorStop(1, 'rgba(51, 65, 85, ' + (0.35 + power * 0.35) + ')');
        roundRectPath(ctx, cx - 14 * s, cy + 8 * s, 28 * s, 16 * s, 5 * s);
        ctx.fillStyle = neckGrad;
        ctx.fill();
        ctx.strokeStyle = edge;
        ctx.lineWidth = lw * 0.85;
        ctx.stroke();

        var headTop = cy - 52 * s;
        var headGrad = ctx.createLinearGradient(cx - 40 * s, headTop, cx + 40 * s, cy + 10 * s);
        headGrad.addColorStop(0, 'rgba(51, 65, 85, ' + (0.3 + power * 0.45) + ')');
        headGrad.addColorStop(0.55, shellMid);
        headGrad.addColorStop(1, shellDark);
        drawMechaPanel(ctx, [
            [cx - 6 * s, headTop - 18 * s],
            [cx + 6 * s, headTop - 18 * s],
            [cx + 42 * s, headTop + 8 * s],
            [cx + 38 * s, cy + 6 * s],
            [cx + 22 * s, cy + 14 * s],
            [cx - 22 * s, cy + 14 * s],
            [cx - 38 * s, cy + 6 * s],
            [cx - 42 * s, headTop + 8 * s]
        ], headGrad, edgeBright, lw);

        [-1, 1].forEach(function (side) {
            var ex = cx + side * 46 * s;
            var earGrad = ctx.createLinearGradient(ex - side * 12 * s, cy - 20 * s, ex + side * 8 * s, cy + 4 * s);
            earGrad.addColorStop(0, shellMid);
            earGrad.addColorStop(1, shellDark);
            drawMechaPanel(ctx, [
                [ex, cy - 24 * s],
                [ex + side * 14 * s, cy - 14 * s],
                [ex + side * 12 * s, cy + 6 * s],
                [ex + side * 4 * s, cy + 10 * s],
                [ex - side * 2 * s, cy - 4 * s]
            ], earGrad, edge, lw * 0.85);
            if (power > 0.2) {
                ctx.fillStyle = 'rgba(56, 189, 248, ' + (power * 0.55) + ')';
                ctx.beginPath();
                ctx.arc(ex + side * 6 * s, cy - 8 * s, 2.2 * s, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        var finGrad = ctx.createLinearGradient(cx, headTop - 22 * s, cx, headTop - 4 * s);
        finGrad.addColorStop(0, edgeBright);
        finGrad.addColorStop(1, shellMid);
        drawMechaPanel(ctx, [
            [cx, headTop - 26 * s],
            [cx + 5 * s, headTop - 8 * s],
            [cx - 5 * s, headTop - 8 * s]
        ], finGrad, null, 0);
        ctx.strokeStyle = edgeBright;
        ctx.lineWidth = lw * 0.7;
        ctx.stroke();

        var visorY = cy - 14 * s;
        var visorH = 22 * s;
        roundRectPath(ctx, cx - 32 * s, visorY, 64 * s, visorH, 6 * s);
        ctx.fillStyle = 'rgba(4, 8, 18, ' + (0.75 - power * 0.15) + ')';
        ctx.fill();
        ctx.strokeStyle = edge;
        ctx.lineWidth = lw;
        ctx.stroke();

        if (power > 0.08) {
            var vg = ctx.createLinearGradient(cx - 30 * s, visorY, cx + 30 * s, visorY + visorH);
            vg.addColorStop(0, 'rgba(56, 189, 248, ' + (power * 0.15) + ')');
            vg.addColorStop(0.5, visorGlow);
            vg.addColorStop(1, 'rgba(139, 92, 246, ' + (power * 0.2) + ')');
            roundRectPath(ctx, cx - 28 * s, visorY + 3 * s, 56 * s, visorH - 6 * s, 4 * s);
            ctx.fillStyle = vg;
            ctx.fill();

            ctx.strokeStyle = 'rgba(186, 230, 253, ' + (0.2 + power * 0.6) + ')';
            ctx.lineWidth = lw * 0.75;
            [-14 * s, 0, 14 * s].forEach(function (dx) {
                ctx.beginPath();
                ctx.moveTo(cx + dx, visorY + 7 * s);
                ctx.lineTo(cx + dx, visorY + visorH - 5 * s);
                ctx.stroke();
            });

            if (!prefersReduced && power > 0.35) {
                var scanP = (t * 0.55) % 1;
                var scanY = visorY + 4 * s + scanP * (visorH - 8 * s);
                ctx.strokeStyle = 'rgba(224, 242, 254, ' + (power * 0.35) + ')';
                ctx.lineWidth = 1.2 * s;
                ctx.beginPath();
                ctx.moveTo(cx - 26 * s, scanY);
                ctx.lineTo(cx + 26 * s, scanY);
                ctx.stroke();
            }
        }

        ctx.strokeStyle = 'rgba(100, 116, 139, ' + (0.25 + power * 0.35) + ')';
        ctx.lineWidth = lw * 0.55;
        ctx.beginPath();
        ctx.moveTo(cx - 20 * s, cy + 2 * s);
        ctx.lineTo(cx + 20 * s, cy + 2 * s);
        ctx.moveTo(cx - 12 * s, cy + 8 * s);
        ctx.lineTo(cx + 12 * s, cy + 8 * s);
        ctx.stroke();

        ctx.restore();
    }

    function drawFloatingIntegrationHero(ctx, w, h, t) {
        ctx.clearRect(0, 0, w, h);

        var pad = Math.max(16, Math.min(w, h) * 0.08);
        var availW = w - pad * 2;
        var availH = h - pad * 2;
        var robotW = 130;
        var robotH = 168;
        var scale = Math.min(availW / robotW, availH / robotH) * 0.92;
        scale = clamp(scale, 0.5, 1.25);

        var power = getRobotPowerCycle(t);
        var drift = prefersReduced ? 0 : Math.sin(t * 0.22) * 2.5 * scale;
        var cx = w * 0.5;
        var cy = h * 0.5 + drift;

        var haloA = 0.04 + power * 0.14;
        var halo = ctx.createRadialGradient(cx, cy - 8 * scale, 0, cx, cy, Math.min(w, h) * 0.42);
        halo.addColorStop(0, 'rgba(167, 139, 250, ' + haloA + ')');
        halo.addColorStop(0.45, 'rgba(56, 189, 248, ' + (haloA * 0.65) + ')');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, w, h);

        drawAsianMechaRobot(ctx, cx, cy - 6 * scale, scale, power, t);
    }

    /* —— Web: UI mockup assembly —— */
    function drawWebBlock(ctx, x, y, bw, bh, rad, alpha, fill, stroke) {
        ctx.save();
        ctx.globalAlpha = alpha;
        roundRectPath(ctx, x, y, bw, bh, rad);
        ctx.fillStyle = fill;
        ctx.fill();
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawFloatingWebHero(ctx, w, h, t) {
        ctx.clearRect(0, 0, w, h);
        var L = heroLayout(w, h);
        var drift = prefersReduced ? 0 : Math.sin(t * 0.22) * 2 * L.scale;
        drawSoftGlow(ctx, L.cx, L.cy, Math.min(w, h) * 0.46, 'rgba(52, 211, 153, 0.07)');

        var cycle = HERO_CYCLE;
        var p = (t % cycle) / cycle;
        var mockW = Math.min(w - L.pad * 2, L.compact ? w * 0.94 : w * 0.9);
        var mockH = Math.min(h - L.pad * 2, L.compact ? h * 0.88 : h * 0.84);
        var mx = (w - mockW) / 2;
        var my = (h - mockH) / 2 + drift * 0.35;
        var s = L.scale;
        var r = 12 * s;
        var inner = mx + 12 * s;
        var innerW = mockW - 24 * s;

        var shellA = smoothstep(clamp(p / 0.05, 0, 1));
        drawWebBlock(ctx, mx, my, mockW, mockH, r, shellA * 0.32, 'rgba(15, 23, 42, 0.28)', 'rgba(148, 163, 184, 0.1)');

        var barH = 26 * s;
        var barA = smoothstep(clamp((p - 0.02) / 0.08, 0, 1));
        drawWebBlock(ctx, inner, my + 10 * s, innerW, barH, 8 * s, barA * 0.75, 'rgba(30, 41, 59, 0.7)', 'rgba(148, 163, 184, 0.16)');
        if (barA > 0.15) {
            ctx.save();
            ctx.globalAlpha = barA;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.beginPath();
            ctx.arc(inner + 16 * s, my + 10 * s + barH / 2, 5 * s, 0, Math.PI * 2);
            ctx.fill();
            drawWebBlock(ctx, inner + 28 * s, my + 16 * s, innerW * 0.22, 6 * s, 3 * s, 0.55, 'rgba(148, 163, 184, 0.35)', null);
            drawWebBlock(ctx, inner + 28 * s, my + 24 * s, innerW * 0.14, 5 * s, 2.5 * s, 0.4, 'rgba(148, 163, 184, 0.22)', null);
            drawWebBlock(ctx, mx + mockW - 52 * s, my + 15 * s, 40 * s, 16 * s, 8 * s, barA * 0.9, 'rgba(56, 189, 248, 0.18)', 'rgba(56, 189, 248, 0.35)');
            ctx.restore();
        }

        var searchA = smoothstep(clamp((p - 0.07) / 0.08, 0, 1));
        var searchY = my + 10 * s + barH + 8 * s;
        drawWebBlock(ctx, inner, searchY, innerW, 28 * s, 8 * s, searchA * 0.88, 'rgba(51, 65, 85, 0.58)', 'rgba(147, 197, 253, 0.24)');
        if (searchA > 0.2) {
            ctx.save();
            ctx.globalAlpha = searchA * 0.7;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
            ctx.lineWidth = 1.2 * s;
            ctx.beginPath();
            ctx.arc(inner + 16 * s, searchY + 14 * s, 5 * s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(inner + 20 * s, searchY + 18 * s);
            ctx.lineTo(inner + 24 * s, searchY + 22 * s);
            ctx.stroke();
            ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
            ctx.font = '500 ' + Math.round(10 * s) + 'px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('Поиск по сайту…', inner + 30 * s, searchY + 14 * s);
            ctx.restore();
        }

        var navA = smoothstep(clamp((p - 0.12) / 0.08, 0, 1));
        var navY = searchY + 28 * s + 8 * s;
        var tabLabels = L.compact ? ['Главная', 'Услуги', 'Кейсы'] : ['Главная', 'Услуги', 'Кейсы', 'Контакты'];
        var tabW = (innerW - (tabLabels.length - 1) * 6 * s) / tabLabels.length;
        tabLabels.forEach(function (label, ni) {
            var tx = inner + ni * (tabW + 6 * s);
            var active = ni === 1;
            drawWebBlock(
                ctx, tx, navY, tabW, 18 * s, 6 * s, navA * (active ? 0.95 : 0.55),
                active ? 'rgba(56, 189, 248, 0.16)' : 'rgba(100, 116, 139, 0.28)',
                active ? 'rgba(56, 189, 248, 0.4)' : null
            );
            if (navA > 0.25) {
                ctx.save();
                ctx.globalAlpha = navA * (active ? 0.85 : 0.45);
                ctx.fillStyle = active ? 'rgba(186, 230, 253, 0.95)' : 'rgba(203, 213, 225, 0.65)';
                ctx.font = '600 ' + Math.round(8 * s) + 'px Inter, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, tx + tabW / 2, navY + 9 * s);
                ctx.restore();
            }
        });

        var heroA = smoothstep(clamp((p - 0.18) / 0.1, 0, 1));
        var heroY = navY + 24 * s;
        var heroH = mockH * (L.compact ? 0.24 : 0.28);
        var heroGap = 8 * s;
        var heroLeftW = innerW * (L.compact ? 0.58 : 0.56);
        var heroRightW = innerW - heroLeftW - heroGap;
        drawWebBlock(ctx, inner, heroY, heroLeftW, heroH, 10 * s, heroA * 0.82, 'rgba(56, 189, 248, 0.12)', 'rgba(56, 189, 248, 0.22)');
        drawWebBlock(ctx, inner + heroLeftW + heroGap, heroY, heroRightW, heroH, 10 * s, heroA * 0.7, 'rgba(30, 41, 59, 0.62)', 'rgba(148, 163, 184, 0.18)');
        if (heroA > 0.2) {
            ctx.save();
            ctx.globalAlpha = heroA * 0.75;
            drawWebBlock(ctx, inner + 12 * s, heroY + 12 * s, heroLeftW * 0.72, 7 * s, 3.5 * s, 1, 'rgba(226, 232, 240, 0.35)', null);
            drawWebBlock(ctx, inner + 12 * s, heroY + 24 * s, heroLeftW * 0.5, 5 * s, 2.5 * s, 0.8, 'rgba(148, 163, 184, 0.28)', null);
            drawWebBlock(ctx, inner + 12 * s, heroY + heroH - 24 * s, 52 * s, 14 * s, 7 * s, 0.95, 'rgba(56, 189, 248, 0.22)', 'rgba(56, 189, 248, 0.4)');
            var imgCx = inner + heroLeftW + heroGap + heroRightW * 0.5;
            var imgCy = heroY + heroH * 0.52;
            var imgG = ctx.createRadialGradient(imgCx, imgCy, 2, imgCx, imgCy, heroRightW * 0.32);
            imgG.addColorStop(0, 'rgba(52, 211, 153, 0.35)');
            imgG.addColorStop(1, 'rgba(52, 211, 153, 0)');
            ctx.fillStyle = imgG;
            ctx.beginPath();
            ctx.arc(imgCx, imgCy, heroRightW * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.lineWidth = 1;
            ctx.strokeRect(inner + heroLeftW + heroGap + 10 * s, heroY + 10 * s, heroRightW - 20 * s, heroH - 20 * s);
            ctx.restore();
        }

        var cardsY = heroY + heroH + 10 * s;
        var rowH = Math.max(34 * s, mockH - (cardsY - my) - 12 * s);
        var cardsA = smoothstep(clamp((p - 0.26) / 0.14, 0, 1));

        var statsA = cardsA * smoothstep(clamp((p - 0.26) / 0.08, 0, 1));
        var statsW = innerW * (L.compact ? 1 : 0.38);
        drawWebBlock(ctx, inner, cardsY, statsW, rowH * 0.42, 8 * s, statsA * 0.8, 'rgba(30, 41, 59, 0.65)', 'rgba(148, 163, 184, 0.14)');
        if (statsA > 0.25) {
            ctx.save();
            ctx.globalAlpha = statsA * 0.55;
            var metricW = (statsW - 24 * s) / 3;
            for (var mi = 0; mi < 3; mi++) {
                var mx0 = inner + 12 * s + mi * (metricW + 4 * s);
                drawWebBlock(ctx, mx0, cardsY + 8 * s, metricW * 0.55, 5 * s, 2.5 * s, 1, 'rgba(148, 163, 184, 0.35)', null);
                drawWebBlock(ctx, mx0, cardsY + 18 * s, metricW * 0.35, 4 * s, 2 * s, 0.7, 'rgba(100, 116, 139, 0.35)', null);
            }
            ctx.restore();
        }

        if (!L.compact) {
            var featA = cardsA * smoothstep(clamp((p - 0.3) / 0.08, 0, 1));
            var featX = inner + statsW + 8 * s;
            var featW = innerW - statsW - 8 * s;
            drawWebBlock(ctx, featX, cardsY, featW * 0.52, rowH, 8 * s, featA * 0.85, 'rgba(30, 41, 59, 0.68)', 'rgba(52, 211, 153, 0.28)');
            if (featA > 0.25) {
                ctx.save();
                ctx.globalAlpha = featA * 0.5;
                drawWebBlock(ctx, featX + 10 * s, cardsY + 10 * s, featW * 0.38, 6 * s, 3 * s, 1, 'rgba(148, 163, 184, 0.32)', null);
                drawWebBlock(ctx, featX + 10 * s, cardsY + 22 * s, featW * 0.28, 5 * s, 2.5 * s, 0.85, 'rgba(148, 163, 184, 0.22)', null);
                drawWebBlock(ctx, featX + 10 * s, cardsY + rowH - 18 * s, featW * 0.22, 8 * s, 4 * s, 1, 'rgba(52, 211, 153, 0.25)', null);
                ctx.restore();
            }
            var listA = cardsA * smoothstep(clamp((p - 0.34) / 0.08, 0, 1));
            var listX = featX + featW * 0.52 + 8 * s;
            var listW = innerW - (listX - inner);
            drawWebBlock(ctx, listX, cardsY, listW, rowH, 8 * s, listA * 0.78, 'rgba(51, 65, 85, 0.55)', 'rgba(148, 163, 184, 0.12)');
            if (listA > 0.25) {
                ctx.save();
                ctx.globalAlpha = listA * 0.5;
                for (var li = 0; li < 3; li++) {
                    drawWebBlock(ctx, listX + 10 * s, cardsY + 10 * s + li * 14 * s, listW * (0.75 - li * 0.12), 6 * s, 3 * s, 1, 'rgba(148, 163, 184, 0.28)', null);
                }
                ctx.restore();
            }
        } else {
            var cGap = 8 * s;
            var cW = (innerW - cGap) / 2;
            var c1A = cardsA * smoothstep(clamp((p - 0.28) / 0.07, 0, 1));
            var c2A = cardsA * smoothstep(clamp((p - 0.32) / 0.07, 0, 1));
            drawWebBlock(ctx, inner, cardsY + rowH * 0.46, cW, rowH * 0.54, 8 * s, c1A * 0.82, 'rgba(30, 41, 59, 0.65)', 'rgba(52, 211, 153, 0.22)');
            drawWebBlock(ctx, inner + cW + cGap, cardsY + rowH * 0.46, cW, rowH * 0.54, 8 * s, c2A * 0.78, 'rgba(51, 65, 85, 0.55)', 'rgba(148, 163, 184, 0.12)');
        }
    }

    /* Service-page hero scenes: themed per service. */

    function drawAiScene(ctx, w, h, t, p, slideEl) {
        if (!slideEl) {
            drawFloatingAiChatHero(ctx, w, h, t);
            return;
        }
        drawPlaceholderScene(ctx, w, h, t, p, 'ai');
    }

    function drawCustomScene(ctx, w, h, t, p, slideEl) {
        if (!slideEl) {
            drawFloatingCustomDevHero(ctx, w, h, t);
            return;
        }
        drawPlaceholderScene(ctx, w, h, t, p, 'custom');
    }

    function drawAgentsScene(ctx, w, h, t, p, slideEl) {
        if (!slideEl) {
            drawFloatingAgentsHero(ctx, w, h, t);
            return;
        }
        drawPlaceholderScene(ctx, w, h, t, p, 'agents');
    }

    function drawWebScene(ctx, w, h, t, p, slideEl) {
        if (!slideEl) {
            drawFloatingWebHero(ctx, w, h, t);
            return;
        }
        drawPlaceholderScene(ctx, w, h, t, p, 'web');
    }

    function drawIntegrationScene(ctx, w, h, t, p, slideEl) {
        if (!slideEl) {
            drawFloatingIntegrationHero(ctx, w, h, t);
            return;
        }
        drawPlaceholderScene(ctx, w, h, t, p, 'integration');
    }

    function drawPlaceholderScene(ctx, w, h, t, p, label) {
        ctx.clearRect(0, 0, w, h);
        var build = clamp(p * 1.2, 0, 1);
        var cx = w * 0.5;
        var cy = h * 0.5;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 1;
        for (var i = 0; i < 5; i++) {
            var a = t * 0.15 + i * 1.2;
            ctx.beginPath();
            ctx.arc(cx, cy, (40 + i * 18) * build, a, a + Math.PI * 0.6);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, cx, cy + 90);
    }

    var drawFns = {
        telegram: drawTelegramScene,
        integration: drawIntegrationScene,
        ai: drawAiScene,
        custom: drawCustomScene,
        agents: drawAgentsScene,
        web: drawWebScene
    };

    function resizeScene(entry) {
        var parent = entry.canvas.parentElement;
        var rect = parent.getBoundingClientRect();
        var isHeroVisual = parent.classList.contains('service-hero-visual');
        var padX = rect.width * (isHeroVisual ? 0.04 : CANVAS_PAD);
        var padYTop = rect.height * (isHeroVisual ? 0.04 : 0.08);
        var padYBottom = rect.height * (isHeroVisual ? 0.06 : CANVAS_PAD + 0.12);
        var cssW = rect.width + padX * 2;
        var cssH = rect.height + padYTop + padYBottom;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);

        entry.canvas.style.position = 'absolute';
        entry.canvas.style.inset = 'auto';
        entry.canvas.style.left = -padX + 'px';
        entry.canvas.style.top = -padYTop + 'px';
        entry.canvas.style.width = cssW + 'px';
        entry.canvas.style.height = cssH + 'px';

        entry.width = Math.max(1, Math.floor(cssW * dpr));
        entry.height = Math.max(1, Math.floor(cssH * dpr));
        entry.canvas.width = entry.width;
        entry.canvas.height = entry.height;
        entry.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        entry.cssW = cssW;
        entry.cssH = cssH;
    }

    function collectScenes() {
        scenes = [];
        document.querySelectorAll('.service-scene-canvas[data-scene]').forEach(function (canvas) {
            var sceneId = canvas.getAttribute('data-scene');
            var draw = drawFns[sceneId];
            if (!draw) return;
            var ctx = canvas.getContext('2d');
            if (!ctx) return;
            scenes.push({
                canvas: canvas,
                ctx: ctx,
                item: canvas.closest('.service-slide'),
                sceneId: sceneId,
                draw: draw,
                cssW: 0,
                cssH: 0
            });
        });
        scenes.forEach(resizeScene);
    }

    function tick(now) {
        rafId = 0;
        if (prefersReduced || !scenes.length) return;

        var t = now * 0.001;
        scenes.forEach(function (entry) {
            var rect = entry.canvas.parentElement.getBoundingClientRect();
            if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;

            var p = entry.item
                ? parseFloat(entry.item.style.getPropertyValue('--p') || '0')
                : 0;

            entry.draw(entry.ctx, entry.cssW, entry.cssH, t, p, entry.item);
        });

        rafId = requestAnimationFrame(tick);
    }

    function startLoop() {
        if (rafId || prefersReduced) return;
        rafId = requestAnimationFrame(tick);
    }

    function initMotionScenes() {
        collectScenes();
        if (!scenes.length) return;
        startLoop();
    }

    document.addEventListener('services:home-rendered', initMotionScenes);
    document.addEventListener('DOMContentLoaded', function () {
        if (document.querySelector('.service-scene-canvas')) initMotionScenes();
    });
    window.addEventListener('resize', function () {
        scenes.forEach(resizeScene);
    }, { passive: true });
    window.addEventListener('scroll', function () {
        if (!rafId && scenes.length) rafId = requestAnimationFrame(tick);
    }, { passive: true });

    window.MotionScenes = { refresh: initMotionScenes };
})();
