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

function getTelegramUsername() {
    const raw = (window.SITE_CONFIG?.telegramLeadUsername || 't6arev').trim();
    return raw.replace(/^@/, '');
}

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
    const username = getTelegramUsername();
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
    const controller = new AbortController();
    const timeoutMs = 12000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(window.SITE_CONFIG.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            signal: controller.signal
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
    } catch (err) {
        const allowFallback = Boolean(window.SITE_CONFIG?.allowTelegramFallback);
        if (allowFallback) {
            sendLeadToTelegram(data);
            return { ok: true, fallback: 'telegram' };
        }
        if (err?.name === 'AbortError') {
            throw new Error('Сервер долго не отвечает. Проверьте VPS и HTTPS endpoint формы.');
        }
        throw new Error(`Не удалось отправить заявку. Проверьте endpoint: ${window.SITE_CONFIG.apiUrl}`);
    } finally {
        clearTimeout(timeoutId);
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

function getToastStack() {
    let stack = document.querySelector('.site-toast-stack');
    if (!stack) {
        stack = document.createElement('div');
        stack.className = 'site-toast-stack';
        document.body.appendChild(stack);
    }
    return stack;
}

function showSiteToast(message, type = 'success', duration = 5000) {
    const stack = getToastStack();
    const toast = document.createElement('div');
    toast.className = `site-toast site-toast--${type}`;
    toast.innerHTML = `
        <span class="site-toast-icon">${type === 'success' ? '✓' : '!'}</span>
        <span class="site-toast-text">${message}</span>
    `;
    stack.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('is-visible'));

    const hide = () => {
        toast.classList.add('is-exit');
        setTimeout(() => toast.remove(), 260);
    };

    setTimeout(hide, duration);
}

function showSuccessToast(message = 'Спасибо! Свяжусь с вами в ближайшее время.') {
    showSiteToast(message, 'success', 5000);
}

function ensureFloatWidget() {
    if (document.getElementById('floatWidget')) return;
    const username = getTelegramUsername();
    const widget = document.createElement('div');
    widget.id = 'floatWidget';
    widget.className = 'float-widget';
    widget.innerHTML = `
        <div class="float-panel" id="floatPanel">
            <div class="float-tabs">
                <button class="float-tab active" data-float-tab="tg">Написать в ТГ</button>
                <button class="float-tab" data-float-tab="call">Заявка</button>
            </div>
            <div class="float-tab-content active" id="floatTabTg">
                <a href="https://t.me/${username}" target="_blank" rel="noopener noreferrer" class="float-tg-btn">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                    </svg>
                    Написать в Telegram
                </a>
            </div>
            <div class="float-tab-content" id="floatTabCall">
                <form id="callbackForm">
                    <input type="text" name="website" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true">
                    <input type="text" class="float-input" placeholder="Ваше имя" name="name" required>
                    <p class="field-hint">Как связаться?</p>
                    <div class="channel-selector channel-selector--compact">
                        <button type="button" class="channel-btn" data-channel="telegram">ТГ</button>
                        <button type="button" class="channel-btn" data-channel="phone">Тел.</button>
                        <button type="button" class="channel-btn" data-channel="email">Почта</button>
                    </div>
                    <input type="hidden" name="channel" value="telegram">
                    <div class="contact-field-wrap visible">
                        <input type="text" class="float-input contact-value-input" placeholder="@username" required>
                    </div>
                    <button type="submit" class="float-submit">Отправить заявку</button>
                </form>
            </div>
        </div>
        <button class="float-toggle float-toggle--magnet" id="floatToggle" aria-label="Открыть контакты" type="button">
            <span class="float-magnet-arr" aria-hidden="true">↗</span>
            <span class="float-magnet-txt">Обсудить</span>
        </button>
    `;
    document.body.appendChild(widget);
}

function initFloatWidget() {
    ensureFloatWidget();
    const widget = document.getElementById('floatWidget');
    const panel = document.getElementById('floatPanel');
    const toggle = document.getElementById('floatToggle');
    const callbackForm = document.getElementById('callbackForm');

    if (!widget || !panel || !toggle || !callbackForm || callbackForm.dataset.inited === '1') return;
    callbackForm.dataset.inited = '1';

    toggle.addEventListener('click', () => {
        panel.classList.toggle('open');
        toggle.classList.toggle('open');
    });

    widget.querySelectorAll('.float-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            widget.querySelectorAll('.float-tab').forEach((el) => el.classList.remove('active'));
            widget.querySelectorAll('.float-tab-content').forEach((el) => el.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.floatTab === 'tg' ? 'floatTabTg' : 'floatTabCall';
            const tab = document.getElementById(tabId);
            if (tab) tab.classList.add('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!widget.contains(e.target) && panel.classList.contains('open')) {
            panel.classList.remove('open');
            toggle.classList.remove('open');
        }
    });

    initContactChannel(callbackForm);

    callbackForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        showFormError(this, '');

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalLabel = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
        }

        const name = this.querySelector('[name="name"]').value.trim();
        const channel = this.querySelector('input[name="channel"]').value;
        const contact = this.querySelector('.contact-value-input').value.trim();

        if (!name || name.length < 2) {
            showFormError(this, 'Укажите имя');
            if (submitBtn) submitBtn.disabled = false;
            return;
        }

        const contactError = validateContact(channel, contact);
        if (contactError) {
            showFormError(this, contactError);
            if (submitBtn) submitBtn.disabled = false;
            return;
        }

        try {
            await submitLead({
                source: 'виджет «Заказать звонок»',
                name,
                channel,
                contact,
                website: this.querySelector('[name="website"]')?.value || ''
            });
            trackLeadSubmit();
            showSuccessToast();
            this.reset();
            initContactChannel(this);
            panel.classList.remove('open');
            toggle.classList.remove('open');
        } catch (err) {
            showFormError(this, err.message || 'Не удалось отправить заявку');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalLabel;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initFloatWidget);
