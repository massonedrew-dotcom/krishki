# 07 — SEO, i18n, analytics (агент: qa-seo + frontend-dev)

```
Use the frontend-dev agent with krishki-seo-i18n. Implement per-locale metadata, canonical, hreflang (ru-UZ, uz-UZ, en, x-default), sitemap.xml with alternates, robots.txt, OG images per locale, JSON-LD Organization + LocalBusiness + Product + BreadcrumbList, indexable /designs/[slug] pages, GTM container with the events listed in the skill, consent banner. Add a CI check that fails on missing translation keys. Then use the qa-seo agent to validate everything (Rich Results test locally via schema validation, hreflang reciprocity, sitemap URLs return 200) and write qa/reports/<date>-seo.md.
```
