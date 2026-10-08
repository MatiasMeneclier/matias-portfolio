import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const origin = "https://matiasmeneclier.com.ar";
const output = path.resolve("work/cv-publish");
await mkdir(output, { recursive: true });
const release = JSON.parse(
  await readFile("work/mobile-publish/release.json", "utf8"),
);
const paths = [
  "/",
  "/admin/login",
  "/cv?lang=es",
  "/cv?lang=en",
  "/cv/Matias-Meneclier-CV-ES.pdf",
  "/cv/Matias-Meneclier-Resume-EN.pdf",
];
const checks = await Promise.all(
  paths.map(async (route) => {
    const response = await fetch(origin + route, {
      signal: AbortSignal.timeout(30000),
      cache: "no-store",
    });
    assert.equal(response.status, 200, route);
    const bytes = Buffer.from(await response.arrayBuffer());
    const result = {
      route,
      status: response.status,
      contentType: response.headers.get("content-type"),
      bytes: bytes.length,
    };
    if (route.endsWith(".pdf")) {
      assert.match(result.contentType, /^application\/pdf/);
      const original = await readFile(path.join("public", route));
      const hash = (buffer) =>
        createHash("sha256").update(buffer).digest("hex");
      assert.equal(
        hash(bytes),
        hash(original),
        `Published PDF differs: ${route}`,
      );
      result.sha256 = hash(bytes);
      await writeFile(path.join(output, path.basename(route)), bytes);
    } else if (route.startsWith("/cv?")) {
      const html = bytes.toString("utf8");
      assert.ok(html.includes('class="cv-sheet"'), `Old CV served: ${route}`);
      assert.ok(
        html.includes("B2 First"),
        `Cambridge qualification missing: ${route}`,
      );
      assert.ok(
        html.includes(
          route.endsWith("es") ? "Formación académica" : "Education",
        ),
        `Wrong language: ${route}`,
      );
      result.cvUpdated = true;
    }
    return result;
  }),
);
const verification = {
  releaseId: release.id,
  releaseSha256: release.sha256,
  verifiedAt: new Date().toISOString(),
  checks,
};
await writeFile(
  path.join(output, "verification.json"),
  JSON.stringify(verification, null, 2),
);
console.log(JSON.stringify(verification, null, 2));
