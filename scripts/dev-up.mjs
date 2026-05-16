/**
 * Cross-OS local dev bootstrap for the Prescriptions frontend.
 *
 *     node scripts/dev-up.mjs          # or `pnpm dev:up`
 *
 * Steps: preflight → ensure .env.local → pnpm install (if lockfile
 * changed) → ping backend (warn if down, don't fail) → regen API
 * client if backend openapi.json is newer than the local timestamp
 * marker → exec `PORT=3001 pnpm dev`.
 *
 * Flags:
 *   --skip-codegen   Skip `pnpm api:refresh` even if openapi.json is newer
 *   --no-server      Stop before starting `next dev`
 *
 * Works on Windows, macOS, Linux. No extra dependencies.
 */
import { spawnSync, spawn } from "node:child_process";
import { copyFileSync, existsSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const FE_DIR = resolve(SCRIPT_DIR, "..");
const OPENAPI_PATH = resolve(FE_DIR, "..", "..", "backend", "openapi.json");
const CODEGEN_STAMP = resolve(FE_DIR, "src", "lib", "api", "generated", ".gen-timestamp");

const args = new Set(process.argv.slice(2));
const flags = {
  skipCodegen: args.has("--skip-codegen"),
  noServer: args.has("--no-server"),
};

const useColor = process.stdout.isTTY;
const c = {
  blue: (s) => (useColor ? `\x1b[34m${s}\x1b[0m` : s),
  green: (s) => (useColor ? `\x1b[32m${s}\x1b[0m` : s),
  yellow: (s) => (useColor ? `\x1b[33m${s}\x1b[0m` : s),
  red: (s) => (useColor ? `\x1b[31m${s}\x1b[0m` : s),
};

function step(n, label) {
  console.log(`\n${c.blue(`[${n}/6]`)} ${label}`);
}
function ok(msg) {
  console.log(c.green(`  ✓ ${msg}`));
}
function warn(msg) {
  console.log(c.yellow(`  ⚠ ${msg}`));
}
function fail(msg) {
  console.error(c.red(`  ✗ ${msg}`));
  process.exit(1);
}

function run(cmd, argv, { cwd = FE_DIR, env = process.env } = {}) {
  const r = spawnSync(cmd, argv, {
    cwd,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) fail(`${cmd} ${argv.join(" ")} failed (exit ${r.status})`);
}

function which(cmd) {
  const probe = process.platform === "win32" ? "where" : "which";
  return spawnSync(probe, [cmd], { encoding: "utf8" }).status === 0;
}

// --- 1. Preflight ----------------------------------------------------
step(1, "Preflight");
const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor < 20) fail(`Node ${process.versions.node} < 20. Upgrade Node.`);
ok(`Node ${process.versions.node}`);
if (!which("pnpm")) fail("pnpm not on PATH. Install: https://pnpm.io/installation");
ok("pnpm on PATH");

// --- 2. .env.local ---------------------------------------------------
step(2, "Ensure .env.local");
const envPath = resolve(FE_DIR, ".env.local");
const envExamplePath = resolve(FE_DIR, ".env.local.example");
if (!existsSync(envPath)) {
  copyFileSync(envExamplePath, envPath);
  warn(".env.local created from .env.local.example");
} else {
  ok(".env.local present");
}

// --- 3. Deps ---------------------------------------------------------
step(3, "pnpm install");
const lockPath = resolve(FE_DIR, "pnpm-lock.yaml");
const modulesMarker = resolve(FE_DIR, "node_modules", ".modules.yaml");
let installNeeded = !existsSync(modulesMarker);
if (!installNeeded && existsSync(lockPath)) {
  installNeeded = statSync(lockPath).mtimeMs > statSync(modulesMarker).mtimeMs;
}
if (installNeeded) {
  run("pnpm", ["install", "--frozen-lockfile"]);
  ok("dependencies installed");
} else {
  ok("dependencies up to date (skipped)");
}

// --- 4. Backend reachability ----------------------------------------
step(4, "Backend reachability");
let backendUp = false;
try {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5_000);
  const res = await fetch("http://127.0.0.1:3000/", { signal: controller.signal });
  clearTimeout(t);
  backendUp = res.ok;
} catch {
  backendUp = false;
}
if (backendUp) {
  ok("backend responding at http://127.0.0.1:3000");
} else {
  warn("backend NOT reachable at http://127.0.0.1:3000");
  warn("the frontend will still start, but API calls will fail until you run:");
  warn("  cd ../../backend && pnpm dev:up");
}

// --- 5. API client freshness ----------------------------------------
step(5, "API client freshness");
if (flags.skipCodegen) {
  ok("codegen skipped via --skip-codegen");
} else if (!existsSync(OPENAPI_PATH)) {
  warn(`backend openapi.json not found at ${OPENAPI_PATH} — skipping codegen`);
} else {
  const openapiMtime = statSync(OPENAPI_PATH).mtimeMs;
  const stampMtime = existsSync(CODEGEN_STAMP) ? statSync(CODEGEN_STAMP).mtimeMs : 0;
  if (openapiMtime > stampMtime) {
    console.log("  openapi.json is newer than last codegen — refreshing client");
    run("pnpm", ["run", "api:refresh"]);
    writeFileSync(CODEGEN_STAMP, new Date().toISOString());
    ok("API client regenerated");
  } else {
    ok("API client up to date");
  }
}

// --- 6. Server -------------------------------------------------------
if (flags.noServer) {
  step(6, "Skip server (--no-server)");
  console.log(c.green("\n✅ Frontend ready. Start with: PORT=3001 pnpm dev\n"));
  process.exit(0);
}
step(6, "Start Next dev server on port 3001 (Ctrl-C to stop)");
const child = spawn("pnpm", ["dev"], {
  cwd: FE_DIR,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, PORT: "3001" },
});
const forward = (sig) => {
  if (!child.killed) child.kill(sig);
};
process.on("SIGINT", () => forward("SIGINT"));
process.on("SIGTERM", () => forward("SIGTERM"));
child.on("exit", (code) => process.exit(code ?? 0));
