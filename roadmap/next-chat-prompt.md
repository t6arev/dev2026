Продолжай проект **dev2026.ru** — ветка **P0: восстановление индексации 4 кейсов в Яндексе**.

## Контекст (прочитай перед работой)

- **Workflow P0:** `roadmap/workflow/09-p0-case-reindex.md` ← **главный документ**
- **Аудит исключения:** `seo-audit-yandex-exclusion-dev2026-cases-2026-07-08.md`
- **Трек услуг:** `roadmap/services-branch-plan.md`
- **Кластерная архитектура:** `roadmap/workflow/08-seo-cluster-architecture.md`
- **Журнал:** `cur/journal.md`

## Цель P0

Вернуть в индекс Яндекса 4 кейса:

- `/cases/ai-assistant-business/` (bot6)
- `/cases/ai-bot-telegram/` (bot2)
- `/cases/razrabotka-ii-agentov-ai-platforma/` (site4)
- `/cases/telegram-bot-dlya-treydinga/` (bot7)

## Что уже есть

- 7 URL услуг локально (5 L2 + 1 L3 + hub), **деплоя не было**
- Эталон `telegram-bots` + `ai-bots` — в работе, не идеальны
- 4 услуги — **shells** (нужен минимум контента для P0)
- `#servicesHub` на главной — базово, nav ведёт на `#servicesHub`, не `/services/`
- Перелинковка услуга→кейс через JS (`relatedCaseIds`), обратных ссылок с кейсов нет
- sitemap: 7 URL (без услуг)

## Что не готово (учитывать)

| Компонент | Статус |
|-----------|--------|
| `telegram-bots`, `ai-bots` | 2 страницы не доведены до идеала — **не блокируют P0** |
| 4 shell-услуги | нужен минимум: seo, hero, FAQ, статические ссылки на кейсы |
| `#servicesHub` | нужен nav на `/services/` + crawlable fallback |
| mini-apps, crm-bots | **вне P0** |

## Локально

```powershell
cd "C:\Users\t6are\OneDrive\Рабочий стол\моя визитка"
python -m http.server 8099
```

## С чего начать в этом чате

Открыть `09-p0-case-reindex.md` и взять **первую незакрытую фазу**:

1. **F0** — shells + hub crawlable + smoke-test 2 страниц
2. **F1** — nav `/services/`
3. **F2** — статические ссылки на кейсы (главная + услуги)
4. **F3** — кейсы: услуга + похожие + крошки
5. **F4–F5** — sitemap + bot6/bot2
6. **F6–F8** — деплой + чеклист (переобход — вручную заказчиком)

## Принципы P0

- **Минимально жизнеспособный кластер**, не ждать 1800 слов и идеального дизайна
- **Crawlable HTML** важнее JS-рендера для перелинковки
- bot6 — контент **обязателен**; bot2 — картинки + KPI
- Деплой и commit — **только по явной просьбе**

## Не делать без запроса

- merge в `main` / деплой на VPS
- git commit
- mini-apps, crm-bots, блог (это P1/P2)
