# План ветки — раздел «Услуги» + SEO-посадочные

> Детерминированный трек: инфра → эталон → 10 страниц → деплой → индексация.  
> **Срочный подтрек P0:** [`workflow/09-p0-case-reindex.md`](workflow/09-p0-case-reindex.md) — восстановление индексации 4 кейсов.

---

## P0-подтрек (приоритет над полировкой дизайна)

| Фаза | Суть | Статус |
|------|------|--------|
| F0 | Shells + hub + 2 страницы до «минимум для деплоя» | ⏳ |
| F1 | Деплой 7 URL `/services/*` + nav `/services/` | ⏳ |
| F2 | Crawlable-ссылки: главная + услуги → кейсы | ⏳ |
| F3 | Кейсы: услуга + похожие + HTML-крошки | ⏳ |
| F4 | sitemap 14 URL | ⏳ |
| F5 | Контент bot6 (обяз.) + bot2 | ⏳ |
| F6–F8 | Деплой, чеклист, переобход Вебмастер | ⏳ |

**Не блокируем P0:** ревью дизайна эталона, 1800 слов, mini-apps, crm-bots, блог.

---

## Цель

Config-driven раздел услуг: hub, SEO-посадочные «как кейс», кластеры ключей из `вебмастер.md`.  
**1 страница = 1 SEO-кластер.**

---

## Мастер-план (зафиксирован 2026-07-02)

| # | Фаза | Статус |
|---|------|--------|
| 1 | Единый формат страниц (дизайн/стиль эталона) | 🔄 в работе |
| 2 | Корректировка SEO-текстов | ⏳ после OK дизайна |
| 3 | Блок услуг на главной (`#servicesHub`) | ✅ базово / 🔄 доработки |
| 4 | ~10 SEO-страниц по шаблону | ⏳ |
| 5 | Финальный SEO-проход + деплой | ⏳ |
| 6 | Sitemap, Вебмастер, GSC, переобход | ⏳ |

---

## Чеклист инфраструктуры (фаза 0)

- [x] `js/services-data.js` — 5 услуг, подразделы, связи с кейсами
- [x] `js/services-render.js` — hub-аккордеон на главной
- [x] `js/service-page.js` — рендер шаблона + JSON-LD
- [x] `css/services.css` — hub footer + service page
- [x] `services/index.html` — hub `/services/`
- [x] `services/_template.html` — единый HTML-шаблон
- [x] 5 routes: `services/{slug}/index.html`
- [x] Главная: `#servicesHub` после FAQ (без sticky motion-блока)
- [x] Эталон `telegram-bots` — структура 9 блоков + черновой SEO-текст
- [ ] **Ревью дизайна эталона** — ждём OK заказчика
- [ ] Финальный текст + объём 1800–2500 слов
- [ ] Остальные страницы по шаблону (~10 URL)
- [ ] sitemap + деплой + индексация

---

## Карта файлов

| Файл | Назначение |
|------|------------|
| `services/_template.html` | Копировать под новую страницу |
| `services/telegram-bots/index.html` | **Эталон** |
| `js/services-data.js` | Контент, SEO, ключи по услуге |
| `js/service-page.js` | Рендер, schema, форма |
| `js/services-render.js` | Аккордеон на главной |
| `css/services.css` | Все стили услуг |
| `js/motion-scenes.js` | Canvas Hero (только на service page) |
| `вебмастер.md` | Семантические кластеры |

---

## Структура страницы услуги (эталон, обновлено 2026-07-03)

Путь принятия решения — см. [`workflow/08-seo-cluster-architecture.md`](workflow/08-seo-cluster-architecture.md).

1. Hero (H1 + lead + CTA + canvas visual)
2. SEO-вводный блок (H2 + абзацы + подзаголовок + список)
3. **Кому подойдёт** (аудитория, задел под LEVEL-4 страницы)
4. Какие задачи решает (проблемы)
5. Какие решения разрабатываем (направления)
6. Этапы разработки (вертикальный timeline + scroll-reveal)
7. Реализованные проекты (из `caseData`)
8. FAQ (schema, в т.ч. стоимость)
9. Форма / CTA (как на главной)

**Убрано с UI:** блок «Технологический стек» (ключи — в тексте и FAQ).

**Анимации:** fade-up на списках; scroll-fill + подсветка шагов на timeline.

