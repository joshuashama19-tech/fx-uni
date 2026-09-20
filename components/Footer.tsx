import Link from "next/link";
import { footer, siteConfig } from "@/lib/course-data";
import { Container } from "./ui/Container";
import { IconMail } from "./icons";

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950 text-ink-300">
      <Container className="py-14 sm:py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="#top" className="flex items-center gap-2 font-semibold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-ink-950">
                {siteConfig.shortName.slice(0, 2)}
              </span>
              <span>{siteConfig.name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">{siteConfig.tagline}</p>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink-300 hover:text-white"
            >
              <IconMail className="h-4 w-4" />
              {siteConfig.supportEmail}
            </a>
          </div>

          {footer.columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-white">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-400 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ink-800 pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-ink-500">{footer.disclaimerNote}</p>
          <p className="mt-4 text-xs text-ink-600">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
