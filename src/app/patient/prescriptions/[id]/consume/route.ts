import { isRedirectError } from "next/dist/client/components/redirect-error";
import { NextResponse } from "next/server";
import { getAuth, serverApiRequest } from "@/lib/auth/server";

/**
 * Patient-only "mark as consumed" form-action endpoint.
 *
 * Why this is a Route Handler and not a client-side mutation:
 *   The detail page renders a <form action={routes.patient.consume(id)}> so
 *   that the consume action survives JS-disabled environments and progressive
 *   enhancement is preserved. The browser POSTs form-urlencoded data here,
 *   we forward the user's cookies to the backend PATCH endpoint, then
 *   redirect back to the detail page (or the list on failure).
 *
 * Why we don't use `requireRole(...)` here:
 *   `requireRole` calls `redirect("/login")` via `next/navigation`. That throws
 *   a special `NEXT_REDIRECT` digest error. In Route Handlers, when wrapped
 *   in `try/catch`, the framework's response interceptor still rewrites the
 *   response to the original redirect target — meaning a failed auth check
 *   in `requireRole` overrides our custom catch and the browser ends up on
 *   `/login` even though we returned `NextResponse.redirect(consumeError)`.
 *   Caused E2E test `patient.spec.ts:106` to fail across runs #25911574929
 *   → #25931379743. Use explicit auth check + explicit `NextResponse.redirect`
 *   so every redirect path is under our control.
 *
 *   We re-throw any genuine `redirect()` from nested calls via `isRedirectError`
 *   so framework-initiated redirects still work (defensive).
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const detailUrl = new URL(`/patient/prescriptions/${id}`, request.url);
  const errorListUrl = new URL(
    "/patient/prescriptions?consumeError=1",
    request.url,
  );
  const loginUrl = new URL("/login", request.url);

  // Explicit auth check — no `redirect()` to fight with.
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.redirect(loginUrl, { status: 303 });
  }
  if (auth.role !== "PATIENT") {
    return NextResponse.redirect(errorListUrl, { status: 303 });
  }

  try {
    let reason: string | undefined;
    const contentType = request.headers.get("content-type") ?? "";
    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await request.formData();
      const raw = form.get("reason");
      if (typeof raw === "string" && raw.trim().length > 0) {
        reason = raw.trim().slice(0, 500);
      }
    }

    await serverApiRequest({
      url: `/prescriptions/${id}/consume`,
      method: "PATCH",
      data: reason ? { reason } : {},
    });

    detailUrl.searchParams.set("consumed", "1");
    return NextResponse.redirect(detailUrl, { status: 303 });
  } catch (err) {
    // Let framework-issued NEXT_REDIRECT digests through unmodified (defensive
    // — `getAuth` swallows redirects already, but downstream code may not).
    if (isRedirectError(err)) {
      throw err;
    }
    return NextResponse.redirect(errorListUrl, { status: 303 });
  }
}
