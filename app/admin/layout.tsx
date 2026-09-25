import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { signOutAction } from "@/lib/auth/actions";

// Shared nav shell for every /admin/* page. requireAdmin() runs here too —
// on top of every individual page and Server Action already calling it
// themselves — purely so an unauthorized request bounces before rendering
// any admin chrome at all. Removing the check from an individual page (or a
// future one that forgets to add it) still fails closed because of this.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/testimonials", label: "Testimonials" },
    { href: "/admin/faqs", label: "FAQs" },
    { href: "/admin/content", label: "Content" },
    { href: "/admin/pricing", label: "Pricing" },
    { href: "/admin/discount-codes", label: "Discount Codes" },
    { href: "/admin/payment-provider", label: "Payment Provider" },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-5 py-3">
          <span className="mr-4 shrink-0 text-sm font-semibold text-ink-950">FX University Admin</span>
          <nav className="flex flex-1 items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {/* Same signOutAction() used by /learn and /account (lib/auth/actions.ts)
              — a real supabase.auth.signOut() followed by redirect("/login"), not a
              second/parallel auth mechanism. Kept visually distinct from the page
              links above (text-only, no pill background) to read as an action
              rather than another destination, matching how /learn's header
              already distinguishes its own Log out button from its nav links. */}
          <form action={signOutAction} className="shrink-0">
            <button
              type="submit"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
