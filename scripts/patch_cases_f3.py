# -*- coding: utf-8 -*-
"""Patch P0 F3 blocks into the four target case pages."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CASES = {
    "ai-bot-telegram": {
        "service_url": "/services/telegram-bots/ai-bots/",
        "service_name": "AI-боты для Telegram",
        "service_desc": "Разработка AI-бота под ключ: GPT, база знаний, квалификация лидов и поддержка в Telegram.",
        "case_crumb": "Telegram-бот с ИИ",
        "json_case_name": "Telegram-бот с искусственным интеллектом",
        "related": [
            ("/cases/telegram-bot-dlya-treydinga/", "Telegram-бот для трейдинга"),
            ("/cases/vpn-bot-telegram/", "VPN-бот для Telegram"),
        ],
    },
    "telegram-bot-dlya-treydinga": {
        "service_url": "/services/telegram-bots/",
        "service_name": "Разработка Telegram-ботов",
        "service_desc": "Чат-боты, Mini Apps, подписки и интеграции с CRM — под ключ внутри Telegram.",
        "case_crumb": "Бот для трейдинга",
        "json_case_name": "Telegram-бот для трейдинга",
        "related": [
            ("/cases/ai-bot-telegram/", "Telegram-бот с ИИ"),
            ("/cases/vpn-bot-telegram/", "VPN-бот для Telegram"),
        ],
    },
    "ai-assistant-business": {
        "service_url": "/services/ai-assistants/",
        "service_name": "AI-ассистенты",
        "service_desc": "Корпоративные ассистенты, база знаний, роли для отделов и кастомная автоматизация.",
        "case_crumb": "AI-ассистент для бизнеса",
        "json_case_name": "AI-ассистент для бизнеса",
        "related": [
            ("/cases/ii-v-prodazhi-b2b-rassylki/", "ИИ в продажи B2B"),
        ],
    },
    "razrabotka-ii-agentov-ai-platforma": {
        "service_url": "/services/ai-agents/",
        "service_name": "Создание ИИ-агентов",
        "service_desc": "Мультиагентные системы, RAG, интеграции с CRM и production-запуск AI-платформ.",
        "case_crumb": "ИИ-агенты и AI-платформа",
        "json_case_name": "Разработка ИИ-агентов и AI-платформы",
        "related": [
            ("/cases/ai-assistant-business/", "AI-ассистент для бизнеса"),
        ],
    },
}


def breadcrumbs_block(cfg: dict) -> str:
    return f"""        <nav class="case-breadcrumbs" aria-label="Хлебные крошки">
            <a href="/">Главная</a>
            <span aria-hidden="true">/</span>
            <a href="/services/">Услуги</a>
            <span aria-hidden="true">/</span>
            <a href="{cfg['service_url']}">{cfg['service_name']}</a>
            <span aria-hidden="true">/</span>
            <span>{cfg['case_crumb']}</span>
        </nav>

"""


def related_blocks(cfg: dict) -> str:
    cards = "\n".join(
        f'                <a href="{url}" class="case-related-case-card">{title} <span aria-hidden="true">↗</span></a>'
        for url, title in cfg["related"]
    )
    return f"""        <section class="section case-related-service" aria-label="Связанная услуга">
            <span class="kicker-mono"><span class="dot"></span>УСЛУГА</span>
            <h2 class="section-title case-related-heading">Услуга по этому направлению</h2>
            <a href="{cfg['service_url']}" class="case-related-service-card">
                <span class="case-related-service-name">{cfg['service_name']}</span>
                <span class="case-related-service-desc">{cfg['service_desc']}</span>
                <span class="case-related-service-cta">Открыть направление ↗</span>
            </a>
        </section>

        <section class="section case-related-cases" aria-label="Похожие проекты">
            <span class="kicker-mono"><span class="dot"></span>КЕЙСЫ</span>
            <h2 class="section-title case-related-heading">Похожие проекты</h2>
            <div class="case-related-cases-grid">
{cards}
            </div>
        </section>

"""


def patch_json_ld(text: str, cfg: dict) -> str:
    case_url = f"https://dev2026.ru/cases/{cfg['slug']}/"
    service_url = "https://dev2026.ru" + cfg["service_url"].rstrip("/") + "/"
    pattern = re.compile(
        r'\{ "@type": "ListItem", "position": 2, "name": "Кейсы", "item": "https://dev2026\.ru/#portfolio" \},\s*'
        r'\{ "@type": "ListItem", "position": 3, "name": "[^"]+", "item": "[^"]+" \}',
        re.MULTILINE,
    )
    replacement = (
        '{ "@type": "ListItem", "position": 2, "name": "Услуги", "item": "https://dev2026.ru/services/" },\n'
        f'                    {{ "@type": "ListItem", "position": 3, "name": "{cfg["service_name"]}", "item": "{service_url}" }},\n'
        f'                    {{ "@type": "ListItem", "position": 4, "name": "{cfg["json_case_name"]}", "item": "{case_url}" }}'
    )
    return pattern.sub(replacement, text, count=1)


def patch_file(slug: str, cfg: dict) -> None:
    cfg = {**cfg, "slug": slug}
    path = ROOT / "cases" / slug / "index.html"
    text = path.read_text(encoding="utf-8")

    if "case-breadcrumbs" not in text:
        text = text.replace(
            "        </nav>\n\n        <header class=\"case-hero",
            "        </nav>\n\n" + breadcrumbs_block(cfg) + "        <header class=\"case-hero",
            1,
        )

    if "case-related-service" not in text:
        text = text.replace(
            "        <section id=\"contact\" class=\"section case-contact\">",
            related_blocks(cfg) + "        <section id=\"contact\" class=\"section case-contact\">",
            1,
        )

    text = patch_json_ld(text, cfg)
    path.write_text(text, encoding="utf-8")
    print(f"patched {path.relative_to(ROOT)}")


def main() -> None:
    for slug, cfg in CASES.items():
        patch_file(slug, cfg)


if __name__ == "__main__":
    main()
