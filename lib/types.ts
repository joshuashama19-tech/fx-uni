// Hand-written row types for the tables in supabase/migrations/0001_init.sql.
// (No `supabase gen types` codegen dependency — these are kept in sync by
// hand with the migration, which is the single source of truth for the
// actual schema.)

export type OrderStatus = "pending" | "successful" | "failed" | "cancelled" | "refunded" | "disputed";
export type CourseAccessStatus = "active" | "revoked";

// Added in supabase/migrations/0011_payment_provider.sql (paystack/korapay),
// 0013_test_mode.sql ('test'), and 0014_nowpayments.sql ('nowpayments').
// Which payment provider's API was used to initialize/verify a given order
// — see lib/payments/provider.ts (the one place that decides which LOCAL
// provider a new checkout uses — resolvePaymentProvider() never returns
// 'test' or 'nowpayments') and lib/payments/access-activation.ts (which
// reads an existing order's own payment_provider to know which provider's
// verify API to re-check against, so provider selection is never re-derived
// or guessed after the fact). 'test' is decided directly from the acting
// user's own profiles.is_test in lib/payments/checkout-action.ts, before any
// provider resolution ever runs — see lib/payments/test-provider.ts.
// 'nowpayments' is decided from the student's payment-method selection at
// checkout, re-validated server-side against
// lib/payments/provider.ts's resolveCheckoutMethodSettings() — see
// lib/payments/nowpayments.ts.
export type PaymentProvider = "paystack" | "korapay" | "test" | "nowpayments";

// Added in supabase/migrations/0014_nowpayments.sql. Which payment-method
// card the student picked on /get-started: 'local' (whatever
// payment_settings.active_provider currently is) or 'crypto' (NOWPayments).
// This is a separate axis from PaymentProvider — 'local' resolves to
// 'paystack'/'korapay' via resolvePaymentProvider(), never a value stored
// anywhere by itself. See lib/payments/provider.ts's
// resolveCheckoutMethodSettings() and lib/payments/checkout-action.ts.
export type CheckoutMethod = "local" | "crypto";

// The outcome a test account chose on the in-app simulated checkout page
// (app/get-started/test-checkout). See supabase/migrations/0013_test_mode.sql's
// test_payment_simulations table and lib/payments/test-provider.ts.
export type TestPaymentOutcome = "success" | "failed" | "cancelled";

// Added in supabase/migrations/0012_payment_provider_settings.sql. Which
// Vercel deployment environment a payment_settings row (and the running
// server itself, via lib/payments/provider.ts's resolvePaymentEnvironment())
// belongs to. Preview and Production share one Supabase database, so this
// is what keeps their active-provider settings from being the same row —
// see that migration's file header.
export type PaymentEnvironment = "production" | "preview";

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  // Added in supabase/migrations/0013_test_mode.sql. True only for a
  // dedicated test account created via the admin-only "create test account"
  // action — see lib/admin/test-mode-actions.ts. Pinned against the
  // authenticated role the same way is_admin is (prevent_self_admin_grant()).
  is_test: boolean;
}

export interface OrderRow {
  id: string;
  user_id: string;
  course_id: string;
  amount_minor_units: number;
  currency: string;
  status: OrderStatus;
  paystack_reference: string;
  paystack_authorization_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Added in supabase/migrations/0010_discount_codes.sql. discount_code_id
  // is null when no discount was applied. base_amount_minor_units is the
  // server-resolved price before any discount; amount_minor_units keeps its
  // original meaning (the actual charged/verified amount) unchanged —
  // base_amount_minor_units - discount_amount_minor_units = amount_minor_units.
  discount_code_id: string | null;
  discount_code: string | null;
  discount_amount_minor_units: number;
  base_amount_minor_units: number;
  // Added in supabase/migrations/0011_payment_provider.sql. Backfilled to
  // 'paystack' for every order that existed before this column did, so
  // existing Paystack orders keep working with no other change.
  payment_provider: PaymentProvider;
  // Added in supabase/migrations/0013_test_mode.sql. Copied from the
  // acting user's own profiles.is_test at checkout-initiation time — never
  // client input. See lib/payments/checkout-action.ts.
  is_test: boolean;
  // Added in supabase/migrations/0014_nowpayments.sql. Set only when
  // payment_provider = 'nowpayments' — see lib/payments/nowpayments.ts and
  // lib/types.ts's own PaymentProvider comment above.
  nowpayments_payment_id: string | null;
  pay_currency: string | null;
}

