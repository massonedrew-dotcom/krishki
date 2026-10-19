# TASKS — распределение по ролям

> Запуск MVP: **9 ноября 2026** (график: docs/timeline.md, архитектура: docs/architecture.md, ADR: docs/adr/).
> Общий DoD для любой UI-задачи — чек-лист krishki-qa (ru/uz/en, скриншоты 1440 и 390 в qa/screens/<задача>/, без ошибок консоли, lint+typecheck+tests, бюджеты, клавиатура и AA, reduced-motion, LICENSES.md).
> Статусы: ✅ готово · 🔄 в работе · ⏳ ждёт · ⛔ блокер клиента

## Фаза 1 — MVP

| # | Задача | Агент | Зависит от | Срок | Готово, когда | Статус |
|---|--------|-------|-----------|------|---------------|--------|
| 0 | Инвентаризация контента, вопросы клиенту | architect | — | 15 окт | docs/content-inventory.md, docs/open-questions.md | ✅ |
| 1a | Архитектура, ADR 0001–0003, 0005, график | architect | 0 | 16 окт | документы утверждены | ✅ (0004 снят, 0005 — фаза 2) |
| 1b | Скелет монорепо: pnpm workspaces, apps/web (Next 15, TS strict, Tailwind v4, next-intl ru/uz/en), apps/api (FastAPI + /healthz), packages/shared, infra/docker-compose (api, db, caddy), .env.example, CI (lint, typecheck, tests) | architect | 1a | 20 окт | `pnpm build` и `pytest` проходят, CI зелёный на первом PR, пустые страницы /ru /uz /en открываются | ✅ локально (CI — после создания GitHub-репозитория) |
| 2 | DESIGN.md + /[locale]/styleguide: токены, 2 шрифта с кириллицей и oʻ gʻ, компоненты во всех состояниях | frontend-dev | 1b | 23 окт | скриншоты 1440/390 утверждены вами, impeccable без замечаний | 🔄 клиент: «недостаточно привлекательно» — переработка после прототипа |
| 3a | Модели СКО I-82 и Твист-офф 82 в Blender (реальный размер, круговая UV, PBR) | threed-dev | 1a | 23 окт | .blend в assets/blender, рендеры-проверки пропорций в qa/screens/3d | ✅ |
| 3b | Рендер короткой секвенции 60–90 кадров, WebP 1600/900, первый кадр < 120 KB | threed-dev | 3a | 28 окт | кадры в apps/web/public/sequence, суммарно ≤ 2,5 MB desktop / 1,2 MB mobile | ⏸ заменено прототипом 3D-скролла (ADR 0003, поправка) |
| 4 | Страницы MVP: главная (Header, Hero-оболочка, ProductSpec, ServicesSplit, ProcessTimeline, PartnersStrip, LeadForm-оболочка, Footer), СКО, Твист-офф, бренды (сетка картинок с фильтром), о нас, контакты, политика | frontend-dev | 2 | 3 ноя | DoD krishki-qa; тексты только из messages/*.json; без выдуманных фактов | ⏳ |
| 5 | 3D-история на скролле: крышка СКО слева → центр → переворот (кольцо) → через слайды брендов → вправо (R3F + GSAP + Lenis), fallback-кадры | threed-dev | 3b, 4 | 30 окт | LCP < 2,5 с на мобильном, JS героя < 60 KB gz, fallback-и проверены | ⏳ |
| 8 | API заявок: модели leads/lead_events, Alembic, POST /v1/leads (Turnstile, honeypot, rate limit, дедуп), Telegram-уведомление с ретраями, email-fallback, OpenAPI → packages/shared | backend-dev | 1b | 27 окт | pytest (все кейсы krishki-qa) зелёный, тестовая заявка в тестовой группе Telegram | ✅ код (DB-тесты — в CI; боевой Telegram ⛔) |
| 9 | Форма → server action → API, Zod = Pydantic, 5 направлений, пресет продукта со страницы | frontend-dev + backend-dev | 4, 8 | 30 окт | Playwright e2e по 5 направлениям, ошибки и успех объявляются (aria-live) | ⏳ |
| 10 | SEO и аналитика: metadata, canonical, hreflang, sitemap, robots, JSON-LD (Organization, LocalBusiness, Product, BreadcrumbList), OG-картинки, GTM/GA4/Metrica после согласия, проверка ключей переводов в CI | frontend-dev | 4 | 3 ноя | отчёт qa-seo без fail | ⏳ |
| 14 | Инфраструктура: хостинг (решение отложено), харденинг, docker compose, Caddy, staging с basic auth, бэкап, деплой по тегу | backend-dev + architect | 8, выбор хостинга | 30 окт | staging открывается по HTTPS, заголовки безопасности на месте, бэкап восстанавливается | ⏳ ⛔ хостинг |
| 11 | Security review (prompts/06) | security-reviewer | 8, 9, 14 | 4 ноя | docs/security/<дата>-full.md без Critical/High | ⏳ |
| 16 | Анимации, CSS-часть: планы 001, 003, 004, 005, 007 из docs/plans/animation-improvements.md (отклик кнопок и чипов, will-change, hover только для мыши, стрелка-ссылка на transform, волна в мобильном меню). Файлы: только apps/web/src/components/ui/ui.css и site.css | frontend-dev | — | 21 окт | lint+typecheck+build, скриншоты 1440/390 до и после в qa/screens/16-motion-css/, ревью docs/reviews/ | ✅ принято 19 окт (найден баг мобильного меню, см. ревью) |
| 17 | Починить мобильное меню: backdrop-filter у .site-header делает шапку контейнером для fixed .menu-panel, панель нулевой высоты (docs/reviews/2026-10-19-16-motion-css.md, п. 1). Заодно out/** в ignores apps/web/eslint.config.mjs. Файлы: site.css, mobile-menu.tsx, header.tsx (если нужно), eslint.config.mjs | frontend-dev | 16 | 21 окт | меню на 390 открывается на весь экран, волна ссылок видна, Escape/клик по ссылке закрывают, фокус не теряется; plain `pnpm lint` зелёный; скриншоты в qa/screens/17-mobile-menu/ | ✅ принято 19 окт (бургер обрезан на 375, см. ревью) |
| 18 | Шапка на узких экранах: на 375 px бургер вылезает на ~20 px за край (docs/reviews/2026-10-19-17-mobile-menu.md, п. 1). Файлы: header.tsx, site.css | frontend-dev | 17 | 21 окт | на 320/360/375/390/414 во всех трёх языках ряд шапки помещается, бургер и «Позвонить» целиком видны, цели нажатия ≥ 44 px; lint+typecheck+build; скриншоты в qa/screens/18-header-narrow/ | ✅ принято 19 окт |
| 19 | Баги из отзыва клиента 19 окт (docs/plans/redesign-v3.md, фаза 1): гигантский диск в PageHero, форма на /contacts первой, крошечные тубы, растянутая карточка СКО, баннеры с обрезанным текстом, наложение в hero главной. Файлы: apps/web/src (кроме components/home/hero-parade-slot.tsx и 3D) | frontend-dev | 18 | 21 окт | скриншоты 1440/1366/1280/390 /, /products, /products/sko-i82, /products/twist-off, /brands, /contacts без наложений; lint+typecheck+build | ✅ |
| 20 | Прототип «светлая главная, 3 крышки в движении» по prompts/10-light-cinematic-home.md. Файлы: только prototypes/light-home/ | threed-dev | 3a | 23 окт | открывается без ошибок 1440/1366/1280/768/390, скриншоты qa/screens/20-light-home/, fps по тирам, все факты из content-inventory / lid-standards | ✅ |
| 21 | Опубликовать прототип 20 на Pages (/prototype-light/) | lead | 20 | 23 окт | ссылка открывается | ⏳ |
| 22 | Характеристики СКО и твист-офф на страницах продукции (docs/research/lid-standards.md), ru/uz/en | frontend-dev | 19, ответы клиента (TODO) | 28 окт | только подтверждённые факты; qa-seo без fail | ⏳ |
| 23 | Перенос прототипа в apps/web (R3F-остров + стек секций), токены и шрифт выбранного направления | threed-dev + frontend-dev | 20 одобрен клиентом, выбор цвета/шрифта | 3 ноя | бюджеты krishki-qa, DoD | ⏳ |
| 12 | QA, 301 со старых URL, launch-checklist, запуск | qa-seo + architect | 4, 5, 9, 10, 11, 14 | 6 ноя → 9 ноя | launch-checklist закрыт, ваше «go», первая боевая заявка дошла | ⏳ ⛔ домен |

## Фаза 2 — сразу после запуска (16 ноя – 18 дек)

| # | Задача | Агент | Зависит от | Готово, когда |
|---|--------|-------|-----------|---------------|
| 6 | Стена 50 крышек (drei Instances, атлас, фильтры, мобильная сетка) | threed-dev | 3a, 4, сканы дизайнов | ≥ 45 fps на среднем Android, доступна как список кнопок |
| 7 | Прелоадер liquid-logo (лицензия PolyForm Shield подтверждена) | threed-dev | SVG-логотип | ≤ 2 с, пропуск на повторе |
| 13 | Админка, медиа-пайплайн (prompts/09, ADR 0005) | architect → backend-dev → frontend-dev → security-reviewer | 8, 10 | загрузка текстуры видна на сайте за 60 с, security без Critical/High |
| 15 | Лендинги СКО/Твист-офф × страны СНГ, страницы /designs/[slug], услуги, private label, FAQ | frontend-dev + qa-seo | 10, данные от клиента | qa-seo без fail, страницы в sitemap |

## Блокеры от клиента (сроки — docs/timeline.md)
Доступ к домену krishki.uz; рабочий телефон и Telegram Олега; согласие на нейроперевод; ответ про бренд «Гурман»; фото/сканы дизайнов; логотипы в векторе и цвета бренда; цены или правило ответа на «Запросить прайс»; разрешение на логотипы партнёров; ответ юриста о хранении персональных данных; хостинг и оплата VPS; ИНН и юр. адрес письменно. Полный список — docs/open-questions.md.
