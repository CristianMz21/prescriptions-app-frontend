import { type NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/** The proxy prefix that maps to the backend root. All upstream cookie paths
 *  must live under this prefix so the browser actually sends them back through
 *  the proxy on subsequent requests (e.g. `Path=/auth/refresh` would never
 *  match `/api/backend/auth/refresh` without rewriting). */
const PROXY_PREFIX = "/api/backend";

function buildTargetUrl(pathname: string, search: string): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const cleanedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${cleanedBase}/${pathname}${search}`;
}

/** Rewrite a single `Set-Cookie` header so its `Path` attribute lives under
 *  {@link PROXY_PREFIX}. Leaves `Path=/` untouched (root-scoped cookies remain
 *  visible to SSR `next/headers cookies()` on every route) and leaves cookies
 *  that already point at the proxy prefix alone. */
export function rewriteCookiePath(setCookie: string): string {
  return setCookie.replace(/(;\s*Path=)([^;]+)/i, (_, prefix: string, raw: string) => {
    const path = raw.trim();
    if (path === "/" || !path.startsWith("/")) return `${prefix}${path}`;
    if (path === PROXY_PREFIX || path.startsWith(`${PROXY_PREFIX}/`)) {
      return `${prefix}${path}`;
    }
    return `${prefix}${PROXY_PREFIX}${path}`;
  });
}

function buildOutboundHeaders(upstream: Response): Headers {
  const outbound = new Headers(upstream.headers);
  // Set-Cookie is multi-valued; rebuild it with each value rewritten.
  outbound.delete("set-cookie");
  const setCookies = upstream.headers.getSetCookie();
  for (const raw of setCookies) {
    outbound.append("set-cookie", rewriteCookiePath(raw));
  }
  return outbound;
}

async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const targetUrl = buildTargetUrl(path.join("/"), request.nextUrl.search);

  const upstreamHeaders = new Headers(request.headers);
  // The browser's Host/Origin are meaningless to the upstream and would either
  // confuse routing (Host) or trip the backend's CORS gate (Origin) for every
  // new Vercel preview URL. Strip them so this looks like a server-to-server
  // call — which it is.
  upstreamHeaders.delete("host");
  upstreamHeaders.delete("origin");

  const canHaveBody = request.method !== "GET" && request.method !== "HEAD";
  const body = canHaveBody ? await request.text() : undefined;

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: upstreamHeaders,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: buildOutboundHeaders(upstreamResponse),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return proxy(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return proxy(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return proxy(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return proxy(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return proxy(request, path);
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return proxy(request, path);
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return proxy(request, path);
}
