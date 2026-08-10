(function () {
    'use strict';

    function resolveAssetUrl(path) {
        if (!path) return '';
        if (/^https?:\/\//i.test(path)) return path;
        if (path.charAt(0) === '/') return path;
        var base = (window.SITE_CONFIG && window.SITE_CONFIG.imgBase) || '/assets/img/';
        if (base.charAt(0) !== '/') base = '/' + base;
        if (base.charAt(base.length - 1) !== '/') base += '/';
        return base + path.replace(/^\/?assets\/img\//, '');
    }

    function applyServiceChrome() {
        var body = document.body;
        var isServicePage = body.classList.contains('service-page');
        var isHubPage = body.classList.contains('services-hub-page');

        if (!document.getElementById('mobileMenu')) {
            var menu = document.createElement('div');
            menu.className = 'mobile-menu';
            menu.id = 'mobileMenu';
            menu.innerHTML =
                '<a href="/#portfolio"><span>01</span>Кейсы</a>' +
                '<a href="/#process"><span>02</span>Процесс</a>' +
                '<a href="/#about"><span>03</span>Обо мне</a>' +
                '<a href="/#faq"><span>04</span>FAQ</a>' +
                '<a href="/services/"><span>05</span>Услуги</a>' +
                '<a href="https://t.me/t6arev" target="_blank" rel="noopener noreferrer" class="mobile-cta">Написать в Telegram ↗</a>';
            document.body.appendChild(menu);
        }

        if (!isServicePage && !isHubPage) return;

        var nav = document.querySelector('.container > nav');
        if (nav && nav.dataset.chromeSynced !== '1') {
            nav.dataset.chromeSynced = '1';
            nav.innerHTML =
                '<a href="/" class="logo" aria-label="На главную">' +
                '<svg class="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<polyline points="16 18 22 12 16 6"></polyline>' +
                '<polyline points="8 6 2 12 8 18"></polyline>' +
                '</svg>' +
                '<span class="logo-text">dev2026.ru</span>' +
                '</a>' +
                '<div class="nav-links">' +
                '<a href="/#portfolio" class="nav-link">Кейсы</a>' +
                '<a href="/#process" class="nav-link">Процесс</a>' +
                '<a href="/#about" class="nav-link">Обо мне</a>' +
                '<a href="/#faq" class="nav-link">FAQ</a>' +
                '<a href="/#servicesHub" class="nav-link">Услуги</a>' +
                '</div>' +
                '<span class="nav-status"><span class="dot"></span>Открыт для проектов</span>' +
                '<a href="https://t.me/t6arev" target="_blank" rel="noopener noreferrer" class="cta-button">Начать проект ↗</a>' +
                '<button type="button" class="nav-toggle" id="navToggle" aria-label="Меню" aria-expanded="false">' +
                '<span></span><span></span><span></span>' +
                '</button>';
        }

        if (typeof window.initMobileMenu === 'function') {
            window.initMobileMenu();
        }
    }

    function initServiceCta() {
        var cta = document.querySelector('.service-page .final-cta');
        if (!cta) return;

        cta.classList.add('is-in');

        var primaryBtn = cta.querySelector('.cta-actions .primary-btn');
        if (primaryBtn && primaryBtn.dataset.ctaBound !== '1') {
            primaryBtn.dataset.ctaBound = '1';
            primaryBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (typeof window.openModal === 'function') {
                    window.openModal();
                }
            });
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function setText(el, text) {
        if (el) el.textContent = text || '';
    }

    function setHtml(el, html) {
        if (el) el.innerHTML = html || '';
    }

    function emptyState(title) {
        return (
            '<div class="service-empty-state">' +
            '<p class="service-empty-kicker">Раздел</p>' +
            '<p class="service-empty-text">Секция «' + escapeHtml(title) + '» заполняется контентом.</p>' +
            '</div>'
        );
    }

    function renderCopyHtml(html, fallbackTitle) {
        if (!html) return emptyState(fallbackTitle);
        return '<div class="service-copy">' + html + '</div>';
    }

    function isEmptyRender(html) {
        return !html || html.indexOf('service-empty-state') !== -1;
    }

    function setKicker(el, text) {
        if (!el) return;
        if (!text) {
            el.hidden = true;
            return;
        }
        el.hidden = false;
        el.innerHTML = '<span class="dot"></span>' + escapeHtml(text);
    }

    function setSection(sectionId, titleId, bodyId, title, bodyHtml, kickerId, kicker) {
        var section = document.getElementById(sectionId);
        if (!section) return;
        if (isEmptyRender(bodyHtml)) {
            section.hidden = true;
            return;
        }
        section.hidden = false;
        setText(document.getElementById(titleId), title);
        setHtml(document.getElementById(bodyId), bodyHtml);
        if (kickerId) setKicker(document.getElementById(kickerId), kicker);
    }

    function renderTypeRows(items, emptyTitle) {
        if (!items || !items.length) return emptyState(emptyTitle);
        return '<div class="service-type-list">' + items.map(function (item, index) {
            var from = index % 2 === 0 ? 'left' : 'right';
            var featured = index === 0 || index === 2 || index === 5;
            var title = typeof item === 'string' ? item : item.title;
            var text = typeof item === 'string' ? '' : item.text;
            var href = typeof item === 'object' && item.href ? item.href : '';
            var titleHtml = href
                ? '<a href="' + escapeHtml(href) + '" class="service-type-link">' + escapeHtml(title) + '<span class="service-type-link-arrow" aria-hidden="true">↗</span></a>'
                : escapeHtml(title);
            return (
                '<article class="service-type-row' + (href ? ' service-type-row--linked' : '') + '" data-from="' + from + '" data-type-index="' + index + '"' +
                (featured ? ' data-featured="true"' : '') + '>' +
                '<span class="service-type-num" aria-hidden="true">' + String(index + 1).padStart(2, '0') + '</span>' +
                '<div class="service-type-body">' +
                '<h3 class="service-type-title">' + titleHtml + '</h3>' +
                (text ? '<p class="service-type-text">' + escapeHtml(text) + '</p>' : '') +
                '</div>' +
                '</article>'
            );
        }).join('') + '</div>';
    }

    function renderAudience(audience, emptyTitle) {
        var items = audience.items || [];
        if (!items.length) return emptyState(emptyTitle);
        var slots = Math.min(audience.visibleSlots || 8, 8);
        var html = '<div class="service-audience-rotator">';
        html += '<p class="service-audience-line">';
        for (var i = 0; i < slots; i++) {
            if (i > 0) html += '<span class="service-audience-sep" aria-hidden="true">·</span>';
            html += (
                '<span class="service-audience-slot" data-slot="' + i + '">' +
                '<span class="service-audience-label is-in">' + escapeHtml(items[i % items.length]) + '</span>' +
                '</span>'
            );
        }
        html += '</p></div>';
        return html;
    }

    function renderProblemItems(items, emptyTitle) {
        if (!items || !items.length) return emptyState(emptyTitle);
        return '<div class="service-problem-list">' + items.map(function (item, index) {
            var featured = index % 3 === 0;
            var title = typeof item === 'string' ? item : item.title;
            var text = typeof item === 'string' ? '' : item.text;
            return (
                '<article class="service-problem-item" data-problem-index="' + index + '"' +
                (featured ? ' data-featured="true"' : '') + '>' +
                '<span class="service-problem-num" aria-hidden="true">' + String(index + 1).padStart(2, '0') + '</span>' +
                '<div class="service-problem-body">' +
                '<h3 class="service-problem-title">' + escapeHtml(title) + '</h3>' +
                (text ? '<p class="service-problem-text">' + escapeHtml(text) + '</p>' : '') +
                '</div>' +
                '</article>'
            );
        }).join('') + '</div>';
    }

    function renderTaskCards(items, emptyTitle) {
        if (!items || !items.length) return emptyState(emptyTitle);
        return '<div class="service-task-grid">' + items.map(function (item) {
            var title = typeof item === 'string' ? item : item.title;
            var text = typeof item === 'string' ? '' : item.text;
            return (
                '<article class="service-task-card">' +
                '<h3>' + escapeHtml(title) + '</h3>' +
                (text ? '<p>' + escapeHtml(text) + '</p>' : '') +
                '</article>'
            );
        }).join('') + '</div>';
    }

    function renderSolutions(items, emptyTitle) {
        if (!items || !items.length) return emptyState(emptyTitle);
        return (
            '<ul class="service-solutions-list">' +
            items.map(function (item, index) {
                var caseHref = '';
                var caseTitle = '';
                if (item.caseId && window.caseData && window.caseData[item.caseId]) {
                    caseHref = window.ServicesConfig.getCaseUrl(item.caseId);
                    caseTitle = window.caseData[item.caseId].title;
                }
                return (
                    '<li class="service-solution-item" id="' + escapeHtml(item.slug || '') + '">' +
                    '<div class="service-solution-main">' +
                    '<span class="service-solution-num">' + String(index + 1).padStart(2, '0') + '</span>' +
                    '<a href="' + escapeHtml(item.href || '#') + '" class="service-solution-link">' + escapeHtml(item.title) + '</a>' +
                    '</div>' +
                    (caseHref ? '<a class="service-solution-badge" href="' + escapeHtml(caseHref) + '">Реализованный проект ↗</a>' : '') +
                    '</li>'
                );
            }).join('') +
            '</ul>'
        );
    }

    function renderSteps(items) {
        if (!items || !items.length) return emptyState('Процесс разработки');
        return (
            '<ol class="process-track service-process-track" id="serviceStepsTimeline">' +
            items.map(function (item, i) {
                return (
                    '<li class="process-step" data-step-index="' + i + '">' +
                    '<span class="num">' + String(i + 1).padStart(2, '0') + '</span>' +
                    '<h3>' + escapeHtml(item.title || '') + '</h3>' +
                    (item.text ? '<p>' + escapeHtml(item.text) + '</p>' : '') +
                    '</li>'
                );
            }).join('') +
            '</ol>'
        );
    }

    function renderTech(items) {
        if (!items || !items.length) return emptyState('Возможности');
        return (
            '<p class="service-tech-inline">' +
            items.map(function (item) {
                return '<span class="service-tech-keyword">' + escapeHtml(item) + '</span>';
            }).join('<span class="service-tech-sep" aria-hidden="true"> · </span>') +
            '</p>'
        );
    }

    function renderWhy(items, emptyTitle) {
        if (!items || !items.length) return emptyState(emptyTitle);
        return '<div class="service-why-grid">' + items.map(function (item) {
            var title = typeof item === 'string' ? item : item.title;
            var text = typeof item === 'string' ? '' : item.text;
            return (
                '<article class="service-why-card">' +
                '<h3>' + escapeHtml(title) + '</h3>' +
                (text ? '<p>' + escapeHtml(text) + '</p>' : '') +
                '</article>'
            );
        }).join('') + '</div>';
    }

    function renderCases(caseIds) {
        if (!caseIds || !caseIds.length) return emptyState('Реализованные проекты');
        var editorial = document.body.classList.contains('service-page--editorial');
        var cards = caseIds.map(function (caseId, index) {
            var data = window.caseData && window.caseData[caseId];
            if (!data) return '';
            var url = window.ServicesConfig.getCaseUrl(caseId);
            if (!url) return '';
            var title = data.title || 'Проект';

            // Editorial services: same Hov-B wipe rows as case "Похожие проекты"
            if (editorial) {
                return (
                    '<a href="' + escapeHtml(url) + '" class="case-related-case-card service-case-wipe" data-case-index="' + index + '">' +
                    '<span class="wipe-stack">' +
                    '<span class="wipe-line">' + escapeHtml(title) + ' <span aria-hidden="true">↗</span></span>' +
                    '<span class="wipe-line wipe-line--alt">Открыть проект <span aria-hidden="true">↗</span></span>' +
                    '</span>' +
                    '</a>'
                );
            }

            var thumb = resolveAssetUrl(data.img || (data.images && data.images[0]) || '');
            var thumbHtml = thumb
                ? '<span class="service-case-thumb"><img src="' + escapeHtml(thumb) + '" alt="" loading="lazy" decoding="async" width="160" height="100"></span>'
                : '';
            return (
                '<a href="' + escapeHtml(url) + '" class="service-case-card' + (thumb ? ' service-case-card--has-thumb' : '') + '" data-case-index="' + index + '">' +
                thumbHtml +
                '<span class="service-case-body">' +
                '<span class="service-case-cat">' + escapeHtml(data.category || 'Кейс') + '</span>' +
                '<span class="service-case-title">' + escapeHtml(title) + '</span>' +
                '<span class="service-case-link">Смотреть кейс ↗</span>' +
                '</span>' +
                '</a>'
            );
        }).filter(Boolean).join('');
        if (!cards) return emptyState('Реализованные проекты');
        return editorial ? '<div class="case-related-cases-grid service-cases-wipe">' + cards + '</div>' : cards;
    }

    function renderFaq(items) {
        if (!items || !items.length) return emptyState('FAQ');
        return '<div class="faq-list">' + items.map(function (item) {
            return (
                '<details class="faq-item">' +
                '<summary>' + escapeHtml(item.q) + '</summary>' +
                '<p>' + escapeHtml(item.a) + '</p>' +
                '</details>'
            );
        }).join('') + '</div>';
    }

    function upsertMeta(attr, key, value) {
        if (!value) return;
        var el = document.querySelector('meta[' + attr + '="' + key + '"]');
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            document.head.appendChild(el);
        }
        el.setAttribute('content', value);
    }

    function applySeo(service) {
        if (!service.seo) return;
        var base = (window.SITE_CONFIG && window.SITE_CONFIG.siteUrl) || 'https://dev2026.ru';
        var title = service.seo.title || service.title;
        var description = service.seo.description || '';
        var pageUrl = base + service.route;
        var image = (service.seo && service.seo.image) || (base + '/assets/brand/logo.jpg');

        document.title = title;
        var desc = document.querySelector('meta[name="description"]');
        if (desc && description) desc.setAttribute('content', description);
        var keys = document.querySelector('meta[name="keywords"]');
        if (keys && service.seo.keywords) keys.setAttribute('content', service.seo.keywords);
        var canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', pageUrl);

        // Keep social tags in sync with source meta (also present statically in HTML).
        upsertMeta('property', 'og:type', 'website');
        upsertMeta('property', 'og:locale', 'ru_RU');
        upsertMeta('property', 'og:url', pageUrl);
        upsertMeta('property', 'og:title', title);
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'og:image', image);
        upsertMeta('name', 'twitter:card', 'summary_large_image');
        upsertMeta('name', 'twitter:title', title);
        upsertMeta('name', 'twitter:description', description);
        upsertMeta('name', 'twitter:image', image);
    }

    function injectJsonLd(service) {
        var base = (window.SITE_CONFIG && window.SITE_CONFIG.siteUrl) || 'https://dev2026.ru';
        var faqEntities = (service.faq || []).map(function (item) {
            return {
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.a
                }
            };
        });

        var payload = [
            {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: (function () {
                    var crumbs = [
                        { '@type': 'ListItem', position: 1, name: 'Главная', item: base + '/' },
                        { '@type': 'ListItem', position: 2, name: 'Услуги', item: base + '/services/' }
                    ];
                    if (service.parent) {
                        crumbs.push({ '@type': 'ListItem', position: 3, name: service.parent.title, item: base + service.parent.route });
                        crumbs.push({ '@type': 'ListItem', position: 4, name: service.title, item: base + service.route });
                    } else {
                        crumbs.push({ '@type': 'ListItem', position: 3, name: service.title, item: base + service.route });
                    }
                    return crumbs;
                })()
            },
            {
                '@context': 'https://schema.org',
                '@type': 'Service',
                name: service.title,
                description: (service.seo && service.seo.description) || '',
                serviceType: service.title,
                areaServed: 'RU',
                provider: {
                    '@type': 'Person',
                    name: 'dev2026.ru'
                },
                url: base + service.route
            }
        ];

        if (faqEntities.length) {
            payload.push({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqEntities
            });
        }

        var script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(payload);
        document.head.appendChild(script);
    }

    function initLeadForm(service) {
        var form = document.getElementById('serviceLeadForm');
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = form.elements.name.value.trim();
            var telegram = form.elements.telegram.value.trim();
            var task = form.elements.task.value.trim();
            var username = ((window.SITE_CONFIG && window.SITE_CONFIG.telegramLeadUsername) || 't6arev').replace(/^@/, '');
            var text = [
                'Новая заявка с услуги',
                'Страница: ' + service.title,
                'Имя: ' + (name || '—'),
                'Telegram: ' + (telegram || '—'),
                'Описание: ' + (task || '—'),
                'URL: ' + window.location.href
            ].join('\n');
            var url = 'https://t.me/' + username + '?text=' + encodeURIComponent(text);
            window.open(url, '_blank', 'noopener,noreferrer');
        });
    }

    function initServicePage() {
        applyServiceChrome();

        var body = document.body;
        if (body.classList.contains('service-page')) {
            initServiceCta();
        }

        if (!body.classList.contains('service-page')) return;

        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
            window.scrollTo(0, 0);
        }

        var serviceId = body.dataset.serviceId;
        var service = window.ServicesConfig && window.ServicesConfig.getService(serviceId);
        if (!service) return;

        applySeo(service);
        injectJsonLd(service);

        var hero = service.hero || {};
        setText(document.getElementById('serviceHeroKicker'), hero.kicker);
        setText(document.getElementById('serviceHeroTitle'), hero.title || service.title);
        setText(document.getElementById('serviceHeroLead'), hero.lead);

        var heroActions = document.querySelector('.service-hero-actions');
        if (heroActions) {
            var heroPrimary = heroActions.querySelector('.primary-btn');
            var heroSecondary = heroActions.querySelector('.secondary-btn');
            if (heroPrimary && hero.ctaPrimary) heroPrimary.textContent = hero.ctaPrimary;
            if (heroSecondary && hero.ctaSecondary) heroSecondary.textContent = hero.ctaSecondary;
        }

        var bcParent = document.getElementById('serviceBreadcrumbParent');
        var bcParentSep = document.getElementById('serviceBreadcrumbParentSep');
        var bcWrap = document.querySelector('.service-breadcrumbs');
        if (service.parent && bcParent) {
            bcParent.href = service.parent.route;
            bcParent.textContent = service.parent.title;
            bcParent.hidden = false;
            if (bcParentSep) bcParentSep.hidden = false;
        } else if (bcParent) {
            bcParent.hidden = true;
            if (bcParentSep) bcParentSep.hidden = true;
        }
        if (bcWrap) bcWrap.classList.add('is-visible');
        setText(document.getElementById('serviceBreadcrumbCurrent'), hero.title || service.title);
        if (service.parent && document.body) {
            document.body.classList.add('service-page--child');
        }

        var visual = document.getElementById('serviceHeroVisual');
        if (visual && service.homeCard && service.homeCard.sceneId) {
            var scene = visual.querySelector('.service-scene-canvas');
            if (scene) {
                scene.setAttribute('data-scene', service.homeCard.sceneId);
                if (window.MotionScenes && typeof window.MotionScenes.refresh === 'function') {
                    window.MotionScenes.refresh();
                }
            }
        }

        var desc = service.description || {};
        setText(document.getElementById('serviceDescTitle'), desc.title || 'О направлении');
        setHtml(document.getElementById('serviceDescBody'), renderCopyHtml(desc.body, desc.title || 'О направлении'));

        var audience = service.audience || {};
        setSection(
            'service-audience',
            'serviceAudienceTitle',
            'serviceAudienceBody',
            audience.title || 'Кому подойдёт разработка Telegram-бота',
            renderAudience(audience, audience.title || 'Аудитория'),
            'serviceAudienceKicker',
            audience.kicker
        );

        var problems = service.problems || {};
        setSection(
            'service-problems',
            'serviceProblemsTitle',
            'serviceProblemsBody',
            problems.title || 'Какие задачи решает Telegram-бот',
            renderProblemItems(problems.items, problems.title || 'Задачи'),
            'serviceProblemsKicker',
            problems.kicker
        );

        var tasks = service.tasks || {};
        setSection(
            'service-tasks',
            'serviceTasksTitle',
            'serviceTasksBody',
            tasks.title || 'Какие решения разрабатываю',
            renderTypeRows(tasks.items, tasks.title || 'Решения'),
            'serviceTasksKicker',
            tasks.kicker
        );

        var solutions = service.solutions || {};
        var solutionItems = solutions.items;
        if (solutionItems && solutionItems.length) {
            setSection(
                'service-solutions',
                'serviceSolutionsTitle',
                'serviceSolutionsBody',
                solutions.title || 'Какие решения разрабатываю',
                renderSolutions(solutionItems, solutions.title || 'Решения')
            );
        } else {
            var solutionsSection = document.getElementById('service-solutions');
            if (solutionsSection) solutionsSection.hidden = true;
        }

        var steps = service.steps || {};
        setSection(
            'service-steps',
            'serviceStepsTitle',
            'serviceStepsBody',
            steps.title || 'Процесс разработки',
            renderSteps(steps.items),
            'serviceStepsKicker',
            steps.kicker
        );

        var tech = service.tech || {};
        setSection(
            'service-tech',
            'serviceTechTitle',
            'serviceTechBody',
            tech.title || 'Технологии',
            renderTech(tech.items),
            'serviceTechKicker',
            tech.kicker
        );

        var why = service.why || {};
        setSection(
            'service-why',
            'serviceWhyTitle',
            'serviceWhyBody',
            why.title || 'Почему Telegram-боты',
            renderWhy(why.items, why.title || 'Почему Telegram-боты')
        );

        setText(document.getElementById('serviceCasesTitle'), (service.cases && service.cases.title) || 'Реализованные проекты');
        setKicker(document.getElementById('serviceCasesKicker'), (service.cases && service.cases.kicker) || 'КЕЙСЫ');
        setHtml(document.getElementById('serviceCasesBody'), renderCases(service.relatedCaseIds));

        setText(document.getElementById('serviceFaqTitle'), (service.faqBlock && service.faqBlock.title) || 'FAQ');
        setKicker(document.getElementById('serviceFaqKicker'), (service.faqBlock && service.faqBlock.kicker) || 'ВОПРОСЫ И ОТВЕТЫ');
        setHtml(document.getElementById('serviceFaqBody'), renderFaq(service.faq));

        var finalCta = service.finalCta || {};
        var ctaSection = document.querySelector('.service-page .final-cta');
        if (ctaSection) {
            var ctaTitle = ctaSection.querySelector('h3');
            var ctaLead = ctaSection.querySelector('p');
            if (ctaTitle && finalCta.title) ctaTitle.textContent = finalCta.title;
            if (ctaLead && finalCta.lead) ctaLead.textContent = finalCta.lead;
        }

        initLeadForm(service);
        initServiceCta();

        if (typeof window.refreshMotionReveal === 'function') {
            window.refreshMotionReveal(document.querySelector('.container'));
        }

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                if (typeof window.initFaqMotion === 'function') {
                    window.initFaqMotion();
                }
                if (typeof window.bindServiceProcessTimeline === 'function') {
                    window.bindServiceProcessTimeline();
                }
                if (typeof window.bindServiceProcessScrollSteps === 'function') {
                    window.bindServiceProcessScrollSteps();
                }
                if (typeof window.initServiceAudienceRotator === 'function') {
                    window.initServiceAudienceRotator(service.audience && service.audience.items);
                }
                if (typeof window.initServiceCasesMotion === 'function') {
                    window.initServiceCasesMotion();
                }
                if (typeof window.initServicePageLists === 'function') {
                    window.initServicePageLists();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', initServicePage);
})();
