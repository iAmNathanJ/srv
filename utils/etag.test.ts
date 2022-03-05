import { assertEquals } from "../deps/dev.ts";
import { createEtag } from "./etag.ts";

const { test } = Deno;

test("etag string", async () => {
  const string = "foo";
  const etag = await createEtag(string);

  assertEquals(etag, "C+7Hteo/D9vJXQ3UfzxbwnXaijM=");
});

test("etag stream", async () => {
  const stream = new Response("foo").body;
  const etag = await createEtag(stream);

  assertEquals(etag, "C+7Hteo/D9vJXQ3UfzxbwnXaijM=");
});
