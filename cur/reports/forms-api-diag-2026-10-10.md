# Диагностика форм и API — 2026-10-10

## Вердикт

Форма долго висит на «Отправка…», потом открывает личный `t.me/t6arev`, потому что:

1. HTTPS endpoint `https://153-80-242-53.sslip.io/api/leads` **мёртв** (TCP timeout на :443).
2. Фронт ждал до 12 с, затем `allowTelegramFallback: true` открывал личный Telegram.
3. Бот и Node на VPS **живы**: `http://153.80.242.53:3001/api/leads` → `200` за ~0.2–0.4 с, `delivered: true`.

Сайт (GitHub Pages) отдаётся быстро. «Тормоза страницы» субъективно связаны с ожиданием формы и картинками кейсов, не с nginx GitHub.

## Замеры

| Цель | HTTP | TTFB / total |
|------|------|--------------|
| `dev2026.ru/` HTML | 200 | ~0.22 s |
| `/services/telegram-bots/` HTML | 200 | ~0.22–0.59 s, ~21 KB |
| `/services/ai-assistants/` HTML | 200 | ~0.22–0.31 s, ~18 KB |
| `https://…sslip.io/api/health` | 000 | timeout 6–19 s |
| `http://sslip.io/api/health` | 302 → HTTPS | Caddy :80 ок |
| `http://153.80.242.53:3001/api/health` | 200 | ~0.09 s |
| `POST :3001/api/leads` | 200 | ~0.33–0.45 s, bot OK |
| Local form → `:3001` (после фикса) | 200 | **250–417 ms**, без личного TG |
| `https://snoviai.ru/` (тот же VPS) | 200 | HTTPS работает (nginx+Caddy) |

Вывод по nginx/Caddy: на VPS **сломан именно TLS :443 для sslip.io**. HTTP :80 и HTTPS для snoviai.ru работают. Сайт Pages — не nginx VPS.

## Корневая причина цепочки

```
форма → fetch sslip HTTPS (висит)
     → abort / network error
     → allowTelegramFallback → window.open(t.me/t6arev)
```

Нужный путь:

```
форма → HTTPS API → Node → Telegram Bot → чат «заявки»
формат: Заявочки 📋 / Источник / Имя / Канал / Контакт
```

## Что уже поправлено в репо

- `js/config.js`: `allowTelegramFallback: false`; `apiUrlLocal` для localhost → прямой Node.
- `js/leads.js`: `resolveLeadApiUrl()`, timeout 8 с, без авто-открытия личного TG; убраны debug-логи.
- `server/index.js`: заголовок сообщения `Заявочки 📋 Новая заявка с сайта`.
- Cache-bust `config.js` / `leads.js` → `?v=hud4` на главной, TG и AI лендингах.
- Скрипт VPS: `scripts/fix-leads-caddy.sh`.

## Фикс на VPS (2026-10-10, выполнен)

- Внешний TLS к `153.80.242.53:443` ломается (TCP ок, ClientHello не доходит — DPI/фильтр). xray/mtproto **не трогали**.
- Добавлен безопасный путь в snovi Caddy (только prefix):  
  `https://snoviai.ru/dev2026-leads/*` → `172.18.0.1:3001`
- Формат бота на VPS: `Заявочки 📋 Новая заявка с сайта`
- Фронт `apiUrl`: `https://snoviai.ru/dev2026-leads/api/leads` (`?v=hud5`), fallback выключен

### Проверка после фикса

| Запрос | Результат |
|--------|-----------|
| `GET https://snoviai.ru/dev2026-leads/api/health` | 200 за ~0.20 с |
| `POST …/api/leads` | 200, `delivered:true` за ~0.61 с |
| xray `:2053/:8443/:10000`, mtproto `:4443` | без изменений |

## Осталось

1. Задеплоить фронт на GitHub Pages (`main`) — иначе prod всё ещё на старом sslip + fallback.
2. Сменить root-пароль VPS (светился в чате).
