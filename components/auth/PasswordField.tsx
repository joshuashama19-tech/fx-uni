"use client";

import { useId, useState } from "react";
import { IconEye, IconEyeOff } from "@/components/icons";

/**
 * A password input that's hidden by default with a Show/Hide eye toggle.
 * Controlled (value/onChange) so a parent form can compare "Password" and
 * "Confirm Password" values for a match check. `name` is optional — the
 * signup form's Confirm Password field deliberately omits it so that value
 * never becomes part of the submitted FormData (it only exists to be
 * compared client-side).
 */
type PasswordFieldProps = {
  label: string;
  name?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function PasswordField({
  label,
  name,
  autoComplete,
  required,
  minLength,
  value,
  onChange,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 pr-12 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
