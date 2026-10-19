"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";

const DIRECTIONS = ["wholesale", "export", "privateLabel", "retail", "lithography"] as const;
const PRODUCTS = ["sko", "twist", "ring", "services", "unsure"] as const;

export type LeadFormProps = {
  defaultDirection?: (typeof DIRECTIONS)[number];
  defaultProduct?: (typeof PRODUCTS)[number];
};

/**
 * Lead form shell (task 4). UI only: validation is the browser's, and nothing is sent yet.
 * TODO(task 9): POST to the API, honeypot, rate-limit errors, success state from the API.
 */
export function LeadForm({ defaultDirection, defaultProduct }: LeadFormProps) {
  const t = useTranslations("form");
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [direction, setDirection] = useState<string>(defaultDirection ?? "");
  const [product, setProduct] = useState<string>(defaultProduct ?? "");

  // Preset from the link that brought the visitor here: /contacts?direction=wholesale&product=sko#lead-form
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d = q.get("direction");
    const p = q.get("product");
    if (d && (DIRECTIONS as readonly string[]).includes(d)) setDirection(d);
    if (p && (PRODUCTS as readonly string[]).includes(p)) setProduct(p);
  }, []);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
  }

  const req = t("required");

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2" aria-describedby="lead-form-status">
      <Field label={t("name")} required requiredLabel={req}>
        {(c) => <Input {...c} name="name" autoComplete="name" />}
      </Field>
      <Field label={t("phone")} required requiredLabel={req}>
        {(c) => <Input {...c} name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+998" />}
      </Field>
      <Field label={t("company")}>{(c) => <Input {...c} name="company" autoComplete="organization" />}</Field>
      <Field label={t("country")}>{(c) => <Input {...c} name="country" autoComplete="country-name" />}</Field>
      <Field label={t("direction")} required requiredLabel={req}>
        {(c) => (
          <Select {...c} name="direction" value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="" disabled>
              {t("choose")}
            </option>
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>
                {t(`directions.${d}`)}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label={t("product")}>
        {(c) => (
          <Select {...c} name="product" value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="" disabled>
              {t("choose")}
            </option>
            {PRODUCTS.map((p) => (
              <option key={p} value={p}>
                {t(`products.${p}`)}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <div className="md:col-span-2">
        <Field label={t("message")} hint={t("messageHint")}>
          {(c) => <Textarea {...c} name="message" rows={4} />}
        </Field>
      </div>
      <div className="md:col-span-2">
        <Checkbox
          name="consent"
          required
          label={
            <>
              {t("consent")}{" "}
              <Link href="/privacy" className="link">
                {t("consentLink")}
              </Link>
            </>
          }
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <Button type="submit" size="lg">
          {t("submit")}
        </Button>
        <p id="lead-form-status" role="status" className="max-w-none text-14 text-fg-muted">
          {status === "pending" ? t("pending") : t("note")}
        </p>
      </div>
    </form>
  );
}
