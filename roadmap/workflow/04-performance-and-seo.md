# Этап 4: Производительность и базовое SEO

## Цель
Техническая база для индексации и нормального сниппета. **Не путать с этапом 5** (рост в топ по ключам).

## Задачи
- [x] Lazy-loading изображений кейсов
- [x] Ограничение blur-анимаций на мобильных
- [x] Meta-теги (title, description, keywords)
- [x] Open Graph + Twitter Card
- [x] Canonical URL
- [x] Favicon / apple-touch-icon → `assets/brand/logo.png`
- [x] JSON-LD Person (главная) + CreativeWork/FAQPage/BreadcrumbList (кейсы)
- [x] robots.txt + sitemap.xml + site.webmanifest
- [x] Деплой на dev2026.ru (VPS `/var/www/dev2026`)
- [x] Google Search Console — verification + sitemap отправлен
- [x] Яндекс.Вебмастер — sitemap OK
- [ ] `assets/brand/logo.png` — положить лого (512×512)
- [ ] FAQPage JSON-LD на главной
- [ ] Обновить Яндекс.Метрику под актуальные цели заявок
- [ ] Lighthouse mobile score > 80

## Проверка
- Формы отправляются end-to-end
- Все формы работают на главной и на страницах кейсов
- Страница загружается без ошибок в консоли
- Метрика фиксирует нужные цели
- `/robots.txt` и `/sitemap.xml` открываются на проде

## Дальше
Рост по ключам («разработка telegram ботов» и т.д.) → **[05-seo-growth-ranking.md](05-seo-growth-ranking.md)**
