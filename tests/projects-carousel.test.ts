import test from "node:test";
import assert from "node:assert/strict";
import {
  createSqueezeWindow,
  stepSqueezeWindow,
  settleSqueezeWindow,
  visiblePanels,
  wrapSlide,
} from "../lib/squeeze-carousel.ts";
import { projectExamples } from "../lib/project-examples.ts";
import { validateEntry } from "../lib/schema.ts";
import { localizeEntry } from "../lib/localization.ts";
import { readFile } from "node:fs/promises";

test("carousel preserves the selected project through interrupted direction changes and trimming", () => {
  for (const count of [2, 3, 6, 10]) {
    let state = createSqueezeWindow(count);
    let expected = 0;
    for (const [index, move] of [
      1, 1, -1, 3, -2, -1, 4, -3, 1, -1, 1,
    ].entries()) {
      expected = wrapSlide(expected + move, count);
      state = stepSqueezeWindow(state, move, count, state.slid + 0.27);
      assert.equal(state.cards[-state.column].slide, expected);
      if (index % 3 === 2) {
        state = settleSqueezeWindow(state, count);
        assert.equal(state.cards[0].slide, expected);
        assert.equal(state.cards.length, visiblePanels(count));
      }
      assert.equal(
        new Set(state.cards.map(({ key }) => key)).size,
        state.cards.length,
      );
    }
    state = settleSqueezeWindow(state, count);
    assert.equal(state.cards[0].slide, expected);
  }
});
test("empty and single-project collections never repeat placeholder panels", () => {
  const empty = createSqueezeWindow(0);
  assert.equal(empty.cards.length, 0);
  const single = createSqueezeWindow(1, 5);
  assert.equal(single.cards.length, 1);
  assert.deepEqual(stepSqueezeWindow(single, 1, 1), single);
});
test("examples remain editable, explicitly fictional and bilingual with local covers", async () => {
  assert.equal(projectExamples.length, 6);
  assert.equal(new Set(projectExamples.map((p) => p.data.slug)).size, 6);
  for (const project of projectExamples) {
    validateEntry("projects", project);
    assert.equal(project.data.is_demo, true);
    assert.match(
      String(localizeEntry(project, "es").data.long_description),
      /ficticio/,
    );
    assert.match(
      String(localizeEntry(project, "en").data.long_description),
      /Fictional/,
    );
    assert.equal(project.data.github, "");
    assert.equal(project.data.demo, "");
    const cover = await readFile(
      new URL("../public" + project.data.cover, import.meta.url),
      "utf8",
    );
    assert.match(cover, /<svg/);
    assert.doesNotMatch(cover, /<script|(?:href|src)=["']https?:/g);
  }
});
