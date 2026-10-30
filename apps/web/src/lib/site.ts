
/** Main row of the header. Labels come from messages `common.nav.<key>`. */
export const NAV = [
  { key: "products", href: "/products" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "brands", href: "/brands" },
  { key: "contacts", href: "/contacts" },
] as const;

/** Top row of the header: pages for a particular audience. */
export const AUDIENCE_NAV = [
  { key: "suppliers", href: "/suppliers" },
  { key: "distributors", href: "/distributors" },
] as const;

/** Target of the red «Заказать» button. */
export const ORDER_HREF = "/order";

/** Pages that live in the footer only. */
export const EXTRA_NAV = [
  { key: "privateLabel", href: "/private-label" },
  { key: "useful", href: "/useful" },
] as const;

export type NavKey =
  | (typeof NAV)[number]["key"]
  | (typeof AUDIENCE_NAV)[number]["key"]
  | (typeof EXTRA_NAV)[number]["key"]
  | "order";

export const PRODUCT_SLUGS = ["sko-i82", "twist-off", "wikel-ring"] as const;
export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

/** Static pages that get unique metadata. path "" is the home page. */
export const PAGE_PATHS = [
  "",
  "/products",
  "/products/sko-i82",
  "/products/twist-off",
  "/products/wikel-ring",
  "/brands",
  "/services",
  "/private-label",
  "/about",
  "/useful",
  "/contacts",
  "/suppliers",
  "/distributors",
  "/order",
  "/privacy",
] as const;

/** `cutout`: transparent background, always shown whole (contain), never cropped by a frame. */
export type Img = { src: string; width: number; height: number; cutout?: boolean };

/** Partner names are proper nouns, not translatable copy. */
/** Partner logos with the white ground keyed out (28 Oct), so they sit bare on any section colour. */
export const PARTNERS: { key: string; name: string; img: Img }[] = [
  { key: "modesto", name: "Modesto", img: { src: "/images/partners/cut/modesto.webp", width: 244, height: 130 } },
  { key: "olivye", name: "Оливьез", img: { src: "/images/partners/cut/olivye.webp", width: 241, height: 112 } },
  { key: "hilol", name: "Hilol", img: { src: "/images/partners/cut/hilol.webp", width: 216, height: 147 } },
  { key: "picolla", name: "Picolla", img: { src: "/images/partners/cut/picolla.webp", width: 243, height: 112 } },
  { key: "sardoba", name: "Sardoba", img: { src: "/images/partners/cut/sardoba.webp", width: 238, height: 85 } },
  { key: "ittifoq", name: "Ittifoq", img: { src: "/images/partners/cut/ittifoq.webp", width: 242, height: 99 } },
  { key: "ibrat", name: "Ibrat", img: { src: "/images/partners/cut/ibrat.webp", width: 240, height: 104 } },
];

/**
 * Lid accordion (client, 29 Oct: «click the lid and it opens like an accordion: ring, lid, lacquer, inner
 * lacquer»). Four layers cut from one generated storyboard frame (assets/generated/accordion-2026-10-30/,
 * GPT Image 2.5 from our own SKO photos), so they share one camera. Each is 680 px wide; the row opens left to
 * right in this order. The closed state shows the real SKO photo, not these.
 */
export const ACCORDION_LAYER_WIDTH = 680;
export const ACCORDION_LAYERS = [
  { key: "lacquerOut", src: "/images/lids/accordion/lacquer-out.webp", height: 214 },
  { key: "tin", src: "/images/lids/accordion/tin.webp", height: 300 },
  { key: "lacquerIn", src: "/images/lids/accordion/lacquer-in.webp", height: 214 },
  { key: "ring", src: "/images/lids/accordion/ring.webp", height: 232 },
] as const;
export type AccordionLayerKey = (typeof ACCORDION_LAYERS)[number]["key"];

