# P0-трекер: восстановление индексации кейсов

> Workflow: [`roadmap/workflow/09-p0-case-reindex.md`](../roadmap/workflow/09-p0-case-reindex.md)  
> Журнал: [`journal.md`](journal.md)

---

## Прогресс по фазам

| Фаза | Название | Статус | Дата |
|------|----------|--------|------|
| F0 | Подготовка (shells + hub) | ✅ OK заказчика | 2026-07-10 |
| F1 | Nav → `/services/` | ✅ | 2026-07-10 |
| F2 | Crawlable-ссылки (главная + услуги) | ✅ | 2026-07-10 |
| F6 | Деплой на prod (GitHub Pages) | 🔄 commit+push | 2026-07-10 |
| F1b | Bing Webmaster верификация | ⬜ после F7 | |
| F3 | Кейсы: услуга + похожие + крошки | ⬜ **следующий** | |
| F4 | Sitemap (7 услуг + кейсы) | ⬜ | |
| F5 | Контент bot6 + bot2 | ⬜ | |
| F7 | Post-deploy чеклист | ⬜ после F6 | |
| F8 | Переобход Вебмастер (ручной) | ⬜ после F7 | |

---

## F0 — что сделано (2026-07-10)

### F0-A Shell-страницы
- [x] F0-A1 HTML существуют, `data-service-id` корректен
- [x] F0-A2 Минимальный контент в `services-data.js`: hero.lead, description, steps
- [x] F0-A3 `relatedCaseIds` по маппингу P0 (уже были)
- [x] F0-A4 FAQ 4 вопроса на каждой shell-услуге
- [x] F0-A5 Заказчик: «в целом всё ок» (2026-07-10)

### F0-B Эталон + ai-bots
- [ ] F0-B1 smoke-test telegram-bots — **нужна проверка заказчика**
- [ ] F0-B2 smoke-test ai-bots — **нужна проверка заказчика**
- [x] F0-B3 Решение: дизайн не блокирует P0-деплой

### F0-C Hub + главная
- [x] F0-C1 `/services/` — статические ссылки на 5 L2 в HTML
- [x] F0-C2 `#servicesHub` — ссылка «Все услуги» + `<noscript>` fallback
- [x] F0-C3 CTA аккордеона ведёт на `service.route` (проверено в коде)

### Изменённые файлы
- `js/services-data.js` — контент 4 shells
- `services/ai-implementation/index.html` — синхрон с эталоном
- `services/ai-assistants/index.html` — синхрон + fix UTF-8
- `services/ai-agents/index.html` — синхрон
- `services/web-development/index.html` — синхрон
- `services/index.html` — crawlable-ссылки
- `index.html` — noscript fallback + cache bump
- `css/services.css` — hero visual min-height, hub-static, mobile

### Hero-анимации (2026-07-10 вечер)
- [x] ai-assistants — монохромные шестерёнки, auto-fit, без текста
- [x] ai-agents — чат-панель (поиск → индекс → ответ)
- [x] web-development — сборка UI-макета
- [ ] **Финальный чеклист ниже** — пройти перед OK F0

---

## Финальный чеклист — все страницы услуг

> Ctrl+Shift+R перед проверкой. Десктоп + мобильная ширина (~390px).

### Hub `/services/`
| # | Проверка | OK |
|---|----------|-----|
| 1 | Hero + 5 chip-ссылок (одинаковый стиль, без «ломаных» hover) | ⬜ |
| 2 | Аккордеон 5 услуг открывается, CTA ведёт на L2 | ⬜ |
| 3 | View Source: статические `<a href="/services/...">` | ⬜ |

### `/services/telegram-bots/` (эталон)
| # | Проверка | OK |
|---|----------|-----|
| 1 | Hero canvas: Telegram-чат | ⬜ |
| 2 | 9 секций: описание, аудитория, задачи, решения, этапы, кейсы, FAQ, форма | ⬜ |
| 3 | Кейсы bot2, bot4, bot7 — кликабельны | ⬜ |
| 4 | Мобилка: hero под текстом, без горизонтального скролла | ⬜ |

### `/services/telegram-bots/ai-bots/`
| # | Проверка | OK |
|---|----------|-----|
| 1 | Hero: AI-чат (картинка → код → текст) | ⬜ |
| 2 | Audience-ротатор виден | ⬜ |
| 3 | Кейсы bot2, bot7 | ⬜ |
| 4 | Крошки: Услуги → Telegram-боты → AI-боты | ⬜ |

### `/services/ai-assistants/` (шестерёнки)
| # | Проверка | OK |
|---|----------|-----|
| 1 | 3 шестерёнки **не налезают**, монохром, **без подписи** | ⬜ |
| 2 | Крупнее центр, влезают в hero на мобилке | ⬜ |
| 3 | Описание + FAQ + кейс bot6 | ⬜ |

