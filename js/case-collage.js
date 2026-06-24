(function () {
    function escapeAttr(value) {
        return String(value).replace(/"/g, '&quot;');
    }

    function resolveImageSrc(src, basePath) {
        if (!basePath) return src;
        if (src.startsWith('http') || src.startsWith('../') || src.startsWith('/')) return src;
        return basePath + src;
    }

    function renderCollageHtml(images, altBase, basePath) {
        if (!images || !images.length) return '';

        const hero = resolveImageSrc(images[0], basePath);
        const side = images.slice(1, 3);

        const sideHtml = side.length
            ? `<div class="case-collage-stack">
                ${side.map((src, i) => {
                    const full = resolveImageSrc(src, basePath);
                    return `<button type="button" class="case-collage-item" data-open-image="${escapeAttr(full)}">
                        <img src="${full}" alt="${altBase} — экран ${i + 2}" loading="lazy">
                    </button>`;
                }).join('')}
            </div>`
            : '';

        return `
            <button type="button" class="case-collage-item case-collage-item--hero" data-open-image="${escapeAttr(hero)}">
                <img src="${hero}" alt="${altBase} — главный экран" loading="lazy">
            </button>
            ${sideHtml}
        `;
    }

    function renderCollageAccentHtml(images) {
        const show = (images || []).slice(0, 3);
        if (!show.length) return '';
        return `<div class="portfolio-collage-accent" aria-hidden="true">
            ${show.map((src) => `<span class="portfolio-collage-accent-item"><img src="${src}" alt="" loading="lazy"></span>`).join('')}
        </div>`;
    }

    window.CaseCollage = {
        render: renderCollageHtml,
        renderAccent: renderCollageAccentHtml,
        resolve: resolveImageSrc
    };
})();
