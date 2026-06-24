const CHANNEL_LABELS = {
    telegram: 'Telegram',
    phone: 'Телефон',
    email: 'Почта'
};

const VALIDATORS = {
    telegram: (v) => v.trim().length >= 3,
    phone: (v) => /^[\d\s+\-()]{7,20}$/.test(v.trim()),
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
};

const PLACEHOLDERS = {
    telegram: '@username или t.me/...',
    phone: '+7 (999) 123-45-67',
    email: 'email@example.com'
};

function buildLeadText(data) {
    const lines = [
        'Новая заявка с dev2026.ru',
        '',
        `Источник: ${data.source || 'сайт'}`,
        `Имя: ${data.name || '—'}`,
        `Канал: ${CHANNEL_LABELS[data.channel] || data.channel || '—'}`,
        `Контакт: ${data.contact || '—'}`
    ];

    if (data.task) lines.push(`Задача: ${data.task}`);
    if (data.hasTz) lines.push(`ТЗ: ${data.hasTz}`);
    lines.push(`Страница: ${window.location.href}`);

    return lines.join('\n');
}

function sendLeadToTelegram(data) {
    const username = window.SITE_CONFIG.telegramLeadUsername || 't6arev';
    const text = encodeURIComponent(buildLeadText(data));
    const url = `https://t.me/${username}?text=${text}`;

    const newTab = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newTab) {
        window.location.href = url;
    }
}

function trackLeadSubmit() {
    const counterId = window.SITE_CONFIG.metrikaId;
    if (typeof ym === 'function') {
        ym(counterId, 'reachGoal', 'lead_submit');
    }
}

async function submitLead(data) {
    try {
        const response = await fetch(window.SITE_CONFIG.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        let body = {};
        try {
            body = await response.json();
        } catch (_) {
            body = {};
        }

        if (!response.ok) {
            throw new Error(body.errors?.join('\n') || body.error || 'Ошибка отправки');
        }
        return body;
    } catch (_) {
        // Fallback: если API недоступен, открываем диалог с @t6arev и подставляем заявку.
        sendLeadToTelegram(data);
        return { ok: true, fallback: 'telegram' };
    }
}

function validateContact(channel, value) {
    if (!channel) return 'Выберите способ связи';
    if (!value || !value.trim()) return 'Заполните контактные данные';
    if (!VALIDATORS[channel](value)) {
        if (channel === 'email') return 'Некорректный email';
        if (channel === 'phone') return 'Некорректный номер телефона';
        return 'Укажите @username или ссылку Telegram';
    }
    return null;
}

function getContactPlaceholder(channel) {
    return PLACEHOLDERS[channel] || 'Контакт';
}

function initContactChannel(formEl) {
    const channelBtns = formEl.querySelectorAll('[data-channel]');
    const contactWrap = formEl.querySelector('.contact-field-wrap');
    const contactInput = formEl.querySelector('.contact-value-input');
    const channelHidden = formEl.querySelector('input[name="channel"]');

    if (!channelBtns.length || !contactInput) return;

    function setChannel(channel, btn, shouldFocus = true) {
        channelBtns.forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        if (channelHidden) channelHidden.value = channel;
        contactInput.placeholder = getContactPlaceholder(channel);
        contactInput.type = channel === 'email' ? 'email' : (channel === 'phone' ? 'tel' : 'text');
        contactInput.name = 'contact';
        contactWrap.classList.add('visible');
        if (shouldFocus) contactInput.focus();
    }

    channelBtns.forEach(btn => {
        btn.addEventListener('click', () => setChannel(btn.dataset.channel, btn, true));
    });

    const defaultBtn = formEl.querySelector('[data-channel="telegram"]');
    if (defaultBtn) setChannel('telegram', defaultBtn, false);
}

function showFormError(formEl, message) {
    let err = formEl.querySelector('.form-error');
    if (!err) {
        err = document.createElement('p');
        err.className = 'form-error';
        formEl.appendChild(err);
    }
    err.textContent = message;
    err.hidden = !message;
}

function showFormSuccess(container, html) {
    container.innerHTML = html;
}
