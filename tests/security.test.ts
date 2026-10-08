import test from "node:test";
import assert from "node:assert/strict";
import { safeURL, safeDataURL, validateEntry } from "../lib/schema.ts";
import { sanitizeSVG } from "../lib/media.ts";
import { seed } from "../lib/seed.ts";
import { type Collection, visible } from "../types/content.ts";
test("all supplied records pass the production schema", () => {
  for (const [table, rows] of Object.entries(seed))
    for (const row of rows)
      assert.doesNotThrow(() => validateEntry(table as Collection, row));
});
test("dangerous links and protocol-relative paths are rejected", () => {
  for (const url of [
    "javascript:alert(1)",
    "//evil.test",
    "/\\evil.test",
    " /foo",
    "data:text/html;base64,AAA",
    "https://example.test/\n",
  ])
    assert.equal(safeURL(url), false, url);
  assert.equal(safeURL("https://example.test/path"), true);
  assert.equal(safeURL("/cv"), true);
});
test("demo data URLs never pass production validation", () => {
  const item = structuredClone(seed.profiles[0]);
  item.data.photo = "data:image/png;base64,aGVsbG8=";
  assert.equal(safeDataURL(String(item.data.photo)), true);
  assert.throws(() => validateEntry("profiles", item));
  assert.doesNotThrow(() => validateEntry("profiles", item, true));
});
test("invalid project slugs and unrecognized fields fail", () => {
  const item = {
    ...seed.profiles[0],
    data: { title: "Prueba", slug: "../../admin" },
  };
  assert.throws(() => validateEntry("projects", item));
  assert.throws(() =>
    validateEntry("profiles", {
      ...seed.profiles[0],
      data: { ...seed.profiles[0].data, role: "admin" },
    }),
  );
});
test("dates and required content are validated", () => {
  const item = structuredClone(seed.experiences[0]);
  item.data.end = "2020-01-01";
  assert.throws(() => validateEntry("experiences", item));
  item.data.company = "";
  assert.throws(() => validateEntry("experiences", item));
});
test("private entries are excluded and ordering is respected", () => {
  const rows = seed.experiences.map((row, i) => ({
    ...row,
    sort_order: 2 - i,
    is_visible: i !== 1,
  }));
  assert.deepEqual(
    visible(rows).map((x) => x.data.company),
    ["Air Europa", "ZARA"],
  );
});
test("safe SVG is reconstructed; scripting, URLs and malformed markup are rejected", () => {
  assert.match(
    sanitizeSVG(
      '<svg viewBox="0 0 10 10"><path d="M0 0L10 10" stroke="#fff"/></svg>',
    ),
    /^<svg xmlns=/,
  );
  for (const svg of [
    '<svg onload="alert(1)"></svg>',
    "<svg><script>alert(1)</script></svg>",
    '<svg><image href="https://evil.test"/></svg>',
    '<svg><path fill="url(https://evil.test)"/></svg>',
    "<!DOCTYPE svg><svg/>",
    "<svg><g></svg>",
  ])
    assert.throws(() => sanitizeSVG(svg));
});

test("origin checks support server proxy rewrites without trusting another host", async () => {
  const { sameOrigin } = await import("../lib/request-origin.ts");
  const request = (origin: string, host = "127.0.0.1:3000") =>
    new Request("http://localhost:3000/api/admin/content", {
      headers: { origin, host },
    });
  assert.equal(sameOrigin(request("http://127.0.0.1:3000"), ""), true);
  assert.equal(sameOrigin(request("https://evil.test"), ""), false);
  assert.equal(sameOrigin(request("null"), ""), false);
  assert.equal(
    sameOrigin(
      request("https://portfolio.example"),
      "https://portfolio.example",
    ),
    true,
  );
  assert.equal(
    sameOrigin(
      request("http://portfolio.example"),
      "https://portfolio.example",
    ),
    false,
  );
});
