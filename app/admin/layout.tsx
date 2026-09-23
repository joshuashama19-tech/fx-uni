import Link from "next/link";
import { requireAdmin } from "@/lib/access";

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
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-5 py-3">
          <span className="mr-4 shrink-0 text-sm font-semibold text-ink-950">FX University Admin</span>
          <nav className="flex gap-1">
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
        </div>
      </header>
      {children}
    </div>
  );
}
