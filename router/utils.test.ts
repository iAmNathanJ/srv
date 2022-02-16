import { assert, assertEquals, assertThrows } from "../deps/dev.ts";
import { createMatcher, validateRoutePath } from "./utils.ts";

const { test } = Deno;

test("createMatcher matches on simple paths", () => {
  const match = createMatcher("/path");

  assert(match("/path").isMatch);
});

test("createMatcher parses route params", () => {
  const match = createMatcher("/path/:key1/:key2");

  const result = match("/path/value1/value2");

  assert(result.isMatch);
  assertEquals(result.params, { key1: "value1", key2: "value2" });
});

test("createMatcher can handle partial match from the start of the path", () => {
  const match = createMatcher("/public", false);

  const result = match("/public/whatever/asset.thing");

  assert(result.isMatch);
});

test("createMatcher can handle special characters in path segments", () => {
  const testPath = "/.*+$/()-_~/%!&',/:;=@";

  const match = createMatcher(testPath);

  const result = match(testPath);

  assert(result.isMatch);
});

test("validateRoutePath throws on invalid paths", () => {
  assertThrows(() => validateRoutePath("missing/root"));

  assertThrows(() => validateRoutePath("/unencoded/path with space"));

  assertThrows(() => validateRoutePath("/reserved/character/["));
  assertThrows(() => validateRoutePath("/reserved/character/]"));
  assertThrows(() => validateRoutePath("/reserved/character/{"));
  assertThrows(() => validateRoutePath("/reserved/character/}"));
  assertThrows(() => validateRoutePath("/reserved/character/|"));
  assertThrows(() => validateRoutePath("/reserved/character/^"));
  assertThrows(() => validateRoutePath("/reserved/character/\\"));
  assertThrows(() => validateRoutePath('/reserved/character/"'));
});
