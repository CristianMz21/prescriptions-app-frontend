"use client";

import type { Role } from "@/lib/api/generated/schemas";
import { navigationByRole } from "@/lib/nav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RoleNav } from "./RoleNav";
import { useAuth } from "@/lib/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { AppIcon } from "@/components/icons/AppIcon";

interface MobileTopBarProps {
  role: Role;
}

export function MobileTopBar({ role }: MobileTopBarProps) {
  const { user, logout } = useAuth();
  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 border-b border-outline-variant/30 bg-surface-container-lowest/90 backdrop-blur">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Open navigation"
            >
              <AppIcon name="menu" size="sm" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-72 p-0 flex flex-col gap-0">
          <SheetHeader className="px-6 py-4 border-b border-outline-variant/30">
            <SheetTitle className="text-2xl font-bold text-primary uppercase tracking-widest">
              RX-OS
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 py-4">
            <RoleNav items={navigationByRole[role]} />
          </div>
          <div className="px-6 pt-4 pb-6 border-t border-outline-variant/30 flex flex-col gap-3">
            {user ? (
              <div className="flex flex-col gap-0.5 mb-2">
                <span className="text-sm font-bold text-primary truncate">
                  {user.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest border border-outline-variant/30 px-1.5 rounded">
                    {user.role}
                  </span>
                  <span className="text-[0.65rem] text-on-surface-variant truncate font-mono">
                    {user.email}
                  </span>
                </div>
              </div>
            ) : null}
            {user ? <ThemeToggle initial={user.themePreference} /> : null}
            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center gap-3 py-2 text-on-surface-variant hover:text-on-surface transition-colors w-full text-left text-sm font-medium"
            >
              <AppIcon name="logOut" size="md" />
              Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
      <span className="text-base font-bold text-primary uppercase tracking-widest">
        RX-OS
      </span>
      <div className="w-8" />
    </header>
  );
}
