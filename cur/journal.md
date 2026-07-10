# Журнал работ (cur)

Лог действий по проекту dev2026.ru.

---

## 2026-06-18

### Наведение порядка

- Создана папка `roadmap/` — цели сайта (SEO, digital-дизайн, формы, реклама)
- Создана папка `cur/` — этот журнал событий

### Рефакторинг (старт)

- Вынесены стили из `index.html` → `css/main.css`
- Вынесен JavaScript → `js/` (config, telegram, cases-data, analytics, main)
- Изображения перенесены в `assets/img/`
- `index.html` сокращён с ~2100 до ~330 строк
- Общая функция `sendToTelegram()` для обеих форм
- Цель Метрики `lead_submit` теперь срабатывает на квиз и «заказать звонок»
- Добавлена обработка ошибок отправки с fallback на Telegram

---

## 2026-06-28 — Раздел «Услуги» (infra)

- Ветка `feat/services-infrastructure`
- ТЗ №1–3 декомпозировано → `roadmap/workflow/07-services-section.md`
- Трек ветки → `roadmap/services-branch-plan.md`
- `js/services-data.js` — 5 услуг, подразделы, связи с кейсами
- `js/services-render.js` — аккордеон hub + секция на главной
- `js/service-page.js` — универсальный шаблон (empty state)
- `css/services.css`, `services/index.html`, 5 routes, `services/_template.html`
- Секция `#services` на главной между Hero и Кейсами
- **Не деплоилось** — только локально


## 2026-06-18 (вечер) — Профессиональный редизайн и ремонт форм

### Backend
- Создан `server/` — Express API `POST /api/leads`
- Токен Telegram убран из клиента, только в `server/.env`
- Honeypot + rate limit (20 req / 15 min)

### Формы
- Выбор канала связи: Telegram / Телефон / Почта
- Динамические поля и валидация на клиенте и сервере
- Единый `js/leads.js` для quiz и callback-widget
- Удалён `js/telegram.js`

### UI/UX
- Типографика: Jost (заголовки) + Inter (UI)
- Модалка формы — корпоративная композиция
- Кейсы: hover zoom без разъезжания (aspect-ratio + overflow)
- «Что делаю» — статичное облако вместо бегущей строки
- OG meta-теги, lazy-loading изображений кейсов
- Облегчён blur фона на мобильных

### Кейсы (полный редизайн)
- Карусель заменена на сетку карточек с фильтрами: Все / Боты / Mini Apps / Сайты
- Hover zoom на изображениях карточек

### Фон и разделители
- Ярче blobs + 4-й blob, digital-сетка
- Анимированные линии между секциями

### Облако услуг
- Все теги одинакового размера

### Блок «Обо мне»
- После «Стоимость», ссылка в навигации
- Статика отдаётся: `GET /` → 200, `GET /css/main.css` → 200
- Валидация API: пустая форма → 400
- Telegram: в sandbox ETIMEDOUT к api.telegram.org — на VPS с доступом к Telegram должно работать
- Проверить `TELEGRAM_CHAT_ID`: бот должен быть запущен, пользователь написал боту /start

---

## 2026-06-19

### SEO-рост в roadmap
- Добавлен подробный этап 5: `roadmap/workflow/05-seo-growth-ranking.md`
- Обновлён `roadmap/README.md` — текущий фокус: главная, затем этап 5
- Этап 4 (`04-performance-and-seo.md`) — отмечено что базовое SEO уже на сайте
- План: посадочные, блог, вебмастера, ссылки, KPI, помесячный график

---

## 2026-06-28 — Раздел «Услуги» (infra)

- Ветка `feat/services-infrastructure`
- ТЗ №1–3 → `roadmap/workflow/07-services-section.md`, трек → `roadmap/services-branch-plan.md`
- Конфиг + рендер + hub + 5 shells; контент не наполняли
- Секция `#services` на главной; маршруты `/services/*`
- Локально только, без деплоя

---

## 2026-07-02 — Услуги: эталон страницы + SEO-блок на главной

### Главная
- Убран sticky `#services` с Canvas/WebGL (отказ от motion на карточках)
- Добавлен `#servicesHub` после FAQ — аккордеон 5 направлений
- Nav: «Услуги» последним; убран `seo-keywords-footer`
- Убран ротатор «ключевые направления» (баг с текстом)

### Шаблон страницы услуги
- `services/_template.html` — единый HTML
- `js/service-page.js` — 9 блоков, JSON-LD, форма
- `css/services.css` — hero, glass-карточки, timeline, FAQ, форма
- Эталон: `services/telegram-bots/` — первая полная страница

### SEO-контент telegram-bots
- Текст переписан под кластер из `вебмастер.md` (не общие фразы)
- FAQ под хвосты: стоимость, под ключ, Mini App, CRM, сроки

