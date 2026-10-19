import { IBM_Plex_Mono, Inter, Montserrat } from "next/font/google";

// next/font needs literal options (no shared variables). All three are SIL OFL 1.1, self-hosted at build time.
// cyrillic-ext carries Uzbek Cyrillic Қ Ғ Ҳ; latin-ext carries Uzbek Latin oʻ gʻ (U+02BB).

/** Display: headings and big figures. 600 in markup resolves to 700. */
export const fontDisplay = Montserrat({
  subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-montserrat",
});

/** Text: all body copy and UI, with tabular figures. */
export const fontText = Inter({
  subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

/** Technical captions and drawing-style annotations. */
export const fontMono = IBM_Plex_Mono({
  subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const fontVariables = `${fontDisplay.variable} ${fontText.variable} ${fontMono.variable}`;
