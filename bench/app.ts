import { srv } from "../mod.ts";

const app = srv({ port: 8000 });

app.static("/static");

app.get("/", ({ req }) => {
  req.respond({ body: "root" });
});

app.get("/api", ({ res }) => {
  res.json({
    hello: true,
  });
});

app.get("/foo/:first/:last", ({ req }) => {
  const { params, url } = req;
  const { searchParams } = url;
  req.respond({
    body: JSON.stringify({
      params,
      query: Object.fromEntries(searchParams),
    }),
  });
});

app.get("/home", ({ req }) => {
  const { params, url } = req;
  const { searchParams } = url;
  req.respond({
    body: JSON.stringify({
      params,
      query: Object.fromEntries(searchParams),
    }),
  });
});

app.handleError(({ req }) => {
  const { error } = req;
  if (error) {
    req.respond({
      status: 500,
      body: `${error.stack}`,
    });
  }
});

const { location } = app.listen();

console.log(location.origin);
