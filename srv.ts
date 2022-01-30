import { getConfig, ServerOptions } from "./config.ts";
import { createRouter } from "./router.ts";
import * as utils from "./utils.response.ts";
import { RouteHandler } from "./types.ts";

export function srv(options: ServerOptions) {
  const { location, controller } = getConfig(options);

  const router = createRouter();
  const errorHandler = router.internalError;

  const server = Deno.listen(options);
  controller.signal.addEventListener("abort", () => server.close());

  function handleError(handle: RouteHandler) {
    errorHandler.handle = handle;
  }

  function handleRequest({ request, respondWith }: Deno.RequestEvent): void {
    const url = new URL(request.url);
    const route = router.match(url.pathname, request);

    try {
      respondWith(route.handle({
        json: utils.json,
        html: utils.html,
        redirect: utils.redirect,
        url,
        request,
        params: route.params,
      }));
    } catch (error) {
      respondWith(errorHandler.handle({
        json: utils.json,
        html: utils.html,
        redirect: utils.redirect,
        url,
        request,
        error,
      }));
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
