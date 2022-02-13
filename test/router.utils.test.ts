import { assert, assertEquals, assertThrows } from "./deps.ts";
import { createMatcher, validateRoutePath } from "../router.utils.ts";
import { HTTPMethod } from "../types.ts";

const { test } = Deno;

test("createMatcher matches on simple paths", () => {
  const match = createMatcher("/path", HTTPMethod.GET);

  assert(match("/path", HTTPMethod.GET).isMatch);
});

test("createMatcher parses route params", () => {
  const match = createMatcher("/path/:key1/:key2", HTTPMethod.GET);

  const result = match("/path/value1/value2", HTTPMethod.GET);

  assert(result.isMatch);
  assertEquals(result.params, { key1: "value1", key2: "value2" });
});

test("createMatcher can handle partial match from the start of the path", () => {
  const match = createMatcher("/public", HTTPMethod.GET, false);

  const result = match("/public/whatever/asset.thing", HTTPMethod.GET);

  assert(result.isMatch);
});

test("createMatcher can handle special characters in path segments", () => {
  const testPath = "/.*+$/()-_~/%!&',/:;=@";

  const match = createMatcher(testPath, HTTPMethod.GET);

  const result = match(testPath, HTTPMethod.GET);

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
