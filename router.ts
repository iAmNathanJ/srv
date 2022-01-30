import { join, Key, pathToRegexp } from "./deps.ts";
import { staticResponse } from "./static.ts";
import { internalError, notFound } from "./routes.default.ts";
import { HTTPMethod, MatchedRoute, Route, RouteHandler } from "./types.ts";

const { cwd } = Deno;

export function createRouter() {
  const routes: Route[] = [];
  const matchedRouteCache = new Map<string, MatchedRoute>();

  function use(
    routePath: string,
    handle: RouteHandler,
    method = HTTPMethod.ANY,
  ) {
    const hasParams = routePath.includes(":");
    const paramKeys: Key[] = [];
    const regex = hasParams ? pathToRegexp(routePath, paramKeys) : /.*/;
    const route: Route = {
      handle,
      match: (reqPath, req) => (
        matchMethod(req.method, method) &&
          hasParams
          ? regex.test(reqPath)
          : reqPath === routePath
      ),
      path: routePath,
      method,
      regex,
      paramKeys,
      hasParams,
    };

    routes.push(route);
  }

  function match(reqPath: string, req: Request): MatchedRoute {
    if (matchedRouteCache.has(reqPath)) {
      return matchedRouteCache.get(reqPath)!;
    }

    const matchedRoute = routes.find((route) => route.match(reqPath, req));
    const params = matchedRoute?.hasParams
      ? getPathParams(reqPath, matchedRoute?.regex!, matchedRoute?.paramKeys!)
      : {};

    const route = matchedRoute
      ? { ...matchedRoute, params }
      : { ...notFound, params, path: reqPath } as MatchedRoute;

    matchedRouteCache.set(reqPath, route);

    return route;
  }

  function staticHandler(routePath: string, dir = join(cwd(), "public")) {
    const hasParams = routePath.includes(":");
    const regex = pathToRegexp(routePath, [], { end: false });
    routes.push({
      // handle: () => new Response("not the file"), // TODO fix this
      handle: ({ request, url }) =>
        staticResponse(request, url, routePath, dir),
      match: (reqPath, req) => (
        matchMethod(req.method, HTTPMethod.GET) &&
          hasParams
          ? regex.test(reqPath)
          : reqPath === routePath
      ),
      method: HTTPMethod.GET,
      path: routePath,
      regex,
      hasParams,
    });
  }

  // TODO: implement HEAD
  function head() {}

  // TODO: implement OPTIONS
  function options() {}

  return {
    match,
    use,
    static: staticHandler,
    get(routePath: string, handler: RouteHandler) {
      return this.use(routePath, handler, HTTPMethod.GET);
    },
    post(routePath: string, handler: RouteHandler) {
      return this.use(routePath, handler, HTTPMethod.POST);
    },
    put(routePath: string, handler: RouteHandler) {
      return this.use(routePath, handler, HTTPMethod.PUT);
    },
    patch(routePath: string, handler: RouteHandler) {
      return this.use(routePath, handler, HTTPMethod.PATCH);
    },
    delete(routePath: string, handler: RouteHandler) {
      return this.use(routePath, handler, HTTPMethod.DELETE);
    },
    options(routePath: string, handler: RouteHandler) {
      return this.use(routePath, handler, HTTPMethod.OPTIONS);
    },
    head(routePath: string, handler: RouteHandler) {
      return this.use(routePath, handler, HTTPMethod.HEAD);
    },
    internalError,
  };
}

function matchMethod(reqMethod: string, routeMethod?: string): boolean {
  return routeMethod === reqMethod || routeMethod === HTTPMethod.ANY;
}

function getPathParams(
  reqPath: string,
  routeRegex: RegExp,
  paramKeys: Key[],
): Record<string, string> {
  const [match, ...paramValues] = routeRegex.exec(reqPath) ?? [];

  if (!match) {
    return {};
  }

  return paramValues.reduce((params, paramValue, i) => ({
    ...params,
    [paramKeys[i].name]: decodeURIComponent(paramValue),
  }), {});
}
