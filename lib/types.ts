// Hand-written row types for the tables in supabase/migrations/0001_init.sql.
// (No `supabase gen types` codegen dependency — these are kept in sync by
// hand with the migration, which is the single source of truth for the
// actual schema.)

export type OrderStatus = "pending" | "successful" | "failed" | "cancelled" | "refunded" | "disputed";
export type CourseAccessStatus = "active" | "revoked";

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
