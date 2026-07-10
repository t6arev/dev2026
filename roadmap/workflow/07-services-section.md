# Этап 7: Раздел «Услуги» + SEO-посадочные (config-driven)

> **План ветки:** [`../services-branch-plan.md`](../services-branch-plan.md)  
> **Связь с SEO-ростом:** [`05-seo-growth-ranking.md`](05-seo-growth-ranking.md)  
> **P0 (срочно):** [`09-p0-case-reindex.md`](09-p0-case-reindex.md) — деплой кластера + crawlable-перелинковка  
> **Саммари чата:** [`../chat-summary-cursor.md`](../chat-summary-cursor.md)

---

## Общая цель

Config-driven раздел услуг: hub `/services/`, SEO-посадочные «как кейс», ~10 URL под кластеры из `вебмастер.md`.  
**Страница ≠ лендинг** — технологичная SEO-документация в стиле dev2026.ru.

---

## Мастер-план (2026-07-02)

```
1. Дизайн    единый формат страниц (эталон telegram-bots)     ← СЕЙЧАС
2. Текст     SEO-кластеры, H1/H2/FAQ, 1800–2500 слов
3. Главная   блок #servicesHub — доработки по необходимости
4. Масштаб   ~10 страниц по шаблону
5. SEO       schema, перелинковка, ревью → деплой
6. Индекс    sitemap, Вебмастер, GSC, переобход
```

---

## Декомпозиция ТЗ

### ТЗ №1 — Hub «Услуги» (главная)

| ID | Задача | Статус |
|----|--------|--------|
| 1.1 | Блок `#servicesHub` после FAQ (аккордеон) | ✅ |
| 1.2 | Роут `/services/` | ✅ |
| 1.3 | 5 направлений из `services-data.js` | ✅ |
| 1.4 | Подразделы — ссылки SEO; badge кейса если `caseId` | ✅ |
| 1.5 | Nav: «Услуги» последним | ✅ |
| 1.6 | Sticky motion-блок `#services` | ❌ убран по feedback |

### ТЗ №2 — Маршруты услуг

| URL | slug | Статус |
|-----|------|--------|
| `/services/telegram-bots/` | `telegram-bots` | **эталон** (дизайн на ревью) |
| `/services/ai-implementation/` | `ai-implementation` | shell |
| `/services/ai-assistants/` | `ai-assistants` | shell |
| `/services/ai-agents/` | `ai-agents` | shell |
| `/services/web-development/` | `web-development` | shell |

### ТЗ №3 — Универсальный шаблон

| Секция | Статус |
|--------|--------|
| Hero + canvas visual | 🔄 |
| SEO-вводный текст | 🔄 черновик |
| Карточки направлений | 🔄 |
| Список решений + кейсы | 🔄 |
| Timeline процесса | ✅ |
| Tech grid | ✅ |
| «Почему заказать» | 🔄 |
| Реализованные проекты | ✅ |
| FAQ + форма | ✅ (fix visibility) |
| JSON-LD Service + FAQPage + BreadcrumbList | ✅ |

| ID | Задача | Статус |
|----|--------|--------|
| 3.1 | `services-data.js` | ✅ |
| 3.2 | `service-page.js` | ✅ |
| 3.3 | `css/services.css` | 🔄 дизайн |
| 3.4 | `services/_template.html` | ✅ |
| 3.5 | sitemap.xml | ⏳ после деплоя |

---

## SEO-принцип (зафиксировано)

- Каждая страница = **свой кластер ключей** из `вебмастер.md`.
- Ключи в первом абзаце, H2, карточках, FAQ — естественно, не «красивый общий текст».
- Пример кластера Telegram: разработка бота, чат-боты, telegram под ключ, чат бот заказать…
- FAQ — хвосты: стоимость, сроки, CRM, Mini App vs чат-бот.

---

## Анимации

| Где | Что |
|-----|-----|
| Hero service page | Canvas/WebGL (telegram — `motion-scenes.js`) |
| Карточки, chips | glow, scan-line, лёгкий tilt |
| Секции | fade-up при появлении |
| **Не использовать** | bounce, резкий scale, вращение блоков |

Главная: **без** сложного motion на карточках услуг.

---

## Локальная работа

```powershell
python -m http.server 8099
# http://localhost:8099/#servicesHub
# http://localhost:8099/services/
# http://localhost:8099/services/telegram-bots/
```

*Последнее обновление: 2026-07-02*
