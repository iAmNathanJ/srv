import { CONNECTIONS, DURATION, PORT, THREADS } from "./config.ts";

await test("abc");
await test("aqua");
await test("oak");
await test("srv");

async function test(framework: string) {
  header(framework);

  const server = Deno.run({
    cmd: `deno run -A --unstable bench/${framework}.ts`
      .split(" "),
  });

  // just give it a sec
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await Deno.run({
    cmd:
      `wrk http://0.0.0.0:${PORT}/ -d ${DURATION} -c ${CONNECTIONS} -t ${THREADS}`
        .split(
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
