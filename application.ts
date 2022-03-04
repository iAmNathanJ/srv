import { createRouter } from "./router/router.ts";
import { Cookies } from "./cookies.ts";
import { SrvResponse } from "./utils/response.ts";
import { etagMiddleware } from "./utils/etag.ts";
import { HandlerArgs, HTTPMethod, RouteHandler } from "./router/types.ts";
import { ServerOptions } from "./config/boot.ts";

type Router = ReturnType<typeof createRouter>;

interface RootHandlerArgs {
  request: Request;
}

function getAfter(options: Partial<ServerOptions>): RouteHandler[] {
  const middleware = [];

  if (options.etag) {
    middleware.push(etagMiddleware);
  }

  middleware.push(async (ctx: HandlerArgs) => {
    if (ctx.request.method !== HTTPMethod.HEAD) {
      return;
    }

    const { body, setHeader, setBody } = ctx.response;
    const contentLength = (await new Response(body).arrayBuffer()).byteLength;

    setBody(null);
    setHeader("content-length", `${contentLength}`);
  });

  return middleware;
}

export function createApplication(
  router: Router,
  options: Partial<ServerOptions>,
) {
  const before: RouteHandler[] = [];
  const after = getAfter(options);

  const handleAppRequest = async ({ request }: RootHandlerArgs) => {
    const url = new URL(request.url);
    const route = router.find(url.pathname, request.method);
    const response = new SrvResponse();
    const cookies = new Cookies(request.headers, response.headers);

    const context = {
      url,
      request,
      cookies,
      params: route.params,
      response,
    };

    await Promise.all(before.map((b) => b(context)));
    await route.handle(context);
    await Promise.all(after.map((a) => a(context)));

    return response.final();
  };

  return handleAppRequest;
}
