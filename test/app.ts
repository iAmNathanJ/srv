import { createEventSource, srv } from "../mod.ts";

const app = srv({ port: 8000 });

app.static("/public", "test/public");

app.get("/", ({ response }) => {
  response.setBody("root");
});

app.get("/foo", ({ response }) => {
  response.html("works");
});

app.get("/api", ({ response }) => {
  response.json({
    hello: true,
  });
});

app.get("/params/:first/:last", ({ params, url, response }) => {
  const { searchParams } = url;

  response.json({
    params,
    query: Object.fromEntries(searchParams),
  });
});

app.get("/home", ({ params, url, response }) => {
  const { searchParams } = url;

  response.json({
    params,
    query: Object.fromEntries(searchParams),
  });
});

app.get("/no", ({ response, url }) => {
  response.redirect(`/home${url.search}`);
});

// SSE
const { events, sendEvents } = createEventSource();

setInterval(() => {
  events.message({ name: "hey", data: Date.now() });
}, 5_000);

app.get("/events", sendEvents);

app.listen();

console.log(`listening: ${app.location.origin}`);