### Фиксы после ревью
- Breadcrumbs ломали шапку → скрыты, schema в JSON-LD
- UTF-8 в `telegram-bots/index.html`
- FAQ opacity:0 от motion → override для service-page
- Форма: scoped final-cta
- Cache-bust на CSS/JS

### План дальше (зафиксирован в roadmap)
1. Дизайн эталона → 2. Текст → 3. Главная доработки → 4. ~10 страниц → 5. SEO+деплой → 6. Индексация

### Документация
- `roadmap/chat-summary-cursor.md` — саммари чата
- `roadmap/next-chat-prompt.md` — промпт для следующего чата
- `roadmap/services-branch-plan.md` — обновлён мастер-план

**Деплой не делали. Коммит не делали.**

---

## 2026-07-10 — P0: Фаза F0 (подготовка к деплою)

**Workflow:** `roadmap/workflow/09-p0-case-reindex.md`  
**Трекер:** `cur/p0-tracker.md`

### Сделано
- `js/services-data.js` — hero, description, steps, FAQ (×4) для shells
- 4 shell HTML пересобраны из эталона `telegram-bots` (fix UTF-8)
- `services/index.html` — статические crawlable-ссылки на 5 L2
- `index.html` — ссылка «Все услуги» + `<noscript>` fallback в `#servicesHub`

### Ждём от заказчика
- Локальная проверка 7 URL услуг + блок на главной (см. `cur/p0-tracker.md`)
- OK → переходим к F1 (nav) и F2 (crawlable кейсы)

---

## 2026-07-10 (день) — F0 ревью: hub-ссылки + hero-анимации

### Запрос заказчика
1. На `/services/` первая ссылка в шапке выглядела иначе (подчёркивание vs glow на последней)
2. `/services/ai-assistants/` — та же анимация что у AI-ассистента; нужен цикл кастомной разработки
3. Аналогичные тематические анимации для `ai-agents` и `web-development`

### Сделано
- `css/services.css` — единый chip-стиль для `.services-hub-static`
- `js/motion-scenes.js` — сцены `custom`, `agents`, `web` с фазовым циклом
- `js/services-data.js` — `ai-assistants` → `sceneId: 'custom'`
- Cache bump `motion-scenes.js?v=service-page-28`

---

## 2026-07-10 (вечер) — F0 sign-off + F1/F2 + commit/deploy

**Workflow:** `roadmap/workflow/09-p0-case-reindex.md`  
**Трекер:** `cur/p0-tracker.md`

### Заказчик
- F0: «в целом всё ок» по страницам услуг
- Запрос: коммит + деплой + фиксация в `cur/`

### F1 Nav
- Главная: «Услуги» → `/services/` (desktop + mobile)
- `js/service-page.js`: nav на L2 → `/services/`
- 6 кейсов: пункт «Услуги» → `/services/`

### F2 Crawlable
- Главная `#portfolio`: `.portfolio-crawlable` — 6 ссылок на кейсы в HTML
- Услуги: `.service-cases-crawlable` в source (не затирается JS)
- Bing: `msvalidate.01` в `<head>` главной

### UX/анимации (в пакете)
- Hero-сцены: ai-assistants (шестерёнки), ai-agents (чат), web-dev (UI), ai-implementation (mecha)
- ai-bots: fix `data-service-id`, UTF-8 пересборка shell HTML из `_template.html`
- Акценты услуг, крошки, превью кейсов, mobile menu на service pages

### Деплой
- **GitHub Pages** (`CNAME` dev2026.ru) — push в `main` = prod
- Commit `166db8d`, merge `feat/services-infrastructure` → `main`, push 2026-07-10
- Prod: 7/7 `/services/*` → HTTP 200
- `deploy_new_vps.py` в `.gitignore` (секреты SSH + bot token)

### F8 — переобход Вебмастер (ручной)

---

## 2026-07-10 (финал P0) — UX + F3 + F4 + деплой

### UX услуг (до F3)
- Nav «Услуги» → `/#servicesHub` (остаёшься на главной)
- Аккордеон hub: 1 клик = 1 страница услуги, без keyword-чипов
- Убран блок keyword-«решений» на L2; hash сбрасывается → hero сверху
- Легче грузятся service pages (без particles/WebGL)

### F3 — обратные ссылки с кейсов (зачем: замкнуть граф для Яндекса)
- 4 целевых кейса: крошки `Главная → Услуги → {услуга} → кейс`
- Блок «Услуга по направлению» + «Похожие проекты» (статический HTML)
- JSON-LD BreadcrumbList синхронизирован с видимыми крошками
- Скрипт: `scripts/patch_cases_f3.py`

### F4
- `sitemap.xml`: 14 URL (7 услуг + 7 страниц)

### Деплой
- Commit + push в `main` → GitHub Pages

