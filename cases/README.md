# Страницы кейсов (SEO)

Каждый кейс с отдельной страницей = отдельный URL в поиске.

## Текущие страницы

| Кейс | ID | URL |
|------|-----|-----|
| AI-бот в Telegram | `bot2` | `/cases/ai-bot-telegram/` |

## Как добавить новый кейс

1. В `js/cases-data.js` добавить блок `page`:
   ```js
   page: {
       slug: 'my-case-slug',
       hasPage: true,
       featured: false,
       seo: { title, description, keywords },
       lead: '...',
       sections: [...],
       faq: [{ q, a }, ...]
   }
   ```
2. Скопировать папку `cases/ai-bot-telegram/` → `cases/{slug}/`
3. Обновить в `index.html`:
   - `data-case-id` на body
   - meta, canonical, og:url, JSON-LD
   - заголовки и placeholder-тексты
4. Добавить URL в `sitemap.xml`
5. Положить скрины в `images: [...]` — коллаж подтянется автоматически

## Где менять контент

| Что | Где |
|-----|-----|
| Скрины / коллаж | `images: [...]` в `cases-data.js` |
| SEO title/description | `cases/.../index.html` `<head>` + `page.seo` в data |
| Текст секций | HTML страницы кейса (пока вручную) |
| FAQ | HTML + `page.faq` в data для синхронизации |
| Форма | общая логика в `js/case-page.js` |

## Локальный просмотр

```
cd server && npm start
```

- Главная: http://localhost:3001/
- Кейс: http://localhost:3001/cases/ai-bot-telegram/
