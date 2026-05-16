"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SHOW_DELAY_MS = 200;
const NAV_HOLD_MS = 350;
const COLD_START_BANNER_MS = 2_000;

/**
 * Top-of-viewport thin progress bar + delayed cold-start banner that
 * surfaces in-flight backend activity. The Render free tier and Vercel
 * cold starts make per-call latency visible to the user — without
 * feedback they can't tell whether the app is wedged or just waiting.
 *
 * Bar sources:
 * - TanStack Query `useIsFetching()` / `useIsMutating()`.
 * - Route navigation rising edge (held `NAV_HOLD_MS`).
 * Bar visibility is debounced by `SHOW_DELAY_MS` so fast (<200ms)
 * responses don't flash.
 *
 * Cold-start banner: if backend activity stays in-flight beyond
 * `COLD_START_BANNER_MS` (2s), surface a polite explanation that
 * Render is probably waking up. Auto-dismisses when activity ends.
 *
 * A11y: `role="status"` + `aria-live="polite"` on both elements so
 * screen readers announce the state change without disrupting focus.
 * The bar respects `prefers-reduced-motion` (animation pauses).
 *
 * State writes inside effects are deferred via `setTimeout(0)` so
 * React 19's `react-hooks/set-state-in-effect` rule (cascading-render
 * guard) doesn't flag the legitimate debounce.
 */
export function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const networkActive = isFetching > 0 || isMutating > 0;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navActive, setNavActive] = useState(false);

  useEffect(() => {
    const onStart = setTimeout(() => setNavActive(true), 0);
    const onEnd = setTimeout(() => setNavActive(false), NAV_HOLD_MS);
    return () => {
      clearTimeout(onStart);
      clearTimeout(onEnd);
    };
  }, [pathname, searchParams]);

  const active = networkActive || navActive;
  const [visible, setVisible] = useState(false);
  const [coldStart, setColdStart] = useState(false);

  useEffect(() => {
    const t = setTimeout(
      () => setVisible(active),
      active ? SHOW_DELAY_MS : 0,
    );
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (!networkActive) {
      const t = setTimeout(() => setColdStart(false), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setColdStart(true), COLD_START_BANNER_MS);
    return () => clearTimeout(t);
  }, [networkActive]);

  return (
    <>
      {visible ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading"
          aria-busy="true"
          data-testid="global-loading-indicator"
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-primary/10"
        >
          <span className="absolute inset-y-0 -left-1/3 w-1/3 animate-global-progress motion-reduce:animate-none motion-reduce:left-0 motion-reduce:w-full bg-primary" />
          <span className="sr-only">Loading…</span>
        </div>
      ) : null}
      {coldStart ? (
        <div
          role="status"
          aria-live="polite"
          data-testid="cold-start-banner"
          className="pointer-events-auto fixed inset-x-0 top-1 z-[101] mx-auto flex max-w-md items-center justify-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-high/95 px-4 py-2 text-xs font-medium text-on-surface shadow-lg backdrop-blur"
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined animate-spin motion-reduce:animate-none text-base text-primary"
          >
            cached
          </span>
          <span>
            The server may be waking up. This can take a few seconds.
          </span>
        </div>
      ) : null}
    </>
  );
}
