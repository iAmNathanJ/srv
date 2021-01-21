const { run } = Deno;

run({
  cmd: "deno run -A --unstable bench/app.ts"
    .split(" "),
});

await new Promise((res) => setTimeout(res, 3000));

await run({
  cmd: "wrk http://localhost:8000/ -d 3 -c 50 -t 8".split(
    " ",
  ),
}).status();
