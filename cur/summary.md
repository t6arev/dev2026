# Саммари проекта dev2026.ru

> Обновлено: **2026-07-13**  
> Prod: **GitHub Pages** → `https://dev2026.ru` (push в `main` = деплой)  
> Трекер P0: [`p0-tracker.md`](p0-tracker.md) · Журнал: [`journal.md`](journal.md)

---

## 1. Что уже сделано (код + деплой)

### Кластер «Услуги» (P0 F0–F4)

| Что | Статус | Коммиты |
|-----|--------|---------|
| 7 страниц `/services/*` + хаб `/services/` | ✅ prod | `166db8d`, `107ea6b` |
| Hero-анимации по направлениям | ✅ | `166db8d` |
| Nav «Услуги», crawlable-ссылки на главной и услугах | ✅ | `107ea6b` |
| F3: кейсы → услуги (крошки, блок услуги, похожие, JSON-LD) | ✅ | `107ea6b` |
| `sitemap.xml` — **14 URL** | ✅ prod | `107ea6b` |
| `robots.txt` — Allow + Sitemap | ✅ prod | с `cc1f021` |
| Bing meta `msvalidate.01` в `<head>` | ✅ | `166db8d` |
| Google Search Console meta | ✅ | `3532ad2` |

### Мобильные фиксы (2026-07-13)

| Проблема | Решение | Коммит |
|----------|---------|--------|
| Шапка налезала на hero | `padding-top: calc(72px + …)` на услугах и хабе | `e5ea6d6` |
| Меню / кнопки не кликались | `float-widget` перехватывал тапы на всю ширину экрана | `69f8a3d` |
| Мобильное меню | z-index 1300, делегирование кликов, скрытие виджета при открытом меню | `69f8a3d` |
| CTA «Обсудить проект» | `pointer-events`, ранний `initServiceCta`, fallback Telegram | `69f8a3d` |
| Мелкая анимация AI-агентов | `fitScale` + выше `min-height` hero | `e5ea6d6` |
| Чипы на `/services/` налезали на список | скрыты на мобилке | `e5ea6d6` |

Cache-bust на prod: **`?v=service-page-43`**

### Что НЕ в git / не автоматизировано

- `deploy_new_vps.py` — в `.gitignore` (секреты). Prod = **только GitHub Pages**
- Индексация в поисковиках — **только руками** в вебмастерах (см. раздел 3)

---

## 2. SEO-инфраструктура (prod)

### Карта сайта (одна ссылка для всех вебмастеров)

```
https://dev2026.ru/sitemap.xml
```

**14 URL в sitemap:**
- `/` — главная
- `/services/` — хаб
- 6 L2: `telegram-bots`, `telegram-bots/ai-bots`, `ai-implementation`, `ai-assistants`, `ai-agents`, `web-development`
- 6 кейсов: `ai-bot-telegram`, `vpn-bot-telegram`, `ai-assistant-business`, `razrabotka-ii-agentov-ai-platforma`, `ii-v-prodazhi-b2b-rassylki`, `telegram-bot-dlya-treydinga`

### robots.txt

```
https://dev2026.ru/robots.txt
```

Содержимое: `Allow: /` + `Sitemap: https://dev2026.ru/sitemap.xml` → **200 OK**

### Статус обхода Яндекса (на 2026-07-12)

- Sitemap в Вебмастере: **OK, 14 ссылок** (вручную + из robots.txt)
- Обход: все URL **200 OK**, статус «URL неизвестен роботу» = **первый визит**, не ошибка
- В поиске: страницы **ещё не проиндексированы** (нужен переобход + время)

---

## 3. «Переобход» — что это и что делать конкретно

**Переобход** — это кнопка в Яндекс.Вебмастере: «пожалуйста, зайди на этот URL ещё раз и рассмотри для индекса».

Это **не правка кода**. Робот уже заходил (200 OK), но страница **ещё не в выдаче**. Переобход ускоряет попадание в индекс.

### Яндекс.Вебмастер