export interface CourseAccessRow {
  id: string;
  user_id: string;
  course_id: string;
  status: CourseAccessStatus;
  order_id: string | null;
  granted_at: string;
  revoked_at: string | null;
  granted_by: string | null;
  notes: string | null;
  // Added in supabase/migrations/0013_test_mode.sql. Copied from the
  // granting order's own is_test in grantCourseAccess()
  // (lib/payments/access-activation.ts), which additionally cross-checks it
  // against the user's current profiles.is_test before granting at all.
  // lib/access.ts's checkCourseAccessInternal() independently re-checks this
  // against the requesting user's own profiles.is_test on every /learn
  // request.
  is_test: boolean;
}

export interface PaymentEventRow {
  id: string;
  order_id: string | null;
  paystack_reference: string;
  event_type: string;
  dedupe_key: string;
  status: string | null;
  raw_payload: Record<string, unknown>;
  received_at: string;
  // Added in supabase/migrations/0013_test_mode.sql. Copied from the order
  // this event is for at the same insert (lib/payments/access-activation.ts's
  // logPaymentEvent()) — lets this log be filtered without a join.
  is_test: boolean;
}

// Row for the table added in supabase/migrations/0013_test_mode.sql. The
// test counterpart to what Korapay's/Paystack's own hosted checkout + verify
// API provide for a real payment — see lib/payments/test-provider.ts.
export interface TestPaymentSimulationRow {
  reference: string;
  order_id: string;
  outcome: TestPaymentOutcome;
  amount_minor_units: number;
  currency: string;
  simulated_at: string;
  simulated_by: string;
}

// Rows for the tables added in supabase/migrations/0005_admin_cms.sql.

export interface TestimonialRow {
  id: string;
  student_name: string;
  role_title: string | null;
  quote: string;
  display_order: number;
  is_active: boolean;
  is_placeholder: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface SiteContentRow {
  key: string;
  value: string;
  updated_at: string;
  updated_by: string | null;
}

// Row for the table added in supabase/migrations/0009_pricing_promotion.sql.
// Singleton (id always 1) — see lib/pricing.ts for how this becomes the
// current payable price.

export interface PricingSettingsRow {
  id: 1;
  regular_price_minor_units: number;
  currency: string;
  offer_price_minor_units: number | null;
  promotion_active: boolean;
  promotion_title: string;
  promotion_subtext: string | null;
  promotion_starts_at: string | null;
  promotion_ends_at: string | null;
  countdown_enabled: boolean;
  updated_at: string;
  updated_by: string | null;
}

// Row for the table added in supabase/migrations/0012_payment_provider_settings.sql.
// One row per PaymentEnvironment (not a singleton — Preview and Production
// share one Supabase database, so each environment needs its own row to
// keep switching one from ever affecting the other). See
// lib/payments/provider.ts's resolvePaymentProvider() for how the row
// matching the CURRENT server's environment becomes the provider a new
// checkout actually uses. Only ever read/written via the service-role
// client — no RLS policy exists for anon/authenticated — see that
// migration's file header.
export interface PaymentSettingsRow {
  environment: PaymentEnvironment;
  active_provider: PaymentProvider;
  updated_at: string;
  updated_by: string | null;
  // Added in supabase/migrations/0014_nowpayments.sql. A separate axis from
  // active_provider (which controls only the local Paystack/Korapay rail) —
  // see lib/payments/provider.ts's resolveCheckoutMethodSettings().
  crypto_enabled: boolean;
  default_checkout_method: CheckoutMethod;
}

// Rows for the tables added in supabase/migrations/0010_discount_codes.sql.

export type DiscountType = "percentage" | "fixed";

export interface DiscountCodeRow {
  id: string;
  code: string;
  discount_type: DiscountType;
  // percentage: whole percent 1-100. fixed: minor units (kobo), same
  // convention as orders.amount_minor_units.
  discount_value: number;
  max_uses: number | null;
  max_uses_per_customer: number | null;
  usage_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface DiscountCodeRedemptionRow {
  id: string;
  discount_code_id: string;
  user_id: string;
  order_id: string;
  code: string;
  discount_amount: number;
  created_at: string;
  // Added in supabase/migrations/0013_test_mode.sql. Copied from the order
  // this redemption is for. apply_discount_redemption() never increments
  // discount_codes.usage_count when this is true — see that migration's
  // header for the full discount-code isolation design.
  is_test: boolean;
}