### `/services/ai-agents/` (чат агента)
| # | Проверка | OK |
|---|----------|-----|
| 1 | Панель чата: вопрос → поиск по БД → индексация → ответ | ⬜ |
| 2 | Текст не обрезается, fitScale на узком экране | ⬜ |
| 3 | Кейс site4 в блоке проектов | ⬜ |

### `/services/ai-implementation/` (mecha-робот)
| # | Проверка | OK |
|---|----------|-----|
| 1 | Объёмный mecha-робот: плечи, визор, панели — **без шестерёнок** | ⬜ |
| 2 | Цикл «загорается → горит → гаснет» (визор + реактор) | ⬜ |
| 3 | Lead + описание + этапы + FAQ + кейсы site2, bot6 | ⬜ |

### `/services/web-development/` (UI mockup)
| # | Проверка | OK |
|---|----------|-----|
| 1 | Сборка UI: панель → поиск → nav → hero → карточки | ⬜ |
| 2 | Без жёсткой рамки, влезает в hero | ⬜ |
| 3 | Мобилка: 2 колонки карточек | ⬜ |

### Главная `/#servicesHub`
| # | Проверка | OK |
|---|----------|-----|
| 1 | Аккордеон 5 направлений | ⬜ |
| 2 | Ссылка «Все услуги ↗» → `/services/` | ⬜ |
| 3 | `<noscript>` с URL услуг в source | ⬜ |

### Общее (все service pages)
| # | Проверка | OK |
|---|----------|-----|
| 1 | Nav «Услуги» → `/services/` | ⬜ |
| 2 | Крошки видны на всех L2 (Главная / Услуги / …) | ⬜ |
| 3 | Акцентный цвет услуги: заголовок, kicker, ореол hero | ⬜ |
| 4 | Кейсы с превью-картинкой | ⬜ |
| 5 | Финальный CTA — текст под услугу (не generic) | ⬜ |
| 6 | Hero parallax при скролле / движении мыши | ⬜ |
| 7 | Форма / модалка «Обсудить проект» | ⬜ |
| 8 | F12 без ошибок | ⬜ |

**После всех галочек:** напиши **«OK F0»** → переходим к F1 (nav главной) + F2 (SEO-ссылки).

1. **Локальная проверка F0** — открыть URL ниже, сказать OK / что поправить
2. **Деплой (F6)** — только по явной просьбе
3. **Переобход (F8)** — вручную в Вебмастере после деплоя
4. **Ассеты bot6/bot2 (F5)** — нужны скрины для замены картинок (если есть)

### URL для проверки F0

```
http://localhost:8099/services/
http://localhost:8099/services/ai-assistants/
http://localhost:8099/services/ai-implementation/
http://localhost:8099/services/ai-agents/
http://localhost:8099/services/web-development/
http://localhost:8099/services/telegram-bots/
http://localhost:8099/services/telegram-bots/ai-bots/
http://localhost:8099/#servicesHub
```

View Source на `/services/` и `/#servicesHub` — должны быть `<a href="/services/...">` в HTML.

---

## F1 + F2 — сделано (2026-07-10)

### F1 Nav
- [x] Главная: «Услуги» → `/services/` (desktop + mobile)
- [x] L2 услуги: nav через `service-page.js` → `/services/`
- [x] 6 страниц кейсов: добавлен пункт «Услуги» → `/services/`

### F2 Crawlable
- [x] Главная `#portfolio`: `.portfolio-crawlable` — 6 ссылок на кейсы в HTML
- [x] Каждая услуга: `.service-cases-crawlable` в source (не затирается JS)

### Bing Webmaster (ИИ-выдача)
- [x] Meta-тег `msvalidate.01` в `index.html` `<head>`
- [ ] **После деплоя:** [Bing Webmaster Tools](https://www.bing.com/webmasters?siteUrl=https://dev2026.ru/&state=verifySite) → Verify
- [ ] Не удалять meta-тег после верификации

---

## F6 — деплой (2026-07-10)

- Платформа: **GitHub Pages** (`CNAME` → dev2026.ru), не VPS
- Действие: merge `feat/services-infrastructure` → `main`, `git push origin main`
- До деплоя: `/services/` → 404 на prod
- После: проверить F7 (7 URL услуг → 200)

`deploy_new_vps.py` **не в git** — содержит пароль SSH и bot token.

---

## Следующий этап: F7 → F1b → F3

1. **F7** — post-deploy: curl 7 `/services/*`, crawlable в source
2. **F1b** — Bing Webmaster verify (meta уже в `index.html`)
3. **F3** — кейсы: блок услуги, похожие проекты, крошки → `/services/`
4. **F4** — sitemap.xml + 7 услуг
5. **F5** — контент/ассеты bot6, bot2
6. **F8** — переобход 4 кейсов + sitemap в Яндекс.Вебмастер (ручной)
