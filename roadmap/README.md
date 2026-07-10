# Roadmap — dev2026.ru

Цели развития сайта-визитки.

## Текущий фокус: P0 — восстановление индексации 4 кейсов в Яндексе

**Workflow:** [`workflow/09-p0-case-reindex.md`](workflow/09-p0-case-reindex.md)  
**Аудит:** [`seo-audit-yandex-exclusion-dev2026-cases-2026-07-08.md`](../seo-audit-yandex-exclusion-dev2026-cases-2026-07-08.md)

Цель: деплой кластера `/services/*` + crawlable-перелинковка + правки bot6/bot2 → переобход в Вебмастере.

**Параллельный трек (после P0):** раздел «Услуги» + полные SEO-тексты — [`services-branch-plan.md`](services-branch-plan.md)

**Мастер-план услуг (2026-07-02, часть отложена до P1):**

1. [ ] Единый формат страниц — дизайн эталона `telegram-bots`
2. [ ] Корректировка SEO-текстов (кластеры из `вебмастер.md`)
3. [x] Блок `#servicesHub` на главной (базово) → **P0: nav на `/services/` + crawlable fallback**
4. [ ] ~10 SEO-страниц по шаблону (P0: только 7 URL)
5. [ ] Финальный SEO-проход + деплой → **P0: минимальный деплой**
6. [ ] Sitemap, Яндекс.Вебмастер, GSC, переобход → **P0: sitemap 14 URL + переобход 4 кейсов**

- [x] Фаза 0 infra: конфиг, hub, shells, шаблон, эталон `telegram-bots`
- [ ] Ревью дизайна эталона → затем текст и копирование на остальные
- [ ] sitemap + GSC — только после этапа 5–6

**Документы:** [`services-branch-plan.md`](services-branch-plan.md) · [`workflow/07-services-section.md`](workflow/07-services-section.md) · [`chat-summary-cursor.md`](chat-summary-cursor.md) · [`next-chat-prompt.md`](next-chat-prompt.md)

Параллельно (prod): ждём индекс GSC по 7 URL (кейсы + главная).

---

## Предыдущий фокус: индексация + SEO-рост

Базовый деплой и motion-редизайн закрыты. Сейчас:

- [x] 6 SEO-страниц кейсов + главная (7 URL в sitemap)
- [x] Motion-редизайн: `css/motion.css`, `js/motion.js` — главная + все кейсы
- [x] Google Search Console: подтверждение meta-тегом, sitemap, 7 страниц
- [x] Яндекс.Вебмастер: sitemap OK, переобход
- [x] Фикс коллажа в портфолио на главной (без рамки, ~88% на десктопе) — коммит `74a0edb`, на проде
- [ ] Через 2–7 дней проверить индекс в GSC (все 7 страниц)
- [ ] Посадочные услуг: `/telegram-boty/`, `/mini-apps/`, `/ai-boty/` …
- [ ] Блог (1–2 статьи в месяц)
- [ ] FAQPage JSON-LD на главной
- [ ] Яндекс.Метрика: цели `lead_submit_*`, `tg_click`
- [ ] Off-page: Habr/VC, Telegram-канал, профили Kwork/Profi

**Подробный план роста, траста, «800 запросов», цель 100/день** → [`workflow/05-seo-growth-ranking.md`](workflow/05-seo-growth-ranking.md)

---

## Этапы roadmap

| # | Этап | Статус | Документ |
|---|------|--------|----------|
| 1 | Формы + backend | ✅ готово | [`01-forms-and-backend.md`](workflow/01-forms-and-backend.md) |
| 2 | Digital-дизайн, motion | ✅ в основном | [`02-visual-system.md`](workflow/02-visual-system.md) |
| 3 | Кейсы (аккордеон, галерея) | ✅ 6 кейсов | [`03-cases-redesign.md`](workflow/03-cases-redesign.md) |
| 4 | Perf + базовое SEO | 🔄 GSC/Вебмастер OK | [`04-performance-and-seo.md`](workflow/04-performance-and-seo.md) |
| 5 | **SEO-рост, топ по ключам** | 🔄 | [`05-seo-growth-ranking.md`](workflow/05-seo-growth-ranking.md) |
| 7 | **Раздел «Услуги»** | 🔄 эталон + 10 страниц | [`07-services-section.md`](workflow/07-services-section.md) |
| **9** | **P0: индексация 4 кейсов** | 🔄 **текущий** | [`09-p0-case-reindex.md`](workflow/09-p0-case-reindex.md) |
| 6 | Реклама | ⏸ | см. этап 5 |

---

## Последние изменения (2026-06-28)

### Дизайн / UX
- Motion-слой на всех кейсах (nav, scroll-progress, FAQ kicker)
- FAQ: легче анимация, один IntersectionObserver в `initFaqMotion()`
- Contact/final-cta: мягче свет и blur
- **Портфолио на главной:** кейсы снова видны (`.motion .section { opacity: 1 }`)
- **Коллаж превью:** убрана «рамка» (фикс. высота + фон контейнера); картинка по пропорциям; на десктопе 88% ширины, по центру
- Мобилка: сетка портфолио и stats 2×2 (desktop-only правила в `@media min-width: 901px`)

### SEO / индексация
- Google verification meta в `index.html` (`3532ad2`)
- Sitemap: 7 URL, на проде HTTP 200
- GSC: sitemap + 7 страниц отправлены пользователем
- Микроразметка: `Person` (главная), `BreadcrumbList` + `CreativeWork` + `FAQPage` (кейсы)

### Git / деплой (ключевые коммиты)
- `5139f1d` — fix invisible portfolio sections
- `3532ad2` — Google Search Console verification
- `74a0edb` — portfolio collage preview sizing (без рамки)

Деплой: `git pull` на VPS `/var/www/dev2026`.

---

## 1. SEO — база (этап 4)

- Meta-теги, Open Graph, Twitter Card, canonical
- JSON-LD Person, robots.txt, sitemap.xml, webmanifest
- 6 кейсов с полной SEO-разметкой
- **Даёт:** сниппет, иконка, индексация
- **Не даёт:** топ по «разработка telegram ботов» само по себе

## 5. SEO — рост (текущий этап)

Подробно: **[`05-seo-growth-ranking.md`](workflow/05-seo-growth-ranking.md)**

- Цель 100 визитов/день vs реалистичный KPI 100–300/мес
- Пакет «800 запросов» — что это и как применить самому
- Трастовость E-E-A-T (on-page + off-page)
- Посадочные, блог, ссылки, Habr/VC
- План по месяцам (1–6)

---

## Ближайший порядок работ (услуги)

1. Довести дизайн эталона `/services/telegram-bots/` (стиль как кейс, digital glass)
2. Утвердить шаблон → правки текста под SEO-кластеры
3. Размножить на ~10 страниц (5 услуг + подразделы)
4. Деплой + обновить `sitemap.xml`
5. Переобход в Яндекс.Вебмастер + GSC

**Параллельно (общий SEO):** мониторинг индекса 7 URL, FAQPage на главной, Метрика-цели.

---

*Порядок: индексация (ждём) → посадочные + блог → траст (ссылки) → реклама параллельно с месяца 3.*
