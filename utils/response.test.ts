import { assertEquals } from "../deps/dev.ts";
import { html, json, redirect } from "./response.ts";

const { test } = Deno;

test("json returns a serialized JSON response", async () => {
  const res = json({ foo: true });

  assertEquals(res.headers.get("content-type"), "application/json");
  assertEquals(await res.json(), { foo: true });
});

test("html returns an HTML string response", async () => {
  const res = html("<html>");

  assertEquals(res.headers.get("content-type"), "text/html");
  assertEquals(await res.text(), "<html>");
});

test("redirect returns an null response with 302", async () => {
  const res = redirect("/some/other/page");

  assertEquals(res.status, 302);
  assertEquals(res.headers.get("location"), "/some/other/page");
  assertEquals(await res.text(), "");
});
