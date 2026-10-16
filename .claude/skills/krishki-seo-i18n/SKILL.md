---
name: krishki-seo-i18n
description: Multilingual (ru/uz/en) routing, translation workflow and SEO rules for krishki.uz — metadata, hreflang, sitemap, schema.org, analytics, Search Console and Yandex Webmaster. Load before routing, metadata, content or analytics work.
---

# i18n
- next-intl, locale prefix always: `/ru`, `/uz`, `/en`; `/` redirects by Accept-Language, default ru.
- Uzbek in Latin script (oʻ, gʻ with U+02BB). Confirm with client whether a Cyrillic Uzbek version is needed (TODO(client)).
- Messages in `apps/web/messages/{ru,uz,en}.json`; keys namespaced by section. CI fails on missing keys.
- Machine translation (stage 2) is a draft only: flag `reviewed: false` until a human approves.

# SEO
- Every page: unique title (≤ 60), description (≤ 155), canonical, OG image 1200×630 per locale.
- hreflang ru-UZ / uz-UZ / en + x-default on all pages; sitemap.xml with alternates; robots.txt.
- Pages: home, /products/sko-i82, /products/twist-off, /products/wikel-ring, /designs (50 lids, each design indexable at /designs/[slug]), /services/lacquering, /services/lithography, /private-label, /about, /contacts, /privacy.
- schema.org JSON-LD: Organization + LocalBusiness (address in Kokand, phones), Product per lid type (no price unless the client provides), BreadcrumbList, FAQPage only with real Q&A.
- Content must be server-rendered; 3D is progressive enhancement. Every lid design has an <img> with alt text in each language.
- Core Web Vitals are ranking inputs: see krishki-qa budgets.
- Target queries (validate in Search Console after launch): крышки для консервации оптом, крышки СКО 82, твист офф крышки Узбекистан, викельные кольца, литография жести, konserva qopqoqlari.

# Analytics
- GA4 + Google Tag Manager (client already uses GTM), Yandex Metrica.
- Events: lead_submit (with direction), phone_click, telegram_click, whatsapp_click, design_open, filter_change, lang_switch.
- Consent banner before non-essential tags.
- Launch checklist: Google Search Console + Yandex Webmaster verified, sitemap submitted, Google Business Profile and Yandex Business for the Kokand factory updated with the new URL.
