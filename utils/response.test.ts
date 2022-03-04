import { assertEquals } from "../deps/dev.ts";
import { SrvResponse } from "./response.ts";

const { test } = Deno;

test("json returns a serialized JSON response", async () => {
  const res = new SrvResponse();
  res.json({ foo: true });

  const output = res.final();

  assertEquals(output.headers.get("content-type"), "application/json");
  assertEquals(await output.json(), { foo: true });
});

test("html returns an HTML string response", async () => {
  const res = new SrvResponse();
  res.html("<html>");

  const output = res.final();

  assertEquals(output.headers.get("content-type"), "text/html");
  assertEquals(await output.text(), "<html>");
});

test("redirect returns an null response with 302", async () => {
  const res = new SrvResponse();
  res.redirect("/some/other/page");

  const output = res.final();

  assertEquals(output.status, 302);
  assertEquals(output.headers.get("location"), "/some/other/page");
  assertEquals(await output.text(), "");
});
