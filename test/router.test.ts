import { assertEquals } from "./deps.ts";
import { createRouter } from "../router.ts";
import { notFound } from "../router.defaults.ts";
import { HandlerArgs } from "../types.ts";

const { test } = Deno;

const requests = {
  GET: new Request("http://localhost/", { method: "GET" }),
  POST: new Request("http://localhost/", { method: "POST" }),
  PUT: new Request("http://localhost/", { method: "PUT" }),
  PATCH: new Request("http://localhost/", { method: "PATCH" }),
  DELETE: new Request("http://localhost/", { method: "DELETE" }),
};

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

  assertEquals(router.match("/", requests.GET).handle, handlers.GET);
  assertEquals(router.match("/", requests.POST).handle, handlers.POST);
  assertEquals(router.match("/", requests.PUT).handle, handlers.PUT);
  assertEquals(router.match("/", requests.PATCH).handle, handlers.PATCH);
  assertEquals(router.match("/", requests.DELETE).handle, handlers.DELETE);
});

test("router can use one handler for all methods", () => {
  const router = createRouter();

  router.use("/", handlers.GET);

  assertEquals(router.match("/", requests.GET).handle, handlers.GET);
  assertEquals(router.match("/", requests.POST).handle, handlers.GET);
  assertEquals(router.match("/", requests.PUT).handle, handlers.GET);
  assertEquals(router.match("/", requests.PATCH).handle, handlers.GET);
  assertEquals(router.match("/", requests.DELETE).handle, handlers.GET);
});

// test("router can handle paths with all valid characters", () => {
//   // a-z A-Z 0-9 . - _ ~ ! $ & ' ( ) * + , ; = : @
// });

// test("router can use one handler for all paths");

test("router parses path params", () => {
  const router = createRouter();

  router.use("/:param1/:param2", () => new Response());

  const route = router.match(
    "/first/second",
    new Request("http://localhost/first/second"),
  );

  assertEquals(route.params, { param1: "first", param2: "second" });
});

test("router has a default 404 handler", () => {
  const router = createRouter();

  const route = router.match("/nothing/here", new Request("http://localhost/"));

  assertEquals(route.handle, notFound.handle);
});

test("router serves static content", async () => {
  const router = createRouter();

  router.static("/public", "test/public");

  const imageRequest = new Request("http://localhost/public/denologo.svg");

  const route = router.match("/public/denologo.svg", imageRequest);

  const imageResponse = await route.handle({
    request: imageRequest,
    url: new URL("http://localhost/public/denologo.svg"),
  } as HandlerArgs);

  const image = await imageResponse.blob();

  assertEquals(image.type, "image/svg+xml");
});

// test("router automatically provides HEAD requests", async () => {
//   const router = createRouter();
// });

// test("router automatically provides OPTIONS requests", async () => {
//   const router = createRouter();
// });
