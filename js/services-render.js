(function () {
    'use strict';

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function pad2(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    function renderSubsectionItem(sub) {
        return (
            '<li class="services-subsection-item">' +
                '<a href="' + escapeHtml(sub.href) + '" class="services-subsection-link">' +
                    '<span class="services-subsection-title">' + escapeHtml(sub.title) + '</span>' +
                    '<span class="services-subsection-arrow" aria-hidden="true">↗</span>' +
                '</a>' +
            '</li>'
        );
    }

    function renderHubAccordionCard(service, index) {
        var desc = (service.homeCard && service.homeCard.desc) || (service.seo && service.seo.description) || '';

        return (
            '<article class="services-card services-card--link">' +
                '<a href="' + escapeHtml(service.route) + '" class="services-card-link">' +
                    '<span class="services-card-index">' + pad2(index + 1) + '</span>' +
                    '<span class="services-card-title-wrap">' +
                        '<span class="services-card-title">' + escapeHtml(service.title) + '</span>' +
                        '<span class="services-card-desc">' + escapeHtml(desc) + '</span>' +
                    '</span>' +
                    '<span class="services-card-icon" aria-hidden="true">↗</span>' +
                '</a>' +
            '</article>'
        );
    }

    function renderStickySlide(service, index, total) {
        var home = service.homeCard || {};
        var webglKind = home.webglKind || 'hero';
        var sceneId = home.sceneId || '';
        var color = (home.webglColor || [0.64, 0.84, 1.0]).join(',');
        var title = home.titleShort || service.title;
        var desc = home.desc || '';
        var from = index % 2 === 0 ? 'left' : 'right';
        var webglAttrs = sceneId === 'telegram'
            ? ''
            : ' data-webgl-kind="' + escapeHtml(webglKind) + '" data-webgl-color="' + escapeHtml(color) + '"';
        var sceneCanvas = sceneId
            ? '<canvas class="service-scene-canvas" data-scene="' + escapeHtml(sceneId) + '" aria-hidden="true"></canvas>'
            : '';

        return (
            '<article class="service-slide" data-service="' + escapeHtml(service.id) + '" data-index="' + index + '" data-slide-from="' + from + '" style="--p:0">' +
                '<div class="service-slide-sticky">' +
                    '<div class="service-slide-glass" aria-hidden="true"></div>' +
                    '<div class="service-slide-inner">' +
                        '<div class="service-slide-copy">' +
                            '<span class="service-slide-num">' + pad2(index + 1) + ' / ' + pad2(total) + '</span>' +
                            '<h3 class="service-slide-title">' + escapeHtml(title) + '</h3>' +
                            '<p class="service-slide-desc">' + escapeHtml(desc) + '</p>' +
                            '<a href="' + escapeHtml(service.route) + '" class="cta-button service-slide-cta">Подробнее ↗</a>' +
                        '</div>' +
                        '<div class="service-slide-visual"' + webglAttrs + '>' +
                            sceneCanvas +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</article>'
        );
    }

    function initHubAccordion(root) {
        root.querySelectorAll('.services-card-toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var expanded = btn.getAttribute('aria-expanded') === 'true';
                var panel = document.getElementById(btn.getAttribute('aria-controls'));
                btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                if (panel) panel.hidden = expanded;
                btn.closest('.services-card').classList.toggle('is-open', !expanded);
            });
        });
    }

    function renderHub(containerId) {
        var root = document.getElementById(containerId);
        if (!root || !window.ServicesConfig) return;

        root.innerHTML = '<div class="services-accordion">' +
            window.ServicesConfig.getOrdered().map(renderHubAccordionCard).join('') +
            '</div>';
    }

    function renderHomeSticky(containerId) {
        var root = document.getElementById(containerId);
        if (!root || !window.ServicesConfig) return;

        var services = window.ServicesConfig.getOrdered();
        var total = services.length;

        root.innerHTML =
            '<div class="services-scroll">' +
                '<header class="services-scroll-head">' +
                    '<h2 class="services-main-title">Услуги</h2>' +
                '</header>' +
                '<div class="services-slides">' +
                    services.map(function (s, i) { return renderStickySlide(s, i, total); }).join('') +
                '</div>' +
            '</div>';

        document.dispatchEvent(new CustomEvent('services:home-rendered'));
    }

    function initServicesRender() {
        renderHomeSticky('servicesHomeCards');
        renderHub('servicesHub');
    }

    document.addEventListener('DOMContentLoaded', initServicesRender);

    window.ServicesRender = {
        renderHub: renderHub,
        renderHomeSticky: renderHomeSticky
    };
})();