---

## План страниц (~10 URL)

### 5 услуг (основные)

| slug | Название | Статус |
|------|----------|--------|
| `telegram-bots` | Telegram боты и Mini Apps | эталон, дизайн на ревью |
| `ai-implementation` | Внедрение ИИ | shell |
| `ai-agents` | Создание ИИ-агентов | shell |
| `web-development` | Сайты и веб-сервисы | shell |
| `ai-assistants` | Приложения и кастомные решения | shell |

### Подразделы / кластеры (из `services-data.js` → subsections)

Добавляются как якоря или отдельные посадочные по мере наполнения.  
Пример кластера Telegram: `razrabotka-telegram-botov`, `telegram-mini-apps`, `ai-telegram-boty-dlya-biznesa`, `stoimost-razrabotki-telegram-bota`…

**LEVEL-3 (живые страницы):**
| URL | Статус |
|-----|--------|
| `/services/telegram-bots/ai-bots/` | ✅ live |
| `/services/telegram-bots/mini-apps/` | ⏳ |
| `/services/telegram-bots/crm-bots/` | ⏳ |

**Цель:** ~10 индексируемых URL с уникальной семантикой.

---

## Feedback заказчика

| Дата | Правка | Статус |
|------|--------|--------|
| 2026-06-28 | Убрать sticky motion-блок услуг на главной | ✅ |
| 2026-06-28 | Блок услуг внизу после FAQ, аккордеон | ✅ |
| 2026-07-01 | Убрать ротатор «ключевые направления» | ✅ |
| 2026-07-01 | Страница услуги = кейс-стиль, не лендинг | 🔄 дизайн в работе |
| 2026-07-01 | SEO-текст вокруг ключей из Вебмастера, не общие фразы | 🔄 черновик есть |
| 2026-07-01 | Шапка не должна ломаться (breadcrumbs) | ✅ скрыты, schema в JSON-LD |
| 2026-07-01 | FAQ и форма должны быть видимы | ✅ fix opacity/conflict |
| 2026-07-01 | Карточки digital/glass как на главной | 🔄 улучшено, ждём OK |
| 2026-07-02 | Идём по кускам: сначала стиль, потом текст | 📌 план |
| 2026-07-03 | Убрать блок «стек» с UI | ✅ |
| 2026-07-03 | Новый порядок секций + «Кому подойдёт» | ✅ |
| 2026-07-03 | Этапы: вертикально + scroll-reveal | ✅ |
| 2026-07-03 | SEO-кластерная архитектура в roadmap | ✅ `workflow/08-…` |
| 2026-07-03 | Аудитория: 8 слотов, ротатор 12 категорий | ✅ |
| 2026-07-03 | Кейсы: digital motion, FAQ как на главной | ✅ |
| 2026-07-03 | Единые отступы + акценты заголовков | ✅ |
| 2026-07-03 | LEVEL-3: `/services/telegram-bots/ai-bots/` | ✅ |
| 2026-07-03 | Аудитория: inline-ротатор без рамок | ✅ |

---

## Self-check

| Дата | Проверено | Результат |
|------|-----------|-----------|
| 2026-07-02 | `localhost:8099/services/telegram-bots/` | Hero, карточки, FAQ, форма рендерятся |
| 2026-07-02 | FAQ visibility | fix `.service-faq-item` opacity |
| 2026-07-02 | UTF-8 nav на service page | ok после пересборки HTML |

---

## Локально

```powershell
python -m http.server 8099
# http://localhost:8099/#servicesHub
# http://localhost:8099/services/telegram-bots/
```

## Связь с roadmap

- ТЗ: [`workflow/07-services-section.md`](workflow/07-services-section.md)
- SEO-рост: [`workflow/05-seo-growth-ranking.md`](workflow/05-seo-growth-ranking.md)
- **P0 индексация кейсов:** [`workflow/09-p0-case-reindex.md`](workflow/09-p0-case-reindex.md)
- **Кластерная архитектура:** [`workflow/08-seo-cluster-architecture.md`](workflow/08-seo-cluster-architecture.md)
- Саммари чата: [`chat-summary-cursor.md`](chat-summary-cursor.md)
- Следующий чат: [`next-chat-prompt.md`](next-chat-prompt.md)

*Обновлять после каждой фазы и каждой правки пользователя.*
