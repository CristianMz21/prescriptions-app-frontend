"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface RoleNavProps {
  items: NavItem[];
}

export function RoleNav({ items }: RoleNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 flex flex-col gap-1 px-2">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 pl-4 py-2 rounded transition-colors",
              isActive
                ? "text-primary font-bold border-l-2 border-primary bg-surface-container-high/50 scale-95"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30",
            )}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
