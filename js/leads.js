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

function trackMetrikaGoal(goal) {
    const counterId = window.SITE_CONFIG && window.SITE_CONFIG.metrikaId;
    if (goal && typeof ym === 'function' && counterId) {
        ym(counterId, 'reachGoal', goal);
    }
}

function trackLeadSubmit() {
    trackMetrikaGoal('lead_submit');
}

function trackLeadQuizSuccess() {
    trackMetrikaGoal('lead_quiz_success');
}

function trackLeadCallbackSuccess() {
    trackMetrikaGoal('lead_callback_success');
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
    const channelBtns = formEl.querySelectorAll('.channel-btn[data-channel], .channel-selector [data-channel], .ch[data-channel]');
    const contactWrap = formEl.querySelector('.contact-field-wrap');
    const contactInput = formEl.querySelector('.contact-value-input');
    const channelHidden = formEl.querySelector('input[name="channel"]');

    if (!channelBtns.length || !contactInput) return;
    if (formEl.dataset.channelInited === '1') return;
    formEl.dataset.channelInited = '1';

    function setChannel(channel, btn, shouldFocus = true) {
        channelBtns.forEach((b) => {
            b.classList.toggle('active', b === btn);
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        if (channelHidden) channelHidden.value = channel;
        contactInput.placeholder = getContactPlaceholder(channel);
        // Не меняем type в том же жесте клика — на мобильных ломает фокус с 1-го раза.
        // inputmode достаточно для клавиатуры телефона/email.
        contactInput.removeAttribute('type');
        contactInput.setAttribute('type', 'text');
        if (channel === 'email') contactInput.setAttribute('inputmode', 'email');
        else if (channel === 'phone') contactInput.setAttribute('inputmode', 'tel');
        else contactInput.setAttribute('inputmode', 'text');
        contactInput.name = 'contact';
        if (contactWrap) contactWrap.classList.add('visible');
        if (shouldFocus) {
            // Фокус после отрисовки active/placeholder
            requestAnimationFrame(() => {
                contactInput.focus({ preventScroll: false });
                try { contactInput.select(); } catch (_) { /* ignore */ }
            });
        }
    }

    channelBtns.forEach((btn) => {
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setChannel(btn.dataset.channel, btn, true);
        });
    });

    const defaultBtn = formEl.querySelector('[data-channel="telegram"]') || channelBtns[0];
    if (defaultBtn) setChannel(defaultBtn.dataset.channel || 'telegram', defaultBtn, false);
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

function resetHudChannel(formEl) {
    const channels = formEl.querySelector('[data-channels]');
    const channelHidden = formEl.querySelector('input[name="channel"]');
    const contactInput = formEl.querySelector('.contact-value-input');
    const def = formEl.querySelector('[data-channel="telegram"]');
    if (def && channels) {
        channels.querySelectorAll('.ch, .channel-btn').forEach((b) => {
            b.classList.toggle('active', b === def);
        });
    }
    if (channelHidden) channelHidden.value = 'telegram';
    if (contactInput) contactInput.placeholder = getContactPlaceholder('telegram');
}

function initHudLeadForms() {
    document.querySelectorAll('[data-lead-form]').forEach((form) => {
        if (form.dataset.leadInited === '1') return;
        form.dataset.leadInited = '1';
        initContactChannel(form);

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            showFormError(this, '');

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalLabel = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
            }

            const nameInput = this.querySelector('[name="name"]') || this.querySelector('[name="contactName"]');
            const name = nameInput ? nameInput.value.trim() : '';
            const channel = this.querySelector('input[name="channel"]')?.value || 'telegram';
            const contact = this.querySelector('.contact-value-input')?.value.trim() || '';
            const pdn = this.querySelector('[name="pdn"]');
            const pageTitle = document.body.dataset.caseId && window.caseData?.[document.body.dataset.caseId]?.title;

            if (!name || name.length < 2) {
                showFormError(this, 'Укажите имя');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalLabel;
                }
                return;
            }

            if (pdn && !pdn.checked) {
                showFormError(this, 'Подтвердите согласие на обработку персональных данных');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalLabel;
                }
                return;
            }

            const contactError = validateContact(channel, contact);
            if (contactError) {
                showFormError(this, contactError);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalLabel;
                }
                return;
            }

            const source = this.dataset.leadSource
                || (pageTitle ? `страница кейса «${pageTitle}»` : 'сайт');
            const task = pageTitle ? `Интересует похожий проект: ${pageTitle}` : undefined;

            try {
                const payload = {
                    source,
                    name,
                    channel,
                    contact,
                    website: this.querySelector('[name="website"]')?.value || ''
                };
                if (task) payload.task = task;

                const leadResult = await submitLead(payload);
                if (!leadResult?.fallback) {
                    if (this.id === 'quizForm') trackLeadQuizSuccess();
                    else if (this.id === 'callbackForm') trackLeadCallbackSuccess();
                    else trackLeadSubmit();
                }

                if (this.closest('#cost-modal') && typeof window.closeModal === 'function') {
                    window.closeModal();
                }
                const floatPanel = document.getElementById('floatPanel');
                const floatToggle = document.getElementById('floatToggle');
                if (this.id === 'callbackForm' && floatPanel && floatToggle) {
                    floatPanel.classList.remove('open');
                    floatToggle.classList.remove('open');
                }

                this.reset();
                initContactChannel(this);
                resetHudChannel(this);
                showSuccessToast();
            } catch (err) {
                showFormError(this, err.message || 'Не удалось отправить заявку');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalLabel;
                }
            }
        });
    });
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
        <button type="button" class="site-toast-close" aria-label="Закрыть">&times;</button>
        <span class="site-toast-icon">${type === 'success' ? '✓' : '!'}</span>
        <span class="site-toast-text">${message}</span>
    `;
    stack.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('is-visible'));

    const hide = () => {
        toast.classList.add('is-exit');
        setTimeout(() => toast.remove(), 260);
    };

    const closeBtn = toast.querySelector('.site-toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            hide();
        });
    }

    setTimeout(hide, duration);
}

const LAB_THANK_YOU_VARIANTS = [
    'Спасибо! Заявка отправлена. Свяжусь с вами в ближайшее время, чтобы обсудить детали.',
    'Отлично, заявка принята! Я отвечу в течение 1 рабочего дня и предложу удобный формат старта.',
    'Благодарю за обращение! Подготовлю решение под вашу задачу и вернусь с планом работ и вилкой по срокам.',
    'Спасибо! Получил(а) заявку. Сейчас уточняю вводные — и скоро напишу вам с предложением по следующему шагу.',
];

// Export variants for the lab UI
window.LAB_THANK_YOU_VARIANTS = LAB_THANK_YOU_VARIANTS;

function isLabEnv() {
    const h = (window.location && window.location.hostname) || '';
    return /^localhost$/i.test(h) || /^127\.0\.0\.1$/i.test(h);
}

function getLabThankYouVariantMessage() {
    if (!isLabEnv()) return null;
    try {
        const idxRaw = localStorage.getItem('leadThankYouVariantIdx');
        const idx = idxRaw === null ? 0 : Number(idxRaw);
        if (Number.isInteger(idx) && idx >= 0 && idx < LAB_THANK_YOU_VARIANTS.length) {
            return LAB_THANK_YOU_VARIANTS[idx];
        }
    } catch (_) { /* ignore */ }
    return LAB_THANK_YOU_VARIANTS[0];
}

function showSuccessToast(message) {
    // On live site keep current default behavior unless caller explicitly passes message.
    const labMsg = (message === undefined) ? getLabThankYouVariantMessage() : null;
    const finalMsg = (message !== undefined && message !== null) ? message : (labMsg || 'Спасибо! Свяжусь с вами в ближайшее время.');
    showSiteToast(finalMsg, 'success', 2000);
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
                <button type="button" class="float-tg-btn" onclick="if (window.openModal) window.openModal(); return false;">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                    </svg>
                    Написать в Telegram
                </button>
            </div>
            <div class="float-tab-content" id="floatTabCall">
                <form id="callbackForm" class="f-hud f-hud--float" data-lead-form data-lead-source="виджет «Заказать звонок»" novalidate>
                    <input type="text" name="website" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true">
                    <div class="field">
                        <input type="text" placeholder="Как к вам обращаться" name="name" required autocomplete="name">
                    </div>
                    <div class="field">
                        <div class="channels" data-channels role="group" aria-label="Куда написать">
                            <button type="button" class="ch active" data-channel="telegram">Telegram</button>
                            <button type="button" class="ch" data-channel="phone">Телефон</button>
                            <button type="button" class="ch" data-channel="email">Почта</button>
                        </div>
                        <input type="hidden" name="channel" value="telegram">
                    </div>
                    <div class="field">
                        <input type="text" class="contact-value-input" name="contact" placeholder="@username или t.me/..." required>
                    </div>
                    <label class="ui-a-check consent-wrap">
                        <input type="checkbox" name="pdn" required>
                        <span class="mark">✓</span>
                        <span class="txt">Ознакомлен(а) с <a href="/privacy-policy.html" target="_blank" rel="noopener">Политикой конфиденциальности</a> и даю согласие на <a href="/privacy-policy.html" target="_blank" rel="noopener">обработку персональных данных</a></span>
                    </label>
                    <button type="submit" class="submit">Отправить заявку</button>
                    <p class="form-error" hidden></p>
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

    if (!widget || !panel || !toggle || !callbackForm) return;
    if (callbackForm.dataset.floatInited === '1') return;
    callbackForm.dataset.floatInited = '1';

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
}

document.addEventListener('DOMContentLoaded', function () {
    initFloatWidget();
    initHudLeadForms();
});
