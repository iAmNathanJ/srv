import { serve, ServerRequest } from "./deps.ts";
import { getConfig } from "./config.ts";
import { createRequest } from "./request.ts";
import { createResponse } from "./response.ts";
import { createRouter } from "./router/router.ts";
import { RouteHandler } from "./router/types.ts";

type Options = Pick<Deno.ListenOptions, "port" | "hostname">;

export function srv(options: Options) {
  const { location } = getConfig(options);
  const server = serve(options);
  const router = createRouter();
  const errorHandler = router.internalError;

  function handle(request: ServerRequest): void {
    const route = router.match(request);
    const req = createRequest(request, route);
    const res = createResponse(request);

    try {
      route.handle({ req, res });
    } catch (e) {
      Object.assign(request, { error: e });
      errorHandler.handle({ req, res });
    }
  }

  function handleError(handle: RouteHandler) {
    errorHandler.handle = handle;
  }

  function listen() {
    (async () => {
      for await (const req of server) {
        handle(req);
      }
    })();

    return { location };
  }

  return {
    use: router.use,
    get: router.get,
    post: router.post,
    static: router.static,
    listen,
    handleError,
  };
}
