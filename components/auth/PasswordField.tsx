"use client";

import { useId, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { IconEye, IconEyeOff } from "@/components/icons";

/**
 * A password input that's hidden by default with a Show/Hide eye toggle.
 * Works two ways:
 *   - Controlled (pass both `value` and `onChange`) — used by SignupForm so
 *     it can compare "Password" and "Confirm Password" for a match check.
 *   - Uncontrolled (omit both) — used by the plain Login forms, which have
 *     no need to read the value in JS; the browser handles it natively via
 *     `name`, exactly like the plain <input> each one replaces.
 * `name` is optional — the signup form's Confirm Password field
 * deliberately omits it so that value never becomes part of the submitted
 * FormData (it only exists to be compared client-side).
 *
 * Props extend InputHTMLAttributes<HTMLInputElement> so this accepts any
 * standard <input> prop (autoComplete, required, minLength, name,
 * placeholder, disabled, ...) exactly like the plain <input> it replaces —
 * rather than re-declaring each one by hand and risking a caller passing a
 * standard attribute this component doesn't yet know about. `id`, `type`,
 * `value`, and `onChange` are owned by this component (id/type internally;
 * value/onChange use the custom controlled/uncontrolled contract above) and
 * are excluded from the pass-through props.
 */
type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "value" | "onChange"> & {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
};

export function PasswordField({ label, value, onChange, error, className, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  // Only apply React's controlled-input props when a value was actually
  // passed in — spreading these conditionally keeps the uncontrolled case
  // (Login) a normal uncontrolled <input>, avoiding React's "a component is
  // changing an uncontrolled input to be controlled" warning.
  const controlledProps =
    value !== undefined ? { value, onChange: (e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) } : {};

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          type={visible ? "text" : "password"}
          {...controlledProps}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-lg border border-ink-200 bg-white px-4 py-3 pr-12 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${className ?? ""}`}
        />
        {/* type="button" keeps this from ever submitting the form; the
            w-11 (44px) hit area spanning the input's full height keeps it
            comfortable to tap on mobile. */}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-400 transition-colors hover:text-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/40"
        >
          {visible ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-brand-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
