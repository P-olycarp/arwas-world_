"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

const TABS = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const path = usePathname();
  const base = "relative flex min-h-12 flex-none items-center px-4 text-[0.9375rem] font-medium";
  return (
    <nav aria-label="Admin" className="mx-auto max-w-[1100px] overflow-x-auto px-2 [scrollbar-width:none] sm:px-4">
      <ul role="list" className="flex">
        {TABS.map((t) => {
          const active = path === t.href || path.startsWith(t.href + "/");
          return (
            <li key={t.href} className="flex-none">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`${base} ${active ? "font-semibold text-foreground" : "text-muted hover:text-foreground"}`}
              >
                {t.label}
                {active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand" />}
              </Link>
            </li>
          );
        })}
        <li className="flex-none">
          <a href="/" target="_blank" rel="noopener noreferrer" className={`${base} gap-1.5 text-muted hover:text-foreground`}>
            View site
            <ExternalLink size={14} aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}