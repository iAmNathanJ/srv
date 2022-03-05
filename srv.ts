import { getConfig, ServerOptions } from "./config/boot.ts";
import { createApplication } from "./application.ts";

export function srv(options: ServerOptions) {
  const { location, controller, ...userOptions } = getConfig(options);
  const application = createApplication(userOptions);

  const server = Deno.listen(options);
  controller.signal.addEventListener("abort", () => server.close());

  async function handleConn(conn: Deno.Conn) {
    if (controller.signal.aborted) {
      conn.close();
      return;
    }

    for await (const { request, respondWith } of Deno.serveHttp(conn)) {
      try {
        await respondWith(application.handle({ request }));
      } catch {
        // client hung up
      }
    }
  }

  function listen() {
    (async () => {
      for await (const conn of server) {
        handleConn(conn);
      }
    })();
  }

  return {
    ...application,
    location,
    listen,
    die: () => controller.abort(),
  };
}
