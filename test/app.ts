import { srv } from "../mod.ts";
import { deleteCookie, getCookies, setCookie } from "../deps.ts";

const app = srv({ port: 8000 });

app.static("/public", "test/public");

app.get("/", () => {
  const headers = new Headers();

  setCookie(headers, {
    name: "fromtheserver",
    value: encodeURIComponent("encoded or not"),
    sameSite: "Lax",
    httpOnly: true,
    secure: true,
  });

  return new Response("root", { headers });
});

app.get("/api", ({ json }) => {
  return json({
    hello: true,
  });
});

app.get("/params/:first/:last", ({ json, params, url, request }) => {
  const { searchParams } = url;

  console.log(getCookies(request.headers));

  const res = json({
    params,
    query: Object.fromEntries(searchParams),
  });

  deleteCookie(res.headers, "user_name");

  setCookie(res.headers, {
    name: "user_name",
    value: encodeURIComponent(JSON.stringify(params)),
    path: "/",
    sameSite: "Lax",
    httpOnly: true,
    secure: true,
  });

  return res;
});

app.get("/home", ({ json, params, url }) => {
  const { searchParams } = url;

  return json({
    params,
    query: Object.fromEntries(searchParams),
  });
});

app.get("/no", ({ redirect, url }) => {
  return redirect(`/home${url.search}`);
});

app.listen();

console.log(`listening: ${app.location.origin}`);
