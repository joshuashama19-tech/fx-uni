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

  // Same signOutAction() used by /learn and /account (lib/auth/actions.ts) —
  // a real supabase.auth.signOut() followed by redirect("/login"), not a
  // second/parallel auth mechanism. Rendered in its own block (sidebar
  // footer on desktop, a separate header row on mobile) precisely so it is
  // never in the same flex run as the nav links — that's what was letting it
  // collide with them (e.g. around "Payment Provider") on narrower screens.
  const logoutForm = (
    <form action={signOutAction}>
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900 md:rounded-full md:px-3 md:py-1.5 md:text-center"
      >
        Log out
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-ink-50 md:flex">
      {/* Desktop/tablet: a real sidebar, so nav links never have to compete
          with each other or with Logout for horizontal space, and normal
          desktop widths never need to scroll to see them all. */}
      <aside className="hidden shrink-0 border-r border-ink-100 bg-white md:flex md:w-56 md:flex-col">
        <div className="border-b border-ink-100 px-5 py-4 text-sm font-semibold text-ink-950">FX University Admin</div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-ink-100 px-3 py-3">{logoutForm}</div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile/narrow: Logout gets its own top row, separate from the nav
            row underneath — the two never overlap because they're not in
            the same flex container. The nav row scrolls horizontally on its
            own if it needs to, without pulling Logout along with it. */}
        <header className="border-b border-ink-100 bg-white md:hidden">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm font-semibold text-ink-950">FX University Admin</span>
            <div className="shrink-0">{logoutForm}</div>
          </div>
          <nav className="flex items-center gap-1 overflow-x-auto px-5 pb-3">
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
        </header>
        {children}
      </div>
    </div>
  );
}
