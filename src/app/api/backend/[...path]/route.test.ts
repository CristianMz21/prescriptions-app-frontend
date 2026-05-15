/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type NextRequest } from "next/server";

const BACKEND_BASE = "https://prescriptions-app-backend.onrender.com";

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", BACKEND_BASE);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

function makeRequest(opts: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
}): NextRequest {
  const url = opts.url ?? "http://localhost:3001/api/backend/auth/login";
  const init: RequestInit = {
    method: opts.method ?? "POST",
    headers: opts.headers ?? {},
    body: opts.body,
  };
  // Inject the Next.js-internal nextUrl shape that NextRequest exposes.
  const req = new Request(url, init) as Request & { nextUrl: URL };
  Object.defineProperty(req, "nextUrl", {
    value: new URL(url),
    configurable: true,
  });
  return req as unknown as NextRequest;
}

function makeUpstream(opts: {
  status?: number;
  setCookies?: string[];
  body?: string;
}): Response {
  const headers = new Headers();
  for (const sc of opts.setCookies ?? []) headers.append("set-cookie", sc);
  headers.set("content-type", "application/json");
  return new Response(opts.body ?? "{}", {
    status: opts.status ?? 200,
    headers,
  });
}

describe("rewriteCookiePath", () => {
  it("rewrites a sub-path attribute to live under /api/backend", async () => {
    const { rewriteCookiePath } = await import("./route");
    const input =
      "refreshToken=abc; Max-Age=604800; Path=/auth/refresh; HttpOnly; SameSite=Lax";
    expect(rewriteCookiePath(input)).toBe(
      "refreshToken=abc; Max-Age=604800; Path=/api/backend/auth/refresh; HttpOnly; SameSite=Lax",
    );
  });

  it("leaves Path=/ alone (root-scoped cookies stay visible to SSR)", async () => {
    const { rewriteCookiePath } = await import("./route");
    const input = "accessToken=xyz; Path=/; HttpOnly; SameSite=Lax";
    expect(rewriteCookiePath(input)).toBe(input);
  });

  it("does not double-prefix a cookie already scoped to the proxy path", async () => {
    const { rewriteCookiePath } = await import("./route");
    const input =
      "refreshToken=abc; Path=/api/backend/auth/refresh; HttpOnly; SameSite=Lax";
    expect(rewriteCookiePath(input)).toBe(input);
  });

  it("returns the cookie unchanged when no Path attribute is present", async () => {
    const { rewriteCookiePath } = await import("./route");
    const input = "session=abc; HttpOnly; SameSite=Lax";
    expect(rewriteCookiePath(input)).toBe(input);
  });
});

describe("proxy route handler", () => {
  it("forwards Set-Cookie back with refresh cookie path rewritten", async () => {
    fetchMock.mockResolvedValueOnce(
      makeUpstream({
        status: 201,
        setCookies: [
          "accessToken=A; Max-Age=900; Path=/; HttpOnly; SameSite=Lax",
          "refreshToken=R; Max-Age=604800; Path=/auth/refresh; HttpOnly; SameSite=Lax",
        ],
        body: '{"ok":true}',
      }),
    );

    const { POST } = await import("./route");
    const req = makeRequest({
      method: "POST",
      url: "http://localhost:3001/api/backend/auth/login",
      headers: { "content-type": "application/json" },
      body: '{"email":"x","password":"y"}',
    });

    const res = await POST(req, {
      params: Promise.resolve({ path: ["auth", "login"] }),
    });

    expect(res.status).toBe(201);
    const setCookies = res.headers.getSetCookie();
    expect(setCookies).toHaveLength(2);
    expect(setCookies[0]).toContain("accessToken=A");
    expect(setCookies[0]).toContain("Path=/");
    expect(setCookies[0]).not.toContain("Path=/api/backend");
    expect(setCookies[1]).toContain("refreshToken=R");
    expect(setCookies[1]).toContain("Path=/api/backend/auth/refresh");
  });

  it("strips the Origin header before forwarding upstream", async () => {
    fetchMock.mockResolvedValueOnce(makeUpstream({ status: 200, body: "{}" }));

    const { GET } = await import("./route");
    const req = makeRequest({
      method: "GET",
      url: "http://localhost:3001/api/backend/auth/profile",
      headers: {
        origin: "https://prescriptions-app.vercel.app",
        host: "prescriptions-app.vercel.app",
        cookie: "accessToken=A",
      },
    });

    await GET(req, { params: Promise.resolve({ path: ["auth", "profile"] }) });

    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(calledUrl).toBe(`${BACKEND_BASE}/auth/profile`);
    const forwarded = new Headers(calledInit.headers);
    expect(forwarded.get("origin")).toBeNull();
    expect(forwarded.get("host")).toBeNull();
    // Other headers (like Cookie) survive so the upstream can authenticate.
    expect(forwarded.get("cookie")).toBe("accessToken=A");
  });

  it("passes non-2xx upstream status through verbatim", async () => {
    fetchMock.mockResolvedValueOnce(
      makeUpstream({
        status: 401,
        body: '{"message":"Unauthorized"}',
      }),
    );

    const { GET } = await import("./route");
    const req = makeRequest({
      method: "GET",
      url: "http://localhost:3001/api/backend/auth/profile",
    });

    const res = await GET(req, {
      params: Promise.resolve({ path: ["auth", "profile"] }),
    });

    expect(res.status).toBe(401);
    expect(await res.text()).toBe('{"message":"Unauthorized"}');
  });

  it("appends the request's search params to the upstream URL", async () => {
    fetchMock.mockResolvedValueOnce(makeUpstream({ status: 200, body: "[]" }));

    const { GET } = await import("./route");
    const req = makeRequest({
      method: "GET",
      url: "http://localhost:3001/api/backend/prescriptions?page=2&limit=10",
    });

    await GET(req, {
      params: Promise.resolve({ path: ["prescriptions"] }),
    });

    const [calledUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe(`${BACKEND_BASE}/prescriptions?page=2&limit=10`);
  });
});
