"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/icons/AppIcon";

const LABELS: Record<string, string> = {
  admin: "Admin",
  doctor: "Doctor",
  patient: "Patient",
  metrics: "Metrics",
  users: "Users",
  doctors: "Doctors",
  patients: "Patients",
  prescriptions: "Prescriptions",
  profile: "Profile",
  analytics: "Analytics",
  new: "New",
};

function toLabel(segment: string) {
  return LABELS[segment] ?? segment.replace(/-/g, " ");
}

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  const crumbs = segments.map((segment, idx) => ({
    segment,
    href: `/${segments.slice(0, idx + 1).join("/")}`,
    isLast: idx === segments.length - 1,
  }));
  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden md:flex items-center gap-1.5 text-xs text-on-surface-variant"
    >
      <Link
        href="/"
        aria-label="Home"
        className="hover:text-on-surface transition-colors inline-flex items-center"
      >
        <AppIcon name="home" size="xs" />
      </Link>
      {crumbs.map(({ segment, href, isLast }) => {
        return (
          <span key={href} className="inline-flex items-center gap-1.5">
            <AppIcon
              name="chevronRight"
              size="xs"
              className="text-on-surface-variant/60"
            />
            {isLast ? (
              <span className="capitalize text-on-surface font-medium">
                {toLabel(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="capitalize hover:text-on-surface transition-colors"
              >
                {toLabel(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
