// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Scroll Reveal
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });
document.querySelectorAll('.section').forEach(section => observer.observe(section));

// Typewriter
const textElement = document.querySelector('.typewriter-text');
const phrases = ['7 лет в разработке', '100+ реализованных проектов', 'Работаю по договору', 'Помогаю воплотить идею в код'];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function type() {
    if (!textElement) return;
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
        textElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        textElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }
    let typeSpeed = isDeleting ? 30 : 60;
    if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 1500; isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; typeSpeed = 300;
    }
    setTimeout(type, typeSpeed);
}
document.addEventListener('DOMContentLoaded', type);

// Lightbox
function openLightbox(imgSrc) {
    document.getElementById('lightbox-img').src = imgSrc;
    document.getElementById('lightbox').classList.add('active');
}
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

// Portfolio grid
function getCaseImages(id) {
    const d = window.caseData[id];
    return d.images && d.images.length ? d.images : [d.img];
}

function getSlideState(grid) {
    try {
        return JSON.parse(grid.dataset.slideState || '{}');
    } catch {
        return {};
    }
}

function setSlideState(grid, state) {
    grid.dataset.slideState = JSON.stringify(state);
}

function updateCaseGallery(item, slideIndex) {
    const images = getCaseImages(item.dataset.case);
    const safeIndex = ((slideIndex % images.length) + images.length) % images.length;
    const src = images[safeIndex];
    const mainBtn = item.querySelector('[data-open-image]');
    const mainImg = item.querySelector('.portfolio-gallery-main');
    if (mainImg) {
        mainImg.src = src;
        mainImg.alt = `${window.caseData[item.dataset.case].title} — экран ${safeIndex + 1}`;
    }
    if (mainBtn) mainBtn.setAttribute('data-open-image', src);
    item.querySelectorAll('.portfolio-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === safeIndex);
    });
}

function renderPortfolioGrid() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    const slideState = getSlideState(grid);

    const order = window.caseOrder.filter((id) => {
        const page = window.caseData[id]?.page;
        return Boolean(page?.hasPage && page.url);
    });

    grid.innerHTML = order.map((id) => {
        const d = window.caseData[id];
        const images = getCaseImages(id);
        const slideIndex = Math.min(slideState[id] || 0, images.length - 1);
        const currentSrc = images[slideIndex];
        const page = d.page || {};
        const hasPage = page.hasPage && page.url;
        const isFeatured = Boolean(page.featured);
        const mediaHtml = `<div class="portfolio-gallery">
            <button type="button" class="portfolio-card-visual" data-open-image="${currentSrc.replace(/"/g, '&quot;')}">
                <div class="portfolio-card-img-wrap">
                    <img class="portfolio-gallery-main" src="${currentSrc}" alt="${d.title}" loading="lazy">
                </div>
                <span class="portfolio-image-note">${images.length > 1 ? `${slideIndex + 1} / ${images.length} · открыть` : 'Открыть превью'}</span>
            </button>
            ${images.length > 1 ? `<div class="portfolio-gallery-thumbs" role="tablist" aria-label="Скриншоты проекта">
                ${images.map((src, i) => `
                    <button type="button" class="portfolio-thumb${i === slideIndex ? ' active' : ''}"
                        role="tab" aria-selected="${i === slideIndex ? 'true' : 'false'}"
                        data-slide="${i}" aria-label="Экран ${i + 1}">
                        <img src="${src}" alt="" loading="lazy">
                    </button>
                `).join('')}
            </div>` : ''}
        </div>`;

        const pageLinkHtml = hasPage
            ? `<a href="${page.url}" class="case-page-link primary-btn">Подробнее о проекте</a>`
            : '';

        return `
            <article class="portfolio-item is-open${isFeatured ? ' is-featured' : ''}${hasPage ? ' has-case-page' : ''}" data-case="${id}">
                <div class="portfolio-summary" aria-expanded="true">
                    <div class="portfolio-summary-main">
                        <h3>${d.title}</h3>
                        <p>${d.desc}</p>
                    </div>
                </div>
                <div class="portfolio-panel">
                    <div class="portfolio-panel-media">
                        ${mediaHtml}
                    </div>
                    <div class="portfolio-panel-body">
                        <div class="portfolio-panel-meta">
                            <div>
                                <h4>Задача</h4>
                                <p>${d.task}</p>
                            </div>
                            <div>
                                <h4>Что реализовано</h4>
                                <div class="feature-lines">
                                    ${d.features.map((item) => `<span>${item}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                        ${pageLinkHtml}
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function initPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    renderPortfolioGrid();

    grid.addEventListener('click', (e) => {
        const thumb = e.target.closest('.portfolio-thumb');
        if (thumb) {
            e.preventDefault();
            e.stopPropagation();
            const item = thumb.closest('.portfolio-item');
            if (!item) return;
            const caseId = item.dataset.case;
            const slideIndex = parseInt(thumb.dataset.slide, 10);
            const slideState = getSlideState(grid);
            slideState[caseId] = slideIndex;
            setSlideState(grid, slideState);
            updateCaseGallery(item, slideIndex);
            return;
        }

        const imageBtn = e.target.closest('[data-open-image]');
        if (imageBtn) {
            e.preventDefault();
            e.stopPropagation();
            openLightbox(imageBtn.getAttribute('data-open-image'));
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initPortfolio();
    initContactChannel(document.getElementById('quizForm'));
});

// Quiz modal
function openModal() { document.getElementById('cost-modal').classList.add('active'); }
function closeModal() { document.getElementById('cost-modal').classList.remove('active'); }

const costModalEl = document.getElementById('cost-modal');
if (costModalEl) {
    costModalEl.addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
}

function quizNextStep(stepNum) {
    if (stepNum === 2) {
        const task = document.getElementById('taskInput').value.trim();
        if (!task) { document.getElementById('taskInput').focus(); return; }
    }
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
    document.getElementById('step' + stepNum).classList.add('active');
}

const quizFormEl = document.getElementById('quizForm');
if (quizFormEl) {
    quizFormEl.addEventListener('submit', async function (e) {
        e.preventDefault();
        showFormError(this, '');

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }

    const task = document.getElementById('taskInput').value.trim();
    const tz = document.querySelector('input[name="tz"]:checked')?.value || 'не указано';
    const name = document.getElementById('contactName').value.trim();
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
            source: 'квиз «Обсудить проект»',
            task,
            hasTz: tz,
            name,
            channel,
            contact,
            website: this.querySelector('[name="website"]')?.value || ''
        });
        trackLeadSubmit();
        closeModal();
        this.reset();
        document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
        document.getElementById('step1').classList.add('active');
        initContactChannel(this);
        alert('Спасибо! Я свяжусь с вами в ближайшее время.');
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
