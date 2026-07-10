# P0: Восстановление индексации 4 кейсов в Яндексе

> **Ветка:** `p0-yandex-cases-reindex`  
> **Цель:** вернуть в индекс 4 исключённых кейса через кластер услуг + crawlable-перелинковку + контентные правки.  
> **Аудит:** [`seo-audit-yandex-exclusion-dev2026-cases-2026-07-08.md`](../../seo-audit-yandex-exclusion-dev2026-cases-2026-07-08.md)  
> **Кластерная архитектура:** [`08-seo-cluster-architecture.md`](08-seo-cluster-architecture.md)  
> **Трек услуг:** [`07-services-section.md`](07-services-section.md) · [`../services-branch-plan.md`](../services-branch-plan.md)

---

## Целевые URL (исключены из Яндекса)

| ID | URL | caseId |
|----|-----|--------|
| C1 | `/cases/ai-assistant-business/` | bot6 |
| C2 | `/cases/ai-bot-telegram/` | bot2 |
| C3 | `/cases/razrabotka-ii-agentov-ai-platforma/` | site4 |
| C4 | `/cases/telegram-bot-dlya-treydinga/` | bot7 |

---

## Текущее состояние (на 2026-07-09)

| Компонент | Статус | Блокер для P0? |
|-----------|--------|----------------|
| `/services/telegram-bots/` | эталон, дизайн на ревью | нет — можно деплоить |
| `/services/telegram-bots/ai-bots/` | live локально | нет |
| 4 услуги (ai-implementation, ai-assistants, ai-agents, web-development) | **shell** без полного контента | **да** — нужен минимум для 200 + перелинковки |
| `/services/` hub | shell + JS-рендер карточек | частично |
| `#servicesHub` на главной | базово ок, ссылки JS | **да** — nav на `#servicesHub`, не `/services/` |
| mini-apps, crm-bots (LEVEL-3) | **не созданы** | нет — **вне P0** |
| Портфолио `#portfolioGrid` | только JS | **да** |
| `#serviceCasesBody` на услугах | только JS | **да** |
| Кейсы → услуги / похожие / крошки | отсутствуют | **да** |
| `sitemap.xml` | 7 URL, без услуг | **да** |
| Деплой услуг на prod | **не было** | **да** |

**Принцип P0:** не ждать идеального дизайна и 1800 слов на каждой услуге. Деплоим **минимально жизнеспособный кластер** с crawlable-ссылками; полировка текста — P1.

---

## Граф зависимостей фаз

```
Ф0 Подготовка (shells + hub)
    ↓
Ф1 Деплой услуг + nav
    ↓
Ф2 Crawlable-ссылки (главная + услуги)  ─┐
    ↓                                      ├→ Ф4 Sitemap → Ф6 Деплой
Ф3 Кейсы (услуга + похожие + крошки)  ───┘
    ↓
Ф5 Контент bot6 + bot2 (можно параллельно с Ф2–Ф3)
    ↓
Ф7 Post-deploy чеклист
    ↓
Ф8 Ручной переобход (заказчик)
```

---

## Ф0 — Подготовка: довести неготовое до «минимум для деплоя»

> Закрывает: 2 незавершённые страницы + блок услуг на главной.

### F0-A · Shell-страницы (4 услуги)

| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| F0-A1 | Проверить, что HTML-файлы существуют и `data-service-id` корректен | `services/*/index.html` | ⬜ |
| F0-A2 | Добавить в `services-data.js` минимум: `seo.title`, `seo.description`, `hero`, `description.body` (1–2 абзаца) | `js/services-data.js` | ⬜ |
| F0-A3 | Заполнить `relatedCaseIds` по маппингу P0 (см. Ф2-B) | `js/services-data.js` | ⬜ |
| F0-A4 | Добавить 3–5 FAQ на shell-страницы (для schema + смысла) | `js/services-data.js` | ⬜ |
| F0-A5 | Локально: все 4 shell открываются без JS-ошибок, форма и FAQ видны | browser | ⬜ |

**Маппинг `relatedCaseIds` (зафиксировать):**

| Услуга | caseIds |
|--------|---------|
| `telegram-bots` | bot2, bot7 (+ bot4 опционально) |
| `telegram-bots-ai-bots` | bot2, bot7 |
| `ai-assistants` | bot6 |
| `ai-implementation` | bot6 (+ site2 опционально) |
| `ai-agents` | site4 |

### F0-B · Эталон и ai-bots (2 страницы «не до конца»)

| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| F0-B1 | `telegram-bots`: smoke-test всех 9 секций, FAQ, форма, canvas | `services/telegram-bots/` | ⬜ |
| F0-B2 | `ai-bots`: проверить audience-ротатор, hero-анимацию, relatedCaseIds | `services/telegram-bots/ai-bots/` | ⬜ |
| F0-B3 | Зафиксировать: дизайн «достаточно для P0» (не блокируем деплой на ревью) | — | ⬜ |

### F0-C · Hub `/services/` + блок на главной

| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| F0-C1 | `/services/`: статические `<a href>` на 5 L2-услуг в HTML (не только JS) | `services/index.html` | ⬜ |
| F0-C2 | `#servicesHub`: добавить fallback-ссылки на `/services/` и L2 в `<noscript>` или статический блок | `index.html` | ⬜ |
| F0-C3 | Аккордеон: CTA «Открыть направление» ведёт на `service.route` — проверить все 5 | `js/services-render.js` | ⬜ |

---

## Ф1 — Деплой услуг + навигация

| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| F1-1 | Убедиться, что все 7 URL отдают 200 локально | `services/**` | ⬜ |
| F1-2 | Nav desktop: `Услуги` → `/services/` (было `#servicesHub`) | `index.html` | ⬜ |
| F1-3 | Nav mobile: `Услуги` → `/services/` | `index.html` | ⬜ |
| F1-4 | На страницах услуг nav «Услуги» → `/services/` (уже `/services/` — проверить) | `services/**/index.html` | ⬜ |
| F1-5 | На страницах кейсов: nav «Услуги» → `/services/` (сейчас якоря на главную) | `cases/**/index.html` | ⬜ |
| F1-6 | Деплой на prod (`git pull` VPS) — **только по явной просьбе** | deploy | ⬜ |
| F1-7 | Bing Webmaster: meta `msvalidate.01` в `<head>` главной | `index.html` | ✅ |
| F1-8 | После деплоя: Verify в [Bing Webmaster](https://www.bing.com/webmasters?siteUrl=https://dev2026.ru/) | ручной | ⬜ |

**URL для деплоя (7 шт.):**

```
/services/
/services/telegram-bots/
/services/telegram-bots/ai-bots/
/services/ai-implementation/
/services/ai-assistants/
/services/ai-agents/
/services/web-development/
```

---

## Ф2 — Crawlable-ссылки: главная + услуги

> Критично для внутреннего PageRank. JS-рендер оставляем, но дублируем в HTML.

### F2-A · Главная → кейсы

| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| F2-A1 | Добавить блок `portfolio-crawlable` (скрытый визуально или `<noscript>`) со ссылками на **все 6 кейсов** | `index.html` | ⬜ |
| F2-A2 | Минимум 4 целевых URL обязательны: C1–C4 (см. таблицу выше) | `index.html` | ⬜ |
| F2-A3 | View Source: ссылки видны без выполнения JS | browser | ⬜ |

**Целевые ссылки на главной:**

```html
/cases/ai-assistant-business/
/cases/ai-bot-telegram/
/cases/razrabotka-ii-agentov-ai-platforma/
/cases/telegram-bot-dlya-treydinga/
```

### F2-B · Услуги → кейсы (статический HTML)

| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| F2-B1 | В `#serviceCasesBody` положить статические `<a href>` **до** JS-рендера (или `<noscript>` внутри секции) | `services/_template.html` + копии | ⬜ |
| F2-B2 | `telegram-bots`: bot2, bot7 | `services/telegram-bots/index.html` | ⬜ |
| F2-B3 | `ai-bots`: bot2, bot7 | `services/telegram-bots/ai-bots/index.html` | ⬜ |
| F2-B4 | `ai-assistants`: bot6 | `services/ai-assistants/index.html` | ⬜ |
| F2-B5 | `ai-implementation`: bot6 | `services/ai-implementation/index.html` | ⬜ |
| F2-B6 | `ai-agents`: site4 | `services/ai-agents/index.html` | ⬜ |
| F2-B7 | View Source каждой услуги: ссылки на кейсы в HTML | browser | ⬜ |

**Опционально (улучшение):** вынести статический fallback в `js/service-page.js` → `renderCases()` не затирает, если уже есть children.

---

## Ф3 — Кейсы: обратная перелинковка + крошки

### F3-A · Блок «Связанная услуга»

| ID | Задача | Кейс | URL услуги | Статус |
|----|--------|------|------------|--------|
| F3-A1 | Добавить секцию `.case-related-service` (статический HTML) | ai-bot-telegram | `/services/telegram-bots/ai-bots/` | ⬜ |
| F3-A2 | | telegram-bot-dlya-treydinga | `/services/telegram-bots/` | ⬜ |
| F3-A3 | | ai-assistant-business | `/services/ai-assistants/` | ⬜ |
| F3-A4 | | razrabotka-ii-agentov-ai-platforma | `/services/ai-agents/` | ⬜ |
| F3-A5 | Единый CSS для блока | `css/main.css` или `css/cases.css` | ⬜ |
| F3-A6 | Разместить **перед** `#contact` или после `#result` | все 4 кейса | ⬜ |

### F3-B · Блок «Похожие проекты»

| ID | Задача | Кейс | Ссылки (мин. 1–2) | Статус |
|----|--------|------|-------------------|--------|
| F3-B1 | | ai-bot-telegram | telegram-bot-dlya-treydinga, vpn-bot-telegram | ⬜ |
| F3-B2 | | telegram-bot-dlya-treydinga | ai-bot-telegram, vpn-bot-telegram | ⬜ |
| F3-B3 | | ai-assistant-business | ii-v-prodazhi-b2b-rassylki | ⬜ |
| F3-B4 | | razrabotka-ii-agentov-ai-platforma | ai-assistant-business | ⬜ |
| F3-B5 | Секция `.case-related-cases` — статический HTML | все 4 | ⬜ |

### F3-C · Видимые HTML-хлебные крошки

| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| F3-C1 | Добавить `<nav class="case-breadcrumbs">` под header | 4 кейса | ⬜ |
| F3-C2 | Формат: `Главная → Услуги → {Услуга} → {Кейс}` | | ⬜ |
| F3-C3 | Синхронизировать с JSON-LD `BreadcrumbList` (те же URL) | `cases/*/index.html` | ⬜ |
| F3-C4 | Стили: компактно, не ломает hero | `css/main.css` | ⬜ |

**Крошки по кейсам:**

| Кейс | Цепочка |
|------|---------|
| ai-bot-telegram | `/` → `/services/` → `/services/telegram-bots/ai-bots/` → кейс |
| telegram-bot-dlya-treydinga | `/` → `/services/` → `/services/telegram-bots/` → кейс |
| ai-assistant-business | `/` → `/services/` → `/services/ai-assistants/` → кейс |
| razrabotka-ii-agentov | `/` → `/services/` → `/services/ai-agents/` → кейс |

### F3-D · Обновить JSON-LD breadcrumbs

| ID | Задача | Статус |
|----|--------|--------|
| F3-D1 | Заменить `https://dev2026.ru/#portfolio` на `/services/` + родительскую услугу | ⬜ |
| F3-D2 | Проверить валидатором schema.org / Яндекс | ⬜ |

---

## Ф4 — Sitemap

| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| F4-1 | Добавить 7 URL `/services/*` | `sitemap.xml` | ⬜ |
| F4-2 | Для 4 обновлённых кейсов: `<lastmod>YYYY-MM-DD</lastmod>` = дата деплоя | `sitemap.xml` | ⬜ |
| F4-3 | Для новых услуг: `priority` 0.9 (hub), 0.85 (L2), 0.8 (L3) | `sitemap.xml` | ⬜ |
| F4-4 | `robots.txt` уже указывает sitemap — проверить на проде | `robots.txt` | ⬜ |

**Итого в sitemap после P0:** 7 (было) + 7 (услуги) = **14 URL**.

---

## Ф5 — Контентные правки исключённых кейсов

### F5-A · bot6 — `/cases/ai-assistant-business/` (обязательно)

| ID | Задача | Статус |
|----|--------|--------|
| F5-A1 | Заменить hero `кейс рассылка.png` на релевантный скрин AI-ассистента | ⬜ |
| F5-A2 | Обновить `og:image` под новый hero | ⬜ |
| F5-A3 | Блок «Результат»: 2–3 **конкретных** KPI (время поиска, снижение обращений, охват ролей) | ⬜ |
| F5-A4 | Добавить артефакты: роли (Эксперт/Маркетолог), схема базы знаний, список модулей | ⬜ |
| F5-A5 | Скрин интерфейса в коллаж (если есть ассет) | ⬜ |
| F5-A6 | Обновить `cases-data.js` если тексты дублируются | `js/cases-data.js` | ⬜ |

### F5-B · bot2 — `/cases/ai-bot-telegram/` (средний приоритет)

| ID | Задача | Статус |
|----|--------|--------|
| F5-B1 | Заменить `кейсы.png` в hero-коллаже на уникальный скрин бота | ⬜ |
| F5-B2 | Обновить `og:image` | ⬜ |
| F5-B3 | Блок «Результат»: 1–2 конкретных KPI (подписчики, время ответа, конверсия в оплату) | ⬜ |

### F5-C · bot7 + site4 (лёгкие правки, опционально в P0)

| ID | Задача | Статус |
|----|--------|--------|
| F5-C1 | bot7: 1 KPI в «Результат» (латентность сигнала, uptime) | ⬜ |
| F5-C2 | site4: 1 KPI + схема архитектуры (уже есть стек в тексте) | ⬜ |

---

## Ф6 — Деплой P0-пакета

| ID | Задача | Статус |
|----|--------|--------|
| F6-1 | Локальный self-check всех фаз F0–F5 | ⬜ |
| F6-2 | Commit (по просьбе заказчика) | ⬜ |
| F6-3 | `git pull` на VPS `/var/www/dev2026` | ⬜ |
| F6-4 | Bump cache `?v=` на изменённых JS/CSS если нужно | ⬜ |

---

## Ф7 — Post-deploy чеклист (технический)

| # | Проверка | Как | Статус |
|---|----------|-----|--------|
| 1 | Все 7 `/services/*` → HTTP 200 | curl / browser | ⬜ |
| 2 | 4 кейса → HTTP 200 | curl | ⬜ |
| 3 | `/sitemap.xml` → 200, 14 URL | browser | ⬜ |
| 4 | Нет 404 по `/services/*` | crawl / ручная проверка | ⬜ |
| 5 | View Source главной: ссылки на 4 кейса в HTML | browser | ⬜ |
| 6 | View Source услуг: ссылки на кейсы в HTML | browser | ⬜ |
| 7 | View Source кейсов: блок услуги + крошки + похожие | browser | ⬜ |
| 8 | `canonical` корректен на всех страницах | view-source | ⬜ |
| 9 | Нет `<meta name="robots" content="noindex">` | grep | ⬜ |
| 10 | JSON-LD валиден (крошки обновлены) | validator | ⬜ |

---

## Ф8 — Ручные действия в Яндекс.Вебмастер (заказчик)

> Выполняется **после** успешного Ф7.

| # | Действие | URL |
|---|----------|-----|
| 1 | Переобход sitemap | `https://dev2026.ru/sitemap.xml` |
| 2 | Переобход кейса | `/cases/ai-assistant-business/` |
| 3 | Переобход кейса | `/cases/ai-bot-telegram/` |
| 4 | Переобход кейса | `/cases/razrabotka-ii-agentov-ai-platforma/` |
| 5 | Переобход кейса | `/cases/telegram-bot-dlya-treydinga/` |
| 6 | Переобход услуг | все 7 `/services/*` |
| 7 | Через 7–14 дней: статус индексации 4 кейсов | Вебмастер → Индексирование |

---

## Что сознательно вне P0 (→ P1/P2)

| Задача | Документ |
|--------|----------|
| LEVEL-3: mini-apps, crm-bots | `08-seo-cluster-architecture.md` |
| Блог `/blog/` | `05-seo-growth-ranking.md` |
| SEO-тексты 1800–2500 слов на всех услугах | `07-services-section.md` |
| Полный prerender / SSR | `04-performance-and-seo.md` |
| FAQPage JSON-LD на главной | `04-performance-and-seo.md` |
| Organization / WebSite schema | `05-seo-growth-ranking.md` |
| Хаб `/cases/` | backlog |

---

## Порядок работы в чатах (рекомендуемый)

| Чат | Фазы | Ожидаемый результат |
|-----|------|---------------------|
| 1 | F0 + F1 | 7 услуг готовы к деплою, nav исправлен |
| 2 | F2 + F3 | crawlable-граф ссылок замкнут |
| 3 | F4 + F5 | sitemap + контент bot6/bot2 |
| 4 | F6 + F7 + F8 | prod + чеклист + переобход |

---

## Локальная проверка

```powershell
cd "C:\Users\t6are\OneDrive\Рабочий стол\моя визитка"
python -m http.server 8099
```

| URL | Что проверить |
|-----|---------------|
| http://localhost:8099/ | nav → `/services/`, crawlable кейсы в source |
| http://localhost:8099/services/ | hub, ссылки на L2 |
| http://localhost:8099/services/telegram-bots/ | статические кейсы в source |
| http://localhost:8099/cases/ai-assistant-business/ | крошки, услуга, похожие |

---

*Обновлять статусы задач после каждого чата. Фиксировать дату деплоя для `lastmod` в sitemap.*
