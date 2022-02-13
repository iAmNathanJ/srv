import { staticResponse } from "./static.ts";
import { internalError, notFound } from "./router.defaults.ts";
import { createMatcher, validateRoutePath } from "./router.utils.ts";
import { HTTPMethod, MatchedRoute, Route, RouteHandler } from "./types.ts";

export function createRouter() {
  const routes: Route[] = [];
  const matchedRouteCache = new Map<string, MatchedRoute>();

  function use(
    routePath: string,
    handle: RouteHandler,
    method = HTTPMethod.ANY,
  ) {
    validateRoutePath(routePath);

    const match = createMatcher(routePath, method);

    const route: Route = {
      handle,
      match,
      method,
      path: routePath,
    };

    routes.push(route);
  }

  function match(reqPath: string, reqMethod: string): MatchedRoute {
    const cacheKey = `${reqMethod}_${reqPath}`;
    if (matchedRouteCache.has(cacheKey)) {
      return matchedRouteCache.get(cacheKey)!;
    }

    let matchedRoute: MatchedRoute;
    for (const route of routes) {
      const { isMatch, params } = route.match(reqPath, reqMethod);

      if (isMatch) {
        matchedRoute = {
          ...route,
          params,
        };
        break;
      }
    }

    const route = matchedRoute! ?? { ...notFound, path: reqPath };

    matchedRouteCache.set(cacheKey, route);

    return route;
  }

  function staticHandler(routePath: string, dir = Deno.cwd()) {
    const match = createMatcher(routePath, HTTPMethod.GET, false);
    routes.push({
      handle: ({ request, url }) =>
        staticResponse(request, url, routePath, dir),
      match,
      method: HTTPMethod.GET,
      path: routePath,
    });
  }

  function createHeadRoute(routePath: string, handle: RouteHandler) {
    const headHandle: RouteHandler = async (handlerArgs) => {
      const response = (await handle(handlerArgs));
      const responseLength = (await response.arrayBuffer()).byteLength;
      const { status, statusText, headers } = response;

      headers.set("content-length", `${responseLength}`);

      return new Response(null, {
        status,
        statusText,
        headers,
      });
    };

    use(routePath, headHandle, HTTPMethod.HEAD);
  }

  // TODO: implement OPTIONS
  function options() {}

  return {
    routes,
    match,
    use,
    static: staticHandler,
    get(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.GET);
      createHeadRoute(routePath, handler);
    },
    post(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.POST);
      createHeadRoute(routePath, handler);
    },
    put(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.PUT);
      createHeadRoute(routePath, handler);
    },
    patch(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.PATCH);
      createHeadRoute(routePath, handler);
    },
    delete(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.DELETE);
      createHeadRoute(routePath, handler);
    },
    options(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.OPTIONS);
    },
    internalError,
  };
}
