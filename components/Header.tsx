"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nav, siteConfig } from "@/lib/course-data";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { IconChevronDown, IconMenu, IconX } from "./icons";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-200 ${
        scrolled ? "border-ink-100 bg-white/90 backdrop-blur" : "border-transparent bg-white"
      }`}
    >
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link href="#top" className="flex items-center gap-2 font-semibold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-950 text-sm font-bold text-brand-300">
            {siteConfig.shortName.slice(0, 2)}
          </span>
          <span className="text-base sm:text-lg">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-600 transition hover:text-ink-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href={nav.ctaHref} size="md">
            {nav.ctaLabel}
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-ink-700 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-ink-100 bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {nav.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-ink-700 hover:bg-ink-50"
              >
                {link.label}
                <IconChevronDown className="h-4 w-4 -rotate-90 text-ink-300" />
              </Link>
            ))}
            <Button href={nav.ctaHref} size="lg" className="mt-3 w-full" onClick={() => setOpen(false)}>
              {nav.ctaLabel}
            </Button>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
