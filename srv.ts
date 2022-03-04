import { getConfig, ServerOptions } from "./config/boot.ts";
import { createRouter } from "./router/router.ts";
import { ErrorRouteHandler } from "./router/types.ts";
import { createApplication } from "./application.ts";

export function srv(options: ServerOptions) {
  const { location, controller, ...userOptions } = getConfig(options);

  const router = createRouter();
  const errorHandler = router.internalError;
  const appHandle = createApplication(router, userOptions);

  const server = Deno.listen(options);
  controller.signal.addEventListener("abort", () => server.close());

  function handleError(handle: ErrorRouteHandler) {
    errorHandler.handle = handle;
  }

  function handleRequest({ request, respondWith }: Deno.RequestEvent): void {
    try {
      respondWith(appHandle({ request }));
    } catch (error) {
      respondWith(errorHandler.handle({ request, error }));
    }
  }

  async function handleConn(conn: Deno.Conn) {
    if (controller.signal.aborted) {
      conn.close();
      return;
    }

    for await (const requestEvent of Deno.serveHttp(conn)) {
      handleRequest(requestEvent);
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
    ...router,
    location,
    listen,
    handleError,
    die: () => controller.abort(),
  };
}
