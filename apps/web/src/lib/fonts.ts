import { Inter, Montserrat } from "next/font/google";

// next/font needs literal options (no shared variables). Both are SIL OFL 1.1, self-hosted at build time.
// Glyph check (2026-10-26): Cyrillic, Uzbek Cyrillic (Ў Қ Ғ Ҳ) and U+02BB/U+02BC are present in both.

/** Display: Montserrat. Weights 300 (hero stage) to 700 (headings), variable font. */
export const fontDisplay = Montserrat({
  subsets: ["cyrillic", "latin", "latin-ext"],
  display: "swap",
  variable: "--font-montserrat",
});

/** Text, captions and buttons: Inter with tabular figures. */
export const fontText = Inter({
  subsets: ["cyrillic", "latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const fontVariables = `${fontDisplay.variable} ${fontText.variable}`;
