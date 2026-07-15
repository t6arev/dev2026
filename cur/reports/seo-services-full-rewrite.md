# Отчёт полного SEO-rewrite услуг · 2026-07-15

> Ветка: `seo/p0-static-meta` → merge `main` → GitHub Pages  
> Голос: первое лицо («я») · без фикс. цен/сроков · без агентского «мы»

## Этапы

| Этап | Результат |
|------|-----------|
| P0 static meta | Title/Description/OG/Twitter/H1 в исходном HTML |
| Контент 6 URL | `js/services-data.js` + зеркало description/FAQ в HTML |
| FAQ/linking | уникальные FAQ; контекстные ссылки между интентами |
| Новые URL | **не публиковались**; рекомендация B в `seo-new-pages-intent-report.md` |

## Матрица страниц

| URL | Title | H1 | Интент |
|-----|-------|----|--------|
| `/services/telegram-bots/` | Разработка Telegram-ботов на заказ под ключ — dev2026 | Разработка Telegram-ботов | Общие Telegram-боты |
| `/services/telegram-bots/ai-bots/` | Разработка AI-ботов для Telegram на заказ — dev2026 | Разработка AI-ботов для Telegram | AI-боты в TG |
| `/services/ai-implementation/` | Внедрение ИИ в бизнес под ключ — dev2026 | Внедрение ИИ в бизнес | Действующий бизнес |
| `/services/ai-assistants/` | Разработка AI-ассистентов для бизнеса — dev2026 | Разработка AI-ассистентов для бизнеса | Только ассистенты |
| `/services/ai-agents/` | Разработка ИИ-агентов для бизнеса — dev2026 | Разработка ИИ-агентов для бизнеса | Многошаговые агенты |
| `/services/web-development/` | Разработка сайтов и веб-сервисов под ключ — dev2026 | Разработка сайтов и веб-сервисов | Веб-сервисы/кабинеты (вторично) |

## Внутренние ссылки (контекстные)

- telegram-bots → ai-bots (+ Mini Apps текстом, без нового URL)
- ai-bots → telegram-bots
- ai-implementation → ai-assistants, ai-agents
- ai-assistants → ai-agents, ai-implementation
- ai-agents → ai-assistants, ai-implementation
- web-development → telegram-bots (+ SaaS текстом, без нового URL)

## Чеклист

- [x] Title уникален в исходном HTML (не «Услуга — dev2026.ru»)
- [x] Description уникальны
- [x] Один H1; Title ≠ копипаста H1 на всех URL
- [x] Нет «мы / команда / агентство»
- [x] Нет «от 150 000 / от N недель / пилот за неделю»
- [x] ai-assistants очищен от сайтов/кастома/SaaS-хаба
- [x] FAQ не клоны между страницами
- [x] Ссылки в description доступны без JS
- [ ] Новые `/telegram-mini-apps/` и `/saas-development/` — только после отдельного согласования

## Deploy

Push в `main` = GitHub Pages production.
