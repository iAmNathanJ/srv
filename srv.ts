import { getConfig, ServerOptions } from "./config.ts";
import { createRouter } from "./router.ts";
import * as utils from "./utils.response.ts";
import { RouteHandler } from "./types.ts";

const { listen, serveHttp } = Deno;

export function srv(options: ServerOptions) {
  const { location, controller } = getConfig(options);
  const server = listen(options);
  const router = createRouter();
  const errorHandler = router.internalError;

  controller.signal.onabort = () => server.close();

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

    for await (const requestEvent of serveHttp(conn)) {
      handleRequest(requestEvent);
    }
  }

  function start() {
    (async () => {
      for await (const conn of server) {
        handleConn(conn);
      }
    })();
  }

  return {
    location,
    handleError,
    listen: start,
    use: router.use,
    static: router.static,
    get: router.get,
    post: router.post,
    put: router.put,
    patch: router.patch,
    delete: router.delete,
    options: router.options,
    head: router.head,
    die: () => controller.abort(),
  };
}
