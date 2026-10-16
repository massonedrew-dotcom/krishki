---
name: krishki-domain
description: Business facts, products, audiences, lead directions and content rules for the ELIT KONSERVA (krishki.uz) website. Load before writing any copy, data model, catalog entry or form.
---

# ELIT KONSERVA domain

## Company facts (source: current krishki.uz, confirm with client before launch)
- Legal name: ООО «Elit Konserva». Founded 1996. Twist-Off production since 2016. Sealing rings since 2014. New SKO line «Елисейские крышки» since 2022.
- Address: Республика Узбекистан, Ферганская область, г. Коканд, ул. Кипчок Арик, 98А.
- Phones: +998 97 590-88-22, +998 91 152-42-03, +998 73 542-34-91. Email: info@krishki.uz. Telegram: @krishki_uz.
- Partners on current site: Modesto, Оливьез, Hilol, Picolla, Sardoba, Ittifoq, Ibrat (logos need client permission).

## Products (source: client catalog, assets/reference/*.jpg — confirmed facts)

### SKO I-82 — «Мечта хозяйки» / «Елисейские крышки»
- For glass jars with SKO I-82 neck finish.
- Food-grade tin ЭЖК, metal thickness 0.17–0.20 mm.
- Double protective coating: outside golden single-colour with lacquer; inside food enamel + lacquer, silver-grey tone.
- Sealing ring of high-quality food-grade rubber.
- Additional stiffening rib for mechanical strength.
- Retail tube: 50 pcs. Tube print bilingual: «Мечта хозяйки / Beka orzusi», «Качество, проверенное временем».

### Twist-Off 82 — «Мечта хозяйки»
- Screw lids for jars with 82 threaded neck, food canning tin ЭЖК.
- Double coating: outside bright single-colour lithography + lacquer (green, red shown); inside lacquer.
- Vacuum button (safety button) in the centre for visual and audible vacuum check.
- Plastisol sealing compound, suitable for sterilisation and pasteurisation.
- Closed by hand, no seaming machine needed.
- Retail tube: 20 pcs.

### SKO brands «Моя мечта» and «Роса»
- Tin ЭЖК 0.16 mm, tin coating 2.8/2.8.
- Outer lacquer ЭП 570/С (Russia); inner enamel lacquer ЭП 5147/С (Russia); top coat lacquer PPG 2040 (Germany); inks HUBER GROUP (Germany).
- Tube 50 pcs. Bulk: 1,000 pcs per box; «Моя мечта» in a white box, «Роса» in a box with logo.

### Wikel ring — Викельное кольцо: rubber sealing ring for SKO lids, own RTI section.

Brands on site: «Мечта хозяйки» (Beka orzusi), «Елисейские крышки», «Моя мечта», «Роса» — all owned by ELIT KONSERVA (confirmed in brief).
Still unknown: other diameters, full colour list, MOQ per design, prices, lead times. Never invent; use `TODO(client)`.

## Brief decisions (docs/client-brief.md)
- Priority products: SKO and Twist-Off. Priority markets: CIS countries.
- Most frequent buyer question: price → every product block has a «Запросить прайс» CTA; prices are not published unless the client decides otherwise.
- Approver and only admin user: Oleg. Texts are written by us. Privacy policy written by us.
- Factory facts: take from the current krishki.uz (client says it is up to date).
- Social proof: partners list only (no testimonials).
- Deadline: the site must bring clients in November 2026.

## Services
- Lacquering of tin (PPG food lacquers, withstands sterilisation above 100 °C)
- Lithography of tin sheets (full-colour print for lids, cans, tubes, boxes)
- Private label: SKO and Twist-Off under the customer's trademark

## The "50 designs" catalog
File `apps/web/content/lids.json`, one entry per design:
`{ id, slug, type: "sko"|"twist-off", line, name: {ru,uz,en}, diameterMm, colors[], texture: "/lids/NN.webp", insideLacquer: "gold"|"clear"|"white", isNew, privateLabelExample }`

## Audiences and lead tags
| tag | who | what they need |
|-----|-----|----------------|
| b2b_wholesale | canning plants, distributors | volumes, stability, samples, price on request |
| export | buyers in KZ, KG, TJ, TM, AF, RU | logistics, documents, minimum lot |
| private_label | brands | own-design lids, lithography process, timelines |
| retail | shops, markets | where to buy, packs |
| services | packaging makers | lacquering and lithography orders |

Every lead carries exactly one tag, language, source page and UTM fields.

## Tone of voice
Factory, precise, calm. Facts and numbers over adjectives. No "лучшие", "уникальные", "инновационные" without proof. Short sentences. Same meaning in ru, uz, en.
