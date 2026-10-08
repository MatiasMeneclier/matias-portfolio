import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { seed } from "../lib/seed.ts";
import { buildCV } from "../lib/cv.ts";
import type { Content } from "../types/content.ts";

const source = process.argv[2]
  ? (JSON.parse(readFileSync(resolve(process.argv[2]), "utf8")) as Content)
  : seed;
const output = resolve("work/harvard-cv");
mkdirSync(output, { recursive: true });
for (const locale of ["es", "en"] as const) {
  writeFileSync(
    resolve(output, `cv-${locale}.json`),
    JSON.stringify(buildCV(source, locale), null, 2),
  );
}
console.log("CV_DATA_READY: ES + EN");