export const PHOTO = {
  skoGold: { src: "/images/photos/sko-gold-stack.webp", width: 950, height: 650 },
  ringsBox: { src: "/images/photos/rings-box.webp", width: 950, height: 650 },
  /** The factory's own photo of the wikel rings (the generated 27 Oct packshots were withdrawn, client 29 Oct). */
  rings: { src: "/images/photos/rings.webp", width: 950, height: 650 },
  tubesElisey: { src: "/images/photos/tubes-elisey-cut.webp", width: 776, height: 384, cutout: true },
  tubesMechta: { src: "/images/photos/tubes-mechta.webp", width: 810, height: 457 },
  tubesTwist: { src: "/images/photos/tubes-twist.webp", width: 816, height: 456 },
  lithoMix: { src: "/images/photos/litho-mix.webp", width: 950, height: 650 },
  privateSko: { src: "/images/photos/private-label-sko.webp", width: 950, height: 650 },
  twistStack: { src: "/images/photos/twist-stack.webp", width: 950, height: 650 },
  twistTomato: { src: "/images/photos/twist-tomato.webp", width: 950, height: 650 },
  twistIttifoq: { src: "/images/photos/twist-ittifoq.webp", width: 950, height: 650 },
  lidSko: { src: "/images/lid-sko-i82-cutout.webp", width: 900, height: 600 },
  lidTwist: { src: "/images/lid-twist-off-red-cutout.webp", width: 900, height: 600 },
  bannerSko: { src: "/images/banners/slide-02.webp", width: 1440, height: 600 },
  bannerTwist: { src: "/images/banners/slide-03.webp", width: 1440, height: 600 },
  bannerElisey: { src: "/images/banners/slide-04.webp", width: 1440, height: 600 },
  bannerMechta: { src: "/images/banners/slide-01.webp", width: 1440, height: 600 },
} satisfies Record<string, Img>;

/** Single-tube packshots, 797x1200 at -1200 and 398x600 at -600. */
/** Single tubes, trimmed to the tube; widths differ per tube at 1200 px height. */
const tubeV2 = (name: string, width: number): Img => ({ src: `/images/tubes/v2/${name}-1200.webp`, width, height: 1200 });
export const TUBE_V2 = {
  gurmanG: tubeV2("gurman-g", 599),
  gurmanFamily: tubeV2("gurman-family", 647),
  moyaMechta: tubeV2("moya-mechta", 573),
  rosa: tubeV2("rosa", 570),
  skoMechta: tubeV2("sko-mechta", 528),
  twistGreen: tubeV2("twist-green", 560),
  twistRed: tubeV2("twist-red", 567),
} satisfies Record<string, Img>;

export const TUBE = {
  skoMechta: { src: "/images/tubes/sko-mechta.webp", width: 240, height: 472 },
  twistGreenRed: { src: "/images/tubes/twist-green-red.webp", width: 370, height: 395 },
  moyaMechta: { src: "/images/tubes/moya-mechta.webp", width: 225, height: 470 },
  rosa: { src: "/images/tubes/rosa.webp", width: 225, height: 438 },
  gurman: { src: "/images/tubes/gurman.webp", width: 650, height: 1110 },
} satisfies Record<string, Img>;

export const LOGO: Img = { src: "/images/brand/mechta-khozyayki-v2-600.webp", width: 600, height: 335 };


/** Alpha cutouts of the lid photos (no background), for the dark hero stage and the production line strip. */
export const LID_CUTOUT = {
  sko34: { src: "/images/lids/sko-34-cutout.webp", width: 785, height: 500 },
  skoTop: { src: "/images/lids/sko-top-cutout.webp", width: 785, height: 783 },
  twistRed34: { src: "/images/lids/twist-red-34-cutout.webp", width: 751, height: 472 },
  twistGreen34: { src: "/images/lids/twist-green-34-cutout.webp", width: 783, height: 518 },
  twistRedTop: { src: "/images/lids/twist-red-top-cutout.webp", width: 659, height: 696 },
  twistGreenTop: { src: "/images/lids/twist-green-top-cutout.webp", width: 677, height: 690 },
} satisfies Record<string, Img>;

/** Lid photos on white (800 px), for white product panels. */
export const LID_PHOTO = {
  sko34: { src: "/images/lids/sko-34-800.webp", width: 800, height: 800 },
  twistRed34: { src: "/images/lids/twist-red-34-800.webp", width: 800, height: 800 },
  twistGreen34: { src: "/images/lids/twist-green-34-800.webp", width: 800, height: 800 },
} satisfies Record<string, Img>;
