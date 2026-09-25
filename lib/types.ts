// Hand-written row types for the tables in supabase/migrations/0001_init.sql.
// (No `supabase gen types` codegen dependency — these are kept in sync by
// hand with the migration, which is the single source of truth for the
// actual schema.)

export type OrderStatus = "pending" | "successful" | "failed" | "cancelled" | "refunded" | "disputed";
export type CourseAccessStatus = "active" | "revoked";

// Added in supabase/migrations/0011_payment_provider.sql. Which payment
// provider's API was used to initialize/verify a given order — see
// lib/payments/provider.ts (the one place that decides which provider a
// NEW checkout uses) and lib/payments/access-activation.ts (which reads an
// existing order's own payment_provider to know which provider's verify
// API to re-check against, so provider selection is never re-derived or
// guessed after the fact).
export type PaymentProvider = "paystack" | "korapay";

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
}
