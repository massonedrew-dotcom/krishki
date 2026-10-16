import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import type { ForcedState } from "./button";

export type ControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: boolean;
};

type FieldProps = {
  label: string;
  hint?: string;
  /** Error text. Names the problem and the recovery. Presence sets aria-invalid on the control. */
  error?: string;
  required?: boolean;
  /** Text read by screen readers after the label of a required field, e.g. "(required)". */
  requiredLabel?: string;
  children: (control: ControlProps) => ReactNode;
};

/** Label + control + hint + error, wired with htmlFor and aria-describedby. */
export function Field({ label, hint, error, required, requiredLabel, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? (
          <span className="field__req" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
        {required && requiredLabel ? <span className="sr-only"> {requiredLabel}</span> : null}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        required,
      })}
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type WithForced = { forcedState?: ForcedState };

export function Input({ forcedState, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & WithForced) {
  return <input {...rest} className={cx("control", className)} data-state={forcedState} />;
}

export function Textarea({
  forcedState,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & WithForced) {
  return <textarea {...rest} className={cx("control", className)} data-state={forcedState} />;
}

export function Select({
  forcedState,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & WithForced) {
  return (
    <select {...rest} className={cx("control", className)} data-state={forcedState}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  forcedState,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & WithForced & { label: ReactNode }) {
  return (
    <label className="check">
      <input {...rest} type="checkbox" className="check__box" data-state={forcedState} />
      <span className="check__label">{label}</span>
    </label>
  );
}
