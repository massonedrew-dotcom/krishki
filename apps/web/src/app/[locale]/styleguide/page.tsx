import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/blocks/page-hero";
import { Badge, Button, Checkbox, Field, Input, Section, Select, SpecTable } from "@/components/ui";
import { contrastRatio } from "@/lib/contrast";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "styleguide.meta" });
  return { title: t("title"), description: t("description"), robots: { index: false, follow: false } };
}

const PALETTE = [
  { token: "paper", hex: "#FFFFFF", role: "paper" },
  { token: "mist", hex: "#F5F8FB", role: "mist" },
  { token: "sky", hex: "#EAF4FB", role: "sky" },
  { token: "ink-950", hex: "#0F1B2A", role: "ink950" },
  { token: "ink-500", hex: "#566B80", role: "ink500" },
  { token: "azure-500", hex: "#1E98CC", role: "azure500" },
  { token: "azure-700", hex: "#0E5E9C", role: "azure700" },
  { token: "azure-900", hex: "#0A3F6B", role: "azure900" },
  { token: "red-600", hex: "#D61F29", role: "red600" },
  { token: "gold-500", hex: "#C8962E", role: "gold500" },
  { token: "gold-700", hex: "#7A5A12", role: "gold700" },
] as const;

const PAIRS = [
  ["ink-950", "#0F1B2A", "paper", "#FFFFFF"],
  ["ink-950", "#0F1B2A", "sky", "#EAF4FB"],
  ["ink-500", "#566B80", "paper", "#FFFFFF"],
  ["ink-500", "#566B80", "sky", "#EAF4FB"],
  ["azure-700", "#0E5E9C", "paper", "#FFFFFF"],
  ["azure-700", "#0E5E9C", "sky", "#EAF4FB"],
  ["paper", "#FFFFFF", "red-600", "#D61F29"],
  ["paper", "#FFFFFF", "azure-700", "#0E5E9C"],
  ["#CFE6F5", "#CFE6F5", "azure-700", "#0E5E9C"],
  ["paper", "#FFFFFF", "azure-900", "#0A3F6B"],
  ["gold-700", "#7A5A12", "paper", "#FFFFFF"],
] as const;

const SCALE = [
  { px: 14, cls: "text-14", face: "font-sans" },
  { px: 16, cls: "text-16", face: "font-sans" },
  { px: 18, cls: "text-18", face: "font-sans" },
  { px: 22, cls: "text-22", face: "font-sans" },
  { px: 28, cls: "text-28", face: "font-display font-semibold" },
  { px: 36, cls: "text-36", face: "font-display font-semibold" },
  { px: 48, cls: "text-48", face: "font-display font-semibold" },
  { px: 64, cls: "text-64", face: "font-display font-semibold" },
  { px: 88, cls: "text-88", face: "font-display font-semibold" },
  { px: 120, cls: "text-120", face: "font-display font-semibold" },
] as const;

function level(ratio: number): string {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "fail";
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-x-8 gap-y-10 md:grid-cols-12">
      <h2 id={id} className="min-w-0 text-48 md:col-span-3">
        {title}
      </h2>
      <div className="min-w-0 [overflow-wrap:anywhere] md:col-span-9">{children}</div>
    </div>
  );
}

