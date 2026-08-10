function escapeAttr(value) {
    return String(value).replace(/"/g, '&quot;');
}

function initCaseCollage(caseId, container, basePath) {
    if (!container || !window.caseData[caseId] || !window.CaseCollage) return;
    const data = window.caseData[caseId];
    const images = (data.images && data.images.length) ? data.images : (data.img ? [data.img] : []);
    if (!images.length) return;

    container.classList.remove('case-collage--robot');
    container.innerHTML = window.CaseCollage.render(images, data.title || 'Проект', basePath || '');
    container.setAttribute('aria-label', 'Превью проекта');

    container.querySelectorAll('[data-open-image]').forEach((btn) => {
        btn.addEventListener('click', () => openLightbox(btn.getAttribute('data-open-image')));
    });
}

function initCasePage() {
    const body = document.body;
    if (!body.classList.contains('case-page')) return;

    const caseId = body.dataset.caseId;
    const depth = body.dataset.assetBase || '../../';
    const data = window.caseData[caseId];
    if (!data) return;

    initCaseCollage(caseId, document.getElementById('caseCollage'), depth);

    const featuresList = document.getElementById('caseFeatures');
    if (featuresList && data.features) {
        featuresList.innerHTML = data.features.map((item) => `<span>${item}</span>`).join('');
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section').forEach((section) => observer.observe(section));

    const form = document.getElementById('caseContactForm');
    if (form) {
        initContactChannel(form);
        const pageTitle = data.title || 'кейс';
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            showFormError(form, '');

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            const name = form.querySelector('[name="contactName"]').value.trim();
            const channel = form.querySelector('input[name="channel"]').value;
            const contact = form.querySelector('.contact-value-input').value.trim();
            const task = form.querySelector('[name="task"]').value.trim()
                || `Интересует похожий проект: ${pageTitle}`;

            if (!name || name.length < 2) {
                showFormError(form, 'Укажите имя');
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            const contactError = validateContact(channel, contact);
            if (contactError) {
                showFormError(form, contactError);
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            try {
                await submitLead({
                    source: `страница кейса «${pageTitle}»`,
                    task,
                    name,
                    channel,
                    contact,
                    website: form.querySelector('[name="website"]')?.value || ''
                });
                trackLeadSubmit();
                showSuccessToast();
                form.reset();
                initContactChannel(form);
            } catch (err) {
                showFormError(form, err.message || 'Не удалось отправить заявку');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}

function openLightbox(imgSrc) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lb || !img) return;
    img.src = imgSrc;
    lb.classList.add('active');
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', initCasePage);
