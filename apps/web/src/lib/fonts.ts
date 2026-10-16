import { IBM_Plex_Mono, Onest, Tektur } from "next/font/google";

// next/font needs literal options (no shared variables). All three are SIL OFL 1.1, self-hosted at build time.

/** Display: industrial, Cyrillic + Uzbek Latin (U+02BB, U+02BC). */
export const fontDisplay = Tektur({
  subsets: ["cyrillic", "latin", "latin-ext"],
  display: "swap",
  variable: "--font-tektur",
  axes: ["wdth"],
});

/** Text: readable grotesk with Cyrillic, Uzbek Latin and tabular figures. */
export const fontText = Onest({
  subsets: ["cyrillic", "latin", "latin-ext"],
  display: "swap",
  variable: "--font-onest",
});

/** Technical captions and drawing-style annotations. */
export const fontMono = IBM_Plex_Mono({
  subsets: ["cyrillic", "latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const fontVariables = `${fontDisplay.variable} ${fontText.variable} ${fontMono.variable}`;
