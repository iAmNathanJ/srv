import { assertEquals } from "./deps.ts";
import { utils } from "../utils.response.ts";

const { test } = Deno;

test("responseUtils.json returns a serialized JSON response", async () => {
  const res = utils.json({ foo: true });

  assertEquals(res.headers.get("content-type"), "application/json");
  assertEquals(await res.json(), { foo: true });
});

test("responseUtils.html returns an HTML string response", async () => {
  const res = utils.html("<html>");

  assertEquals(res.headers.get("content-type"), "text/html");
  assertEquals(await res.text(), "<html>");
});

test("responseUtils.redirect returns an null response with 302", async () => {
  const res = utils.redirect("/some/other/page");

  assertEquals(res.status, 302);
  assertEquals(res.headers.get("location"), "/some/other/page");
  assertEquals(await res.text(), "");
});
