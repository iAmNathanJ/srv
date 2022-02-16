# `srv`

A web server for Deno. Inspired by express et al.

This is a side project that I work on from time to time. It's mainly for
learning, and not intended for real use.

## Example Usage

### Hello World

```ts
import { srv } from "../mod.ts";

const app = srv({ port: 8000 });

app.get("/", () => {
  return new Response("hello world!");
});

app.listen();

console.log(`listening: ${app.location.origin}`);
```

### Response Utilities

```ts
app.get("/", ({ html }) => {
  return html("<!DOCTYPE html>");
});

app.get("/", ({ json }) => {
  return json({ foo: true });
});

app.get("/", ({ redirect }) => {
  return redirect("somewhere/else");
});
```

### Request URL

```ts
// assuming a request to /some/path?with=query-string

app.get("/some/path", ({ url }) => {
  console.log(url);
  console.log(Object.fromEntries(url.searchParams));
});
```

```sh
URL {
  href: "http://localhost:8000/some/path?with=query-string",
  origin: "http://localhost:8000",
  protocol: "http:",
  username: "",
  password: "",
  host: "localhost:8000",
  hostname: "localhost",
  port: "8000",
  pathname: "/some/path",
  hash: "",
  search: "?with=query-string"
}
{ with: "query-string" }
```

### Route Params

```ts
// assuming a request to /posts/programming/the-title

app.get("/posts/:category/:title", ({ params }) => {
  console.log(params);
});
```

```sh
{ category: "programming", title: "the-title" }
```

### Notes on Route Handlers

You must return a `Response` from all route handlers. Express and many other
middleware frameworks expect route handlers to "decorate" each response as it
moves through a stack of middleware. Srv expects you to return values. You are
on the hook to create and modify the response object as needed. This model may
seem a little less ergonomic, but is intended to emphasize explicit intent and
reduce the sense of "magic."

Middleware is not currently implemented. The primary compositional pattern used
to handle requests is TBD.

All route handlers are passed a single object the shape of
[`HandlerArgs`](./types.ts#L4)

---

## Architectural Principals

### Web Standards

In the same way that Deno embraces web standards, this framework should default
to reusing native platform features and create minimal abstractions.

### Composability

The framework should be composed of small parts. And those small parts should be
exposed so that users can assemble solutions for use cases that don't match the
high-level API surface.

### Friendly Interface

At a high level, the API surface should be as simple as possible. The ideal
interface is subjective, but there is value in emulating the patterns used in
other popular frameworks.

---

## Performance

Srv is currently handling more requests per second than most others I've
tested - see [`/bench/results`](./bench/results). The testing is probably flawed
and will definitely change if/when srv is developed further. If development
continues, performance will be a key consideration.

---

## TODO

- [ ] router optimization - LRU caching? Radix tree? Nested routes?

- [x] automatic HEAD responses
- [ ] automatic OPTIONS responses
- [ ] automatic 405 responses

- [ ] cookie parsing, encoding, decoding
- [ ] form data parsing

- [ ] middleware? how to compose functionality against all routes is under
      consideration.

- [ ] etag
- [ ] vary
- [ ] CSP

- [ ] logging
