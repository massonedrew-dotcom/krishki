/** Verified company contact data (krishki-domain). Facts, not copy; labels live in messages. */
export const PHONES = [
  { display: "+998 97 590-88-22", href: "tel:+998975908822" },
  { display: "+998 91 152-42-03", href: "tel:+998911524203" },
  { display: "+998 73 542-34-91", href: "tel:+998735423491" },
] as const;

export const PRIMARY_PHONE = PHONES[0];
export const EMAIL = "info@krishki.uz";
export const TELEGRAM = { handle: "@krishki_uz", href: "https://t.me/krishki_uz" } as const;
export const WHATSAPP = { href: "https://wa.me/998975908822" } as const;
export const INSTAGRAM = { handle: "@krishki.uz", href: "https://www.instagram.com/krishki.uz/" } as const;
export const FACEBOOK = { handle: "krishkiuz", href: "https://www.facebook.com/krishkiuz/" } as const;
/** Search link by address only. TODO(client): replace with the exact map pin of the production site (brief #17). */
export const MAP_URL = "https://www.google.com/maps/search/?api=1&query=Kokand+Kipchok+Arik+98A";
