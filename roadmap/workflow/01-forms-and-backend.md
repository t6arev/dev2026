# Этап 1: Формы и backend

## Цель
Надёжная доставка заявок в Telegram через Node.js endpoint.

## Задачи
- [x] Убрать Telegram token из клиента
- [x] `POST /api/leads` на Node.js сервере
- [x] Выбор канала связи: Telegram / Телефон / Почта
- [x] Валидация полей на клиенте
- [x] Honeypot + rate limit на сервере
- [x] Единый payload для quiz и callback

## Файлы
- `server/index.js` — Express endpoint
- `server/.env.example` — шаблон переменных
- `js/leads.js` — клиентская отправка
- `js/main.js` — логика форм

## Проверка
1. Запустить `npm start` в `server/`
2. Отправить quiz-форму
3. Отправить callback-форму
4. Убедиться, что сообщение пришло в Telegram
