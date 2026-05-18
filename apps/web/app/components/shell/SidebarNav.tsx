"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarNavItem = {
  href: string;
  icon?: string;
  label: string;
};

type SidebarNavProps = {
  activeClassName: string;
  ariaLabel: string;
  className: string;
  itemClassName: string;
  items: readonly SidebarNavItem[];
  rootHref: string;
};

export function SidebarNav({
  activeClassName,
  ariaLabel,
  className,
  itemClassName,
  items,
  rootHref
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel} className={className}>
      {items.map((item) => {
        const active = isActive(pathname, item.href, rootHref);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`${itemClassName} ${active ? activeClassName : ""}`}
            href={item.href}
            key={item.href}
          >
            <span aria-hidden="true">{item.icon ?? "□"}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function isActive(pathname: string, href: string, rootHref: string) {
  if (href === rootHref) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
