"use client";

import { useState, type FormEvent } from "react";
import { signUpAction } from "@/lib/auth/actions";
import { PasswordField } from "./PasswordField";

// Local copy of app/get-started/page.tsx's plain-text Field, kept private to
// this component so the rest of that page (the login form in particular)
// is untouched by this change.
function Field(props: { label: string; name: string; type: string; autoComplete?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{props.label}</span>
      <input
        name={props.name}
        type={props.type}
        autoComplete={props.autoComplete}
        required={props.required}
        className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </label>
  );
}

export function SignupForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Only show the mismatch message once the visitor has actually typed a
  // confirmation (or tried to submit) — not the instant Confirm Password is
  // still empty.
  const mismatch = (submitAttempted || confirmPassword.length > 0) && password !== confirmPassword;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    setSubmitAttempted(true);
    // Block the actual signUpAction submission (server action call) until
    // the two passwords match. signUpAction itself, and every password rule
    // inside it (min length, etc.), is unchanged — this is purely an
    // additional client-side gate in front of it.
    if (password !== confirmPassword) {
      e.preventDefault();
    }
  }

  return (
    <form action={signUpAction} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Full name" name="name" type="text" autoComplete="name" required />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={setPassword}
      />
      <PasswordField
        label="Confirm Password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={mismatch ? "Passwords do not match." : undefined}
      />
      <button
        type="submit"
        className="w-full rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0"
      >
        Create account
      </button>
      <p className="text-center text-xs text-ink-500">
        Can&apos;t find the confirmation email? Check your Spam, Junk, or Promotions folder.
      </p>
    </form>
  );
}
