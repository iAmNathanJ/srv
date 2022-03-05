import { Router } from "./router/router.ts";
import { Cookies } from "./utils/cookies.ts";
import { SrvResponse } from "./utils/response.ts";
import { etagMiddleware } from "./utils/etag.ts";
import { ServerOptions } from "./config/boot.ts";
import { internalError } from "./router/defaults.ts";
import { HandlerArgs, HTTPMethod, RouteHandler } from "./router/types.ts";

export function createApplication(options: Partial<ServerOptions>) {
  const router = new Router();
  const before: RouteHandler[] = [];
  const after = getAfter(options);

  const handleAppRequest = async ({ request }: { request: Request }) => {
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

    try {
      await Promise.all(before.map((b) => b(context)));
      await route.handle(context);
      await Promise.all(after.map((a) => a(context)));
    } catch (error) {
      await internalError({ ...context, error });
    }

    return response.final();
  };

  return {
    ...router,
    internalError,
    handle: handleAppRequest,
  };
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
