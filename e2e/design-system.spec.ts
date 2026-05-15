import { test, expect } from "./fixtures";
import type { SeededRole } from "./data";

test.describe("RX-OS design-system invariants", () => {
  test("login page renders glyphs (not literal Material Symbols ligature names)", async ({
    page,
  }) => {
    await page.goto("/login");
    const icons = page.locator(".material-symbols-outlined");
    const count = await icons.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const fontFamilies = await icons.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el as HTMLElement).fontFamily),
    );
    for (const family of fontFamilies) {
      expect(family).toMatch(/Material Symbols Outlined/i);
    }
  });

  for (const [role, paths] of [
    ["admin", ["/admin/metrics"]],
    ["doctor", ["/doctor/prescriptions", "/doctor/prescriptions/new"]],
    ["patient", ["/patient/prescriptions"]],
  ] as const) {
    test(`${role} pages keep Material Symbols + tabular nums + glass surfaces`, async ({
      loginAs,
      page,
    }) => {
      await loginAs(role as SeededRole);
      for (const path of paths) {
        await page.goto(path);
        await expect(page).toHaveURL(new RegExp(`${path}$`));

        const icons = page.locator(".material-symbols-outlined");
        if ((await icons.count()) > 0) {
          const family = await icons
            .first()
            .evaluate((el) => getComputedStyle(el).fontFamily);
          expect(family).toMatch(/Material Symbols Outlined/i);
        }

        const tabularEls = page.locator(".tabular-nums");
        if ((await tabularEls.count()) > 0) {
          const variant = await tabularEls
            .first()
            .evaluate((el) => getComputedStyle(el).fontVariantNumeric);
          expect(variant).toContain("tabular-nums");
        }

        // Glass surface contract: visible elements with the glass class plus a
        // computed backdrop-filter blur on at least one of them. The CSSOM
        // declaration check is unreliable because Next 16's lightningcss
        // emits the rule inside @supports, which Chromium hides from the
        // top-level rule iteration — but the computed style on the element
        // IS the source of truth for what the user sees.
        const glassEls = page.locator(".card-glass, .glass-panel");
        const glassCount = await glassEls.count();
        if (glassCount > 0) {
          await expect(glassEls.first()).toBeVisible();
          const filters = await glassEls.evaluateAll((els) =>
            els.map((el) => {
              const cs = getComputedStyle(el);
              return (
                cs.backdropFilter ||
                (cs as CSSStyleDeclaration & { webkitBackdropFilter?: string })
                  .webkitBackdropFilter ||
                ""
              );
            }),
          );
          expect(
            filters.some((f) => f.includes("blur")),
            `${path}: at least one glass element must apply backdrop-filter blur (got ${JSON.stringify(filters)})`,
          ).toBe(true);
        }
      }
    });
  }

  test("status badges are monochrome (no green/red hues)", async ({
    loginAs,
    page,
  }) => {
    await loginAs("doctor");
    // PrescriptionStatusBadge is rendered in both the mobile card variant
    // (md:hidden) and the desktop TableRow (hidden md:block). At the test
    // viewport (1280×800) the mobile copies are present in the DOM but
    // visually hidden — scope to visible nodes so the color audit runs on
    // the badges the user actually sees.
    const badges = page.locator('[data-testid="status-badge"]:visible');
    await expect(badges.first()).toBeVisible();
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i += 1) {
      const color = await badges
        .nth(i)
        .evaluate((el) => getComputedStyle(el).color);
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      expect(match, `unexpected color format ${color}`).not.toBeNull();
      const [r, g, b] = [
        Number(match![1]),
        Number(match![2]),
        Number(match![3]),
      ];
      const greenDominant = g > r + 30 && g > b + 30;
      const redDominant = r > g + 30 && r > b + 30;
      expect(greenDominant, `badge ${i} is green-dominant: ${color}`).toBe(
        false,
      );
      expect(redDominant, `badge ${i} is red-dominant: ${color}`).toBe(false);
    }
  });

  test("SSR hydration: sidebar shows user email after a hard reload", async ({
    loginAs,
    page,
  }) => {
    const profile = await loginAs("patient");
    await page.reload();
    await expect(page.getByTestId("sidebar-user-email")).toHaveText(
      profile.email,
    );
    await expect(page.getByTestId("sidebar-user-role")).toHaveText(
      profile.role,
    );
  });
});
