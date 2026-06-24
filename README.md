# dev2026.ru - AI Architect Landing Page

Одностраничный лендинг для разработчика Telegram-ботов и сайтов.

## Технологии

- HTML5 / CSS3 / Vanilla JavaScript
- Node.js + Express (API заявок)
- Telegram Bot API (серверная отправка)
- Яндекс.Метрика

## Запуск локально

```bash
cd server
cp .env.example .env
# Заполните TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env
npm install
npm start
```

Сайт и API доступны на `http://localhost:3001`

## Структура

- `index.html` — точка входа
- `css/main.css` — стили
- `js/` — config, leads, cases-data, analytics, main
- `server/` — Node.js API (`POST /api/leads`)
- `assets/img/` — изображения
- `roadmap/` — цели и workflow
- `cur/` — журнал работ

## Формы

- Квиз «Обсудить проект» и виджет обратной связи
- Выбор канала: Telegram / Телефон / Почта
- Отправка через `/api/leads` (токен только на сервере)

## Деплой

1. Развернуть Node.js сервер (VPS)
2. Настроить `server/.env`
3. Запустить `npm start` (или PM2)
4. Настроить nginx: статика + proxy `/api/leads` → Node

---

© 2026 AI Architect
