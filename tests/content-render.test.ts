import assert from "node:assert/strict";
import test from "node:test";
import { estimateReadTimeMinutes, markdownBlocks } from "../lib/content-render.ts";

test("markdownBlocks parses bullet symbol lists and inline links", () => {
  const blocks = markdownBlocks(`# Heading

Intro paragraph with a [soft link](/start-here).

• First useful point
• Second useful point

1. First step
2. Second step`);

  assert.equal(blocks[0]?.type, "h1");
  assert.equal(blocks[1]?.type, "p");
  assert.equal(blocks[1]?.inline[1]?.type, "link");
  assert.equal(blocks[1]?.inline[1]?.href, "/start-here");
  assert.equal(blocks[2]?.type, "ul");
  assert.equal(blocks[2]?.items.length, 2);
  assert.equal(blocks[3]?.type, "ol");
  assert.equal(blocks[3]?.items.length, 2);
});

test("estimateReadTimeMinutes returns a human read time floor of one minute", () => {
  const minutes = estimateReadTimeMinutes(`# Quick check

This is a short paragraph with a few words only.`);

  assert.equal(minutes, 1);
});
