# Handoff чата · 2026-07-13 → 2026-07-15

> Рабочая ветка UI (не мержить): `ui/polish-2026-07-13`  
> Prod = `main` → GitHub Pages

## Что происходило в чате

### SEO / Яндекс
- Объяснён **переобход**: ручная кнопка в Вебмастере, не правка кода
- Sitemap OK (14 URL); обход 200; «URL неизвестен» = первый визит
- Повторный переобход уже обработанных URL **не нужен** (~3 дня)
- Аудит Pixel Tools: [`pixel-tools-audit-2026-07-15.md`](pixel-tools-audit-2026-07-15.md)
  - 301 без trailing slash — норма
  - TTFB >200 / HTML >700 — **не подтвердились**
  - 200↔404 — нет
- **Tech-only деплой** `72dc19a`: статический `canonical` на `/services/*` + `lastmod` в sitemap

### UI polish (отложено)
- План и WIP: [`ui-polish-backlog.md`](ui-polish-backlog.md), [`ui-polish-2026-07-13.md`](ui-polish-2026-07-13.md)
- **Не деплоить** до явной команды

### Контент-выгрузка
- [`services-content-export-2026-07-15.md`](services-content-export-2026-07-15.md) — Title/Desc/H1/текст/FAQ × 6 услуг

### Новый крупный заказ (2026-07-15)
Переработка SEO-страниц услуг: первое лицо, развод интентов, static meta, FAQ, перелинковка, архитектура Mini Apps / custom / SaaS.

**План веток:** [`seo-services-rewrite-plan.md`](seo-services-rewrite-plan.md)  
**Отчёт пересечений новых URL:** [`seo-new-pages-intent-report.md`](seo-new-pages-intent-report.md)

### Статус внедрения (2026-07-15)
| Ветка | Статус |
|-------|--------|
| `seo/p0-static-meta` | **DONE локально** · [`reports/seo-p0-static-meta.md`](reports/seo-p0-static-meta.md) |
| `seo/p0-telegram-bots` … контент | ожидает старта после ревью / команды |
| `ui/polish-2026-07-13` | stash `wip-ui-polish-before-seo-meta`, не мержить |

## Правило публикации

Контент и SEO-тексты **не пушить в `main`** до проверки владельцем.  
Исключение уже было: узкий tech-patch `canonical`/`lastmod`.  
P0 static meta — можно рано мержить **только** после вашего ОК (тайтлы из ТЗ).

## Связь с аудитом кейсов

[`../seo-audit-yandex-exclusion-dev2026-cases-2026-07-08.md`](../seo-audit-yandex-exclusion-dev2026-cases-2026-07-08.md): исключение из индекса было из‑за слабой crawlable-перелинковки и JS-контента.  
**Тот же урок для услуг:** Title/H1/текст в исходном HTML, не только через `services-data.js`.