**Вход:** [https://webmaster.yandex.ru](https://webmaster.yandex.ru) → сайт `dev2026.ru`

| Шаг | Где в интерфейсе | Что сделать |
|-----|------------------|-------------|
| 1 | Индексирование → **Файлы Sitemap** | Уже **OK** (14 ссылок). Ничего не трогать |
| 2 | Индексирование → **Переобход страниц** | Вставить URL → **«Переобход»** |
| 3 | Индексирование → **Страницы в поиске** | Через 3–7 дней смотреть, что появилось |
| 4 | Индексирование → **Исключённые страницы** | Для 4 кейсов — причина исключения + переобход |

**Лимит:** ~1–2 URL в день (не спамить все 14 сразу).

#### План переобхода по дням

| День | URL |
|------|-----|
| 1 | `https://dev2026.ru/` |
| 2 | `https://dev2026.ru/services/` |
| 3 | `https://dev2026.ru/services/telegram-bots/` |
| 4 | `https://dev2026.ru/services/ai-agents/` |
| 5 | `https://dev2026.ru/services/ai-implementation/` |
| 6 | `https://dev2026.ru/services/ai-assistants/` |
| 7 | `https://dev2026.ru/services/web-development/` |
| 8 | `https://dev2026.ru/services/telegram-bots/ai-bots/` |
| 9 | `https://dev2026.ru/cases/ai-bot-telegram/` |
| 10 | `https://dev2026.ru/cases/telegram-bot-dlya-treydinga/` |
| 11 | `https://dev2026.ru/cases/ai-assistant-business/` |
| 12 | `https://dev2026.ru/cases/razrabotka-ii-agentov-ai-platforma/` |

После дня 12 — повторить главную и `/services/` если в «Страницы в поиске» пусто.

---

### Google Search Console (ещё не добавлял sitemap)

**Вход:** [https://search.google.com/search-console](https://search.google.com/search-console)

| Шаг | Действие |
|-----|----------|
| 1 | Выбрать ресурс `dev2026.ru` |
| 2 | Слева: **Файлы Sitemap** (Sitemaps) |
| 3 | В поле ввести: `sitemap.xml` → **Отправить** |
| 4 | (Опционально) **Проверка URL** → вставить URL → **Запросить индексирование** (~10/день) |

---

### Bing Webmaster Tools

**Вход:** [https://www.bing.com/webmasters](https://www.bing.com/webmasters)

| Шаг | Действие |
|-----|----------|
| 1 | Сайт `dev2026.ru` (верификация через meta `msvalidate.01` — уже в `index.html`) |
| 2 | **Sitemaps** → Submit: `https://dev2026.ru/sitemap.xml` |
| 3 | (Опционально) **URL Submission** — те же ключевые URL (~10/день) |

---

## 4. Что НЕ нужно делать

- ❌ Ждать пассивно — без sitemap в Google/Bing и без переобхода в Яндексе индексация затянется на месяцы
- ❌ Править `robots.txt` — он уже ок
- ❌ Деплоить VPS-скриптом — prod = GitHub Pages
- ❌ Спамить 14 переобходов в один день — лимиты вебмастеров

---

## 5. Оставшийся бэклог

| ID | Задача | Кто |
|----|--------|-----|
| F5 | Контент/ассеты bot6, bot2 (скрины кейсов) | заказчик + агент |
| F8 | Переобход + sitemap Google/Bing | **заказчик, руками** |
| F1b | Верификация Bing (если ещё не нажата Verify) | заказчик |
| UX | Идеи из чата 2026-07-13 (виджет, CTA, блок услуг выше на главной) | по запросу |

---

## 6. Полезные ссылки

| Ресурс | URL |
|--------|-----|
| Сайт | https://dev2026.ru |
| Sitemap | https://dev2026.ru/sitemap.xml |
| robots.txt | https://dev2026.ru/robots.txt |
| Яндекс.Вебмастер | https://webmaster.yandex.ru |
| Google Search Console | https://search.google.com/search-console |
| Bing Webmaster | https://www.bing.com/webmasters |
| P0 workflow | [`roadmap/workflow/09-p0-case-reindex.md`](../roadmap/workflow/09-p0-case-reindex.md) |
| SEO-аудит кейсов | [`seo-audit-yandex-exclusion-dev2026-cases-2026-07-08.md`](../seo-audit-yandex-exclusion-dev2026-cases-2026-07-08.md) |

---

## 7. Хронология коммитов (prod)

```
69f8a3d  2026-07-13  Mobile: float-widget блокировал тапы, меню, формы
e5ea6d6  2026-07-13  Mobile: hero padding, анимации, CTA
107ea6b  2026-07-10  P0 F3-F4: кейсы↔услуги, sitemap 14 URL, UX hub
166db8d  2026-07-10  P0 F0-F2: 7 услуг, crawlable, hero, деплой
```
