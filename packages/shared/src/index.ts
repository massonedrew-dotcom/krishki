// Shared enums for the lead form and the API (krishki-backend data model).
// Replaced by types generated from packages/shared/openapi.json once POST /v1/leads exists (task 8).

export const LOCALES = ["ru", "uz", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";

export const DIRECTIONS = [
  "b2b_wholesale",
  "export",
  "private_label",
  "retail",
  "services",
] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const PRODUCTS = ["sko", "twist_off", "ring", "service", "unknown"] as const;
export type Product = (typeof PRODUCTS)[number];
