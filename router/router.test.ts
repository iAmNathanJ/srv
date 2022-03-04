import { assertEquals } from "../deps/dev.ts";
import { createRouter } from "./router.ts";
import { notFound } from "./defaults.ts";
import { HandlerArgs, HTTPMethod } from "./types.ts";
import { SrvResponse } from "../utils/response.ts";

const { test } = Deno;

const handlers = {
  GET: () => new Response(),
  POST: () => new Response(),
  PUT: () => new Response(),
  PATCH: () => new Response(),
  DELETE: () => new Response(),
};

test("router ensures the request method matches the invoked handler", () => {
  const router = createRouter();

  router.get("/", handlers.GET);
  router.post("/", handlers.POST);
  router.put("/", handlers.PUT);
  router.patch("/", handlers.PATCH);
  router.delete("/", handlers.DELETE);

  assertEquals(router.find("/", HTTPMethod.GET).handle, handlers.GET);
  assertEquals(router.find("/", HTTPMethod.POST).handle, handlers.POST);
  assertEquals(router.find("/", HTTPMethod.PUT).handle, handlers.PUT);
  assertEquals(router.find("/", HTTPMethod.PATCH).handle, handlers.PATCH);
  assertEquals(router.find("/", HTTPMethod.DELETE).handle, handlers.DELETE);
});

test("router can use one handler for all methods", () => {
  const router = createRouter();

  router.use("/", handlers.GET);

  assertEquals(router.find("/", HTTPMethod.GET).handle, handlers.GET);
  assertEquals(router.find("/", HTTPMethod.POST).handle, handlers.GET);
  assertEquals(router.find("/", HTTPMethod.PUT).handle, handlers.GET);
  assertEquals(router.find("/", HTTPMethod.PATCH).handle, handlers.GET);
  assertEquals(router.find("/", HTTPMethod.DELETE).handle, handlers.GET);
});

// test("router can handle paths with all valid characters", () => {
//   // a-z A-Z 0-9 . - _ ~ ! $ & ' ( ) * + , ; = : @
// });

// test("router can use one handler for all paths");

test("router parses path params", () => {
  const router = createRouter();

  router.use("/:param1/:param2", () => new Response());

  const route = router.find("/first/second", HTTPMethod.ANY);

  assertEquals(route.params, { param1: "first", param2: "second" });
});

test("router has a default 404 handler", () => {
  const router = createRouter();

  const route = router.find("/nothing/here", HTTPMethod.ANY);

  assertEquals(route.handle, notFound.handle);
});

test("router serves static content", async () => {
  const router = createRouter();

  router.static("/public", "test/public");

  const imagePath = "/public/denologo.svg";
  const url = new URL(imagePath, "http://localhost");
  const request = new Request(url.href);
  const response = new SrvResponse();

  const route = router.find(imagePath, HTTPMethod.GET);

  await route.handle({
    url,
    request,
    response,
  } as HandlerArgs);

  const image = await response.final().blob();

  assertEquals(image.type, "image/svg+xml");
});