export default async function StyleguidePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("styleguide");

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lead={t("hero.lead")} />

      <Section tone="white" labelledBy="sg-colour">
        <Block id="sg-colour" title={t("colour.title")}>
          <table className="spec">
            <caption className="spec__caption caption">{t("colour.caption")}</caption>
            <thead>
              <tr>
                <th scope="col">{t("colour.columns.swatch")}</th>
                <th scope="col">{t("colour.columns.token")}</th>
                <th scope="col">{t("colour.columns.role")}</th>
              </tr>
            </thead>
            <tbody>
              {PALETTE.map((c) => (
                <tr key={c.token}>
                  <td className="w-24">
                    <span
                      aria-hidden="true"
                      className="block h-9 w-16 rounded-ui border border-sky-line"
                      style={{ background: c.hex }}
                    />
                  </td>
                  <th scope="row" className="tnum">
                    {c.token} <span className="caption block">{c.hex}</span>
                  </th>
                  <td className="font-normal">{t(`colour.roles.${c.role}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="spec mt-12">
            <caption className="spec__caption caption">{t("colour.pairsTitle")}</caption>
            <thead>
              <tr>
                <th scope="col">{t("colour.pairColumns.pair")}</th>
                <th scope="col">{t("colour.pairColumns.ratio")}</th>
                <th scope="col">{t("colour.pairColumns.level")}</th>
              </tr>
            </thead>
            <tbody>
              {PAIRS.map(([fg, fgHex, bg, bgHex]) => {
                const r = contrastRatio(fgHex, bgHex);
                return (
                  <tr key={`${fg}-${bg}`}>
                    <th scope="row">
                      <span
                        className="inline-flex min-h-9 items-center rounded-ui px-3 font-semibold"
                        style={{ color: fgHex, background: bgHex, border: "1px solid var(--sky-line)" }}
                      >
                        {fg} / {bg}
                      </span>
                    </th>
                    <td className="tnum">{r.toFixed(2)}</td>
                    <td>{level(r)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Block>
      </Section>

      <Section tone="mist" labelledBy="sg-type">
        <Block id="sg-type" title={t("type.title")}>
          <p className="max-w-none text-18 text-ink-700">{t("type.lead")}</p>
          <p className="mt-8 font-display text-64 font-semibold leading-none sm:text-88">{t("type.display")}</p>
          <p className="mt-6 font-display text-36 font-semibold">{t("type.heading")}</p>
          <p className="mt-4 text-18">{t("type.body")}</p>
          <p className="caption mt-4">{t("type.caption")}</p>
          <p className="mt-4 font-display text-28 font-semibold" lang="uz">
            {t("type.uzbek")}
          </p>
          <ul className="mt-10 border-t border-line">
            {SCALE.map((s) => (
              <li key={s.px} className="flex max-w-none items-baseline gap-6 border-b border-line py-3">
                <span className="caption tnum w-14 shrink-0">{s.px}</span>
                <span className={`${s.cls} ${s.face} truncate`}>{t("type.heading")}</span>
              </li>
            ))}
          </ul>
        </Block>
      </Section>

      <Section tone="white" labelledBy="sg-controls">
        <Block id="sg-controls" title={t("controls.title")}>
          <div className="flex flex-wrap items-center gap-4">
            <Button>{t("controls.primary")}</Button>
            <Button forcedState="hover">{t("controls.primary")}</Button>
            <Button variant="secondary">{t("controls.secondary")}</Button>
            <Button variant="ghost">{t("controls.ghost")}</Button>
            <Button loading>{t("controls.loading")}</Button>
            <Button disabled>{t("controls.primary")}</Button>
            <Badge>СКО I-82</Badge>
            <Badge tone="solid">ЭЖК</Badge>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Field label={t("controls.label")} hint={t("controls.hint")}>
              {(c) => <Input {...c} />}
            </Field>
            <Field label={t("controls.label")} error={t("controls.error")} required>
              {(c) => <Input {...c} />}
            </Field>
            <Field label={t("controls.label")}>
              {(c) => (
                <Select {...c} defaultValue="a">
                  <option value="a">{t("controls.primary")}</option>
                  <option value="b">{t("controls.secondary")}</option>
                </Select>
              )}
            </Field>
            <Checkbox label={t("controls.check")} defaultChecked />
          </div>
          <p className="caption mt-8 max-w-none">{t("controls.radius")}</p>
        </Block>
      </Section>

      <Section tone="sky" labelledBy="sg-table">
        <Block id="sg-table" title={t("table.title")}>
          <div className="rounded-card bg-paper p-5 md:p-8">
            <SpecTable
              caption={t("table.caption")}
              columns={{ parameter: t("table.columns.param"), values: [t("table.columns.value")] }}
              rows={(["metal", "thickness", "moq"] as const).map((k) => ({
                label: t(`table.rows.${k}.l`),
                values: [t(`table.rows.${k}.v`)],
              }))}
            />
          </div>
        </Block>
      </Section>

      <section className="surface-azure grain py-[var(--section-y)]" aria-labelledby="sg-motion">
        <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--page-x)]">
          <Block id="sg-motion" title={t("motion.title")}>
            <p className="max-w-none text-22">{t("motion.text")}</p>
          </Block>
        </div>
      </section>
    </>
  );
}
