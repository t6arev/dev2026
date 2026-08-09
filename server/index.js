const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const https = require('https');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.use(cors());
app.use(express.json({ limit: '32kb' }));

// Serve static site only when explicitly configured or when website root is present.
const staticRoot = process.env.STATIC_ROOT || path.join(__dirname, '..');
if (fs.existsSync(path.join(staticRoot, 'index.html'))) {
    app.use(express.static(staticRoot));
}

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'dev2026-leads' });
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: 'Слишком много запросов. Попробуйте позже.' }
});

function formatLeadMessage(data) {
    const lines = ['📋 Новая заявка с сайта', ''];
    if (data.source) lines.push(`Источник: ${data.source}`);
    if (data.task) lines.push(`Задача: ${data.task}`);
    if (data.hasTz) lines.push(`ТЗ есть: ${data.hasTz}`);
    lines.push(`Имя: ${data.name}`);
    lines.push(`Канал: ${data.channel}`);
    lines.push(`Контакт: ${data.contact}`);
    return lines.join('\n');
}

async function sendTelegram(text) {
    const data = JSON.stringify({ chat_id: CHAT_ID, text });
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.telegram.org',
            path: `/bot${TOKEN}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (!parsed.ok) {
                        console.error('Telegram error:', parsed);
                        reject(new Error(parsed.description || 'Telegram API error'));
                    } else {
                        resolve(parsed);
                    }
                } catch (err) {
                    reject(err);
                }
            });
        });
        req.on('error', (err) => reject(err));
        req.write(data);
        req.end();
    });
}

function validateLead(body) {
    const errors = [];
    if (body.website && body.website.trim()) {
        return { spam: true };
    }
    if (!body.name || body.name.trim().length < 2) {
        errors.push('Укажите имя (минимум 2 символа)');
    }
    if (!body.channel || !['telegram', 'phone', 'email'].includes(body.channel)) {
        errors.push('Выберите способ связи');
    }
    if (!body.contact || body.contact.trim().length < 3) {
        errors.push('Укажите контактные данные');
    }
    if (body.channel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact.trim())) {
        errors.push('Некорректный email');
    }
    if (body.channel === 'phone' && !/^[\d\s+\-()]{7,20}$/.test(body.contact.trim())) {
        errors.push('Некорректный номер телефона');
    }
    if (body.channel === 'telegram' && body.contact.trim().length < 3) {
        errors.push('Укажите @username или ссылку Telegram');
    }
    return { errors, spam: false };
}

const channelLabels = {
    telegram: 'Telegram',
    phone: 'Телефон',
    email: 'Почта'
};

app.post('/api/leads', limiter, async (req, res) => {
    if (!TOKEN || !CHAT_ID) {
        console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
        return res.status(500).json({ ok: false, error: 'Сервер не настроен' });
    }

    const body = req.body || {};
    const validation = validateLead(body);

    if (validation.spam) {
        return res.json({ ok: true });
    }
    if (validation.errors.length) {
        return res.status(400).json({ ok: false, errors: validation.errors });
    }

    const payload = {
        source: body.source || 'сайт',
        task: body.task || null,
        hasTz: body.hasTz || null,
        name: body.name.trim(),
        channel: channelLabels[body.channel] || body.channel,
        contact: body.contact.trim()
    };

    try {
        await sendTelegram(formatLeadMessage(payload));
        return res.json({ ok: true });
    } catch (err) {
        console.error('Lead delivery failed:', err.message);
        return res.status(502).json({ ok: false, error: 'Не удалось отправить заявку' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    if (!TOKEN || !CHAT_ID) {
        console.warn('Warning: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in server/.env');
    }
});
