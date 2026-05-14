import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

// Self-test: catch accidental .only / .skip leaking into committed e2e files.
// Runs at discovery time — adds <1ms to the suite.
test("no test.only or test.skip in committed e2e files", () => {
  const here = __dirname;
  const files = readdirSync(here).filter(
    (f) => f.endsWith(".spec.ts") && f !== "strictness.spec.ts",
  );
  const offenders: string[] = [];
  for (const file of files) {
    const src = readFileSync(join(here, file), "utf8");
    const lines = src.split("\n");
    lines.forEach((line, i) => {
      const trimmed = line.replace(/\/\/.*$/, "").trim();
      if (
        /\btest\.only\(/.test(trimmed) ||
        /\bdescribe\.only\(/.test(trimmed) ||
        /\btest\.skip\(/.test(trimmed) ||
        /\bdescribe\.skip\(/.test(trimmed) ||
        /\bxtest\(/.test(trimmed) ||
        /\bxdescribe\(/.test(trimmed)
      ) {
        offenders.push(`${file}:${i + 1}: ${trimmed}`);
      }
    });
  }
  expect(
    offenders,
    `Found .only/.skip in committed specs:\n${offenders.join("\n")}`,
  ).toEqual([]);
});
