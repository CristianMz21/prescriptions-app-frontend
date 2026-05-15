#!/usr/bin/env node
/**
 * Compare the live backend OpenAPI document against the committed copy under
 * ../../backend/openapi.json. Exits 0 if they match, 1 if they differ.
 *
 * Usage:
 *   pnpm api:diff                # checks http://localhost:3000/docs-json
 *   API_URL=https://api.example.com pnpm api:diff
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const API_URL = process.env.API_URL;

if (!API_URL) {
  console.error("ERROR: API_URL environment variable is not defined.");
  process.exit(1);
}
const SPEC_PATH =
  process.env.OPENAPI_PATH ??
  join(process.cwd(), "..", "..", "backend", "openapi.json");

async function main() {
  const localRaw = readFileSync(SPEC_PATH, "utf8");
  const local = JSON.parse(localRaw);

  let live;
  try {
    const res = await fetch(`${API_URL}/docs-json`);
    if (!res.ok) {
      console.error(`Backend at ${API_URL}/docs-json returned ${res.status}.`);
      process.exit(2);
    }
    live = await res.json();
  } catch (err) {
    console.error(
      `Failed to reach backend at ${API_URL}/docs-json:`,
      err.message ?? err,
    );
    process.exit(2);
  }

  const localJson = JSON.stringify(local, null, 2);
  const liveJson = JSON.stringify(live, null, 2);

  if (localJson === liveJson) {
    console.log(`✔ OpenAPI spec matches ${SPEC_PATH}`);
    process.exit(0);
  }

  console.error(`✖ OpenAPI mismatch between live backend and ${SPEC_PATH}`);
  console.error(
    "  Run `pnpm run api:refresh` (or your backend export script) to sync.",
  );
  // Print a short summary of changed top-level keys.
  const localPaths = Object.keys(local.paths ?? {});
  const livePaths = Object.keys(live.paths ?? {});
  const added = livePaths.filter((p) => !localPaths.includes(p));
  const removed = localPaths.filter((p) => !livePaths.includes(p));
  if (added.length) console.error("  Added paths:", added.join(", "));
  if (removed.length) console.error("  Removed paths:", removed.join(", "));
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
