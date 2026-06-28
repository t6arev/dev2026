# Roadmap — dev2026.ru

Цели развития сайта-визитки.

## Текущий фокус: деплой и индексация

Сначала доводим до конца:

- [x] 5 SEO-страниц кейсов уже собраны
- [ ] Кейсы — добрать оставшиеся страницы и финальные баннеры
- [ ] После набора кейсов — пересобрать секцию кейсов на главной под 6–7 работ
- [ ] Лого домена — `assets/brand/logo.png` (512×512)
- [ ] Проверить все формы end-to-end (главная + страницы кейсов)
- [x] Деплой на dev2026.ru (GitHub Pages, выкладка из `main`)
- [ ] Проверить favicon / logo / OG после деплоя на живом домене
- [ ] Обновить Яндекс.Метрику: актуальные цели и события
- [x] Финальная полировка дизайна и мобилки (мобильная шапка, порядок hero, уменьшение фото, отступы форм, ускорение first-screen)
- [x] Добавлен кейс `cases/telegram-bot-dlya-treydinga/` + обновлен `sitemap.xml`
- [ ] Google Search Console: подтвердить сайт, отправить sitemap, запросить индексацию новых URL

**К SEO-росту и топу по ключам возвращаемся после этого** → [`workflow/05-seo-growth-ranking.md`](workflow/05-seo-growth-ranking.md)

---

## Этапы roadmap

| # | Этап | Статус | Документ |
|---|------|--------|----------|
| 1 | Формы + backend | ✅ готово | [`01-forms-and-backend.md`](workflow/01-forms-and-backend.md) |
| 2 | Digital-дизайн, типографика | ✅ в основном | [`02-visual-system.md`](workflow/02-visual-system.md) |
| 3 | Кейсы (аккордеон, галерея) | 🔄 фото от заказчика | [`03-cases-redesign.md`](workflow/03-cases-redesign.md) |
| 4 | Perf + базовое SEO | 🔄 частично | [`04-performance-and-seo.md`](workflow/04-performance-and-seo.md) |
| 5 | **SEO-рост, топ по ключам** | ⏸ после главной | [`05-seo-growth-ranking.md`](workflow/05-seo-growth-ranking.md) |
| 6 | Реклама | ⏸ после 4–5 | см. ниже |

---

## 1. SEO — база (этап 4, уже на сайте)

- Meta-теги, Open Graph, Twitter Card, canonical
- Favicon / apple-touch-icon → `assets/brand/logo.png`
- JSON-LD Person, robots.txt, sitemap.xml, webmanifest
- **Даёт:** нормальный сниппет, иконка в выдаче, индексация
- **Не даёт:** топ по «разработка telegram ботов» само по себе

## 5. SEO — рост (после главной)

Подробный план: **[`05-seo-growth-ranking.md`](workflow/05-seo-growth-ranking.md)**

- Посадочные страницы под услуги (`/telegram-boty/`, `/mini-apps/` …)
- Блог под long-tail запросы
- Яндекс.Вебмастер + Google Search Console
- Ссылки, Habr/VC, Telegram-канал
- KPI и план по месяцам (1–6)

---

## 2. Дизайн в сторону digital

- Усилить современный tech/digital визуал
- Единая дизайн-система, типографика, микроанимации
- Particle background (rollback через `config.js`)
- Мобильная версия

## 3. Формы

- ✅ Node.js backend `POST /api/leads`
- ✅ Telegram / Телефон / Почта
- ✅ Секреты только на сервере, honeypot, rate limit
- Следующий шаг: полная проверка форм на главной и на страницах кейсов перед деплоем
- После деплоя — обновить цели Метрики под реальные сценарии заявок

## 4. Запуск рекламы

- После стабильной главной и 1–2 посадочных
- Яндекс.Директ / Google Ads на long-tail
- UTM + Метрика `lead_submit`
- Воронка: трафик → заявка → Telegram

---

## Workflow-папка

1. [`01-forms-and-backend.md`](workflow/01-forms-and-backend.md)
2. [`02-visual-system.md`](workflow/02-visual-system.md)
3. [`03-cases-redesign.md`](workflow/03-cases-redesign.md)
4. [`04-performance-and-seo.md`](workflow/04-performance-and-seo.md)
5. [`05-seo-growth-ranking.md`](workflow/05-seo-growth-ranking.md) ← **топ по ключам**

---

## Ближайший порядок работ

1. Проверить формы и отправку заявок end-to-end
2. Проверить favicon, logo, OG и индексацию на живом домене
3. Подключить Google Search Console, отправить `https://dev2026.ru/sitemap.xml`
4. Отправить на индексацию приоритетные URL (главная + ключевые кейсы, включая `telegram-bot-dlya-treydinga`)
5. Обновить Яндекс.Метрику под нужные цели
6. Добрать оставшиеся кейсы и финальные баннеры

---

*Порядок сейчас: формы → деплой → индексация/Метрика → добивка кейсов → финальная перестройка главной.*
