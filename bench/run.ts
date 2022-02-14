import { PORT } from "./config.ts";

// await test("abc");
// await test("aqua");
// await test("drash");
await test("oak");
await test("srv");
// await test("opine"); // not working

async function test(framework: string) {
  header(framework);

  const server = Deno.run({
    cmd: `deno run -A --unstable bench/${framework}.ts`
      .split(" "),
  });

  // just give it a sec
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await Deno.run({
    cmd: `wrk http://0.0.0.0:${PORT}/ -d 3 -c 50 -t 8`.split(
      " ",
    ),
  }).status();

  server.kill("SIGTERM");
  await server.status();

  footer();
}

function header(title: string) {
  console.log();
  console.log(`Framework: ${title}`);
  console.log("------------------------------------------------------------");
  console.log();
}

function footer() {
  console.log();
  console.log();
}
