import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

// Dev-only root layout for the living-background demo (ticket 26). Lives outside [locale] on purpose.
export const metadata: Metadata = { title: "Living background demo", robots: { index: false, follow: false } };

export default function BgDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
