import { join, Key, pathToRegexp, ServerRequest } from "../deps.ts";
import { HTTPMethod, Params } from "../request.ts";
import { serveFile } from "./static.ts";
import { internalError, notFound } from "./default-routes.ts";
import { ParsedRoute, Route, RouteHandler } from "./types.ts";

const { cwd } = Deno;

export function createRouter() {
  const routes: Route[] = [];
  const parsedRouteCache = new Map<string, ParsedRoute>();

  function match(req: ServerRequest): ParsedRoute {
    const reqPath = req.url.split("?")[0];
    if (parsedRouteCache.has(reqPath)) {
      return parsedRouteCache.get(reqPath)!;
    }
    let params: Params = {};
    const matchedRoute = routes.find((route) => {
      const isMatch = route.match(req);
      if (!isMatch) {
        return false;
      }
      params = getPathParams(reqPath, route.regex!, route.paramKeys!);
      return true;
    });

    const route = matchedRoute
      ? { ...matchedRoute, params: {} }
      : { ...notFound, params: {}, path: req.url } as ParsedRoute;

    parsedRouteCache.set(reqPath, route);

    return route;
  }

  return {
    match,
    internalError,
    static(routePath: string, dir = join(cwd(), "public")) {
      const regex = pathToRegexp(routePath, [], { end: false });
      routes.push({
        handle: ({ req }) => serveFile(req, routePath, dir),
        match: (req) => (
          matchMethod(req.method, HTTPMethod.GET) &&
          regex.test(req.url)
        ),
        method: HTTPMethod.GET,
        path: routePath,
        regex,
      });
    },
    use(routePath: string, handle: RouteHandler, method = HTTPMethod.ANY) {
      const paramKeys: Key[] = [];
      const regex = pathToRegexp(routePath, paramKeys);
      const route: Route = {
        handle,
        match: (req) => (
          matchMethod(req.method, method) &&
          regex.test(req.url.split("?")[0])
        ),
        method: HTTPMethod.ANY,
        path: routePath,
        regex,
        paramKeys,
      };
      routes.push(route);
    },
    get(routePath: string, handler: RouteHandler) {
      return this.use(routePath, handler, HTTPMethod.GET);
    },
    post(routePath: string, handler: RouteHandler) {
      return this.use(routePath, handler, HTTPMethod.POST);
    },
  };
}

function matchMethod(reqMethod: string, routeMethod?: string): boolean {
  return routeMethod === reqMethod || routeMethod === HTTPMethod.ANY;
}

function getPathParams(
  reqPath: string,
  routeRegex: RegExp,
  paramKeys: Key[],
): Record<string, unknown> {
  const [match, ...paramValues] = routeRegex.exec(reqPath) ?? [];

  if (!match) {
    return {};
  }

  return paramValues.reduce((params, paramValue, i) => ({
    ...params,
    [paramKeys[i].name]: decodeURIComponent(paramValue),
  }), {});
}
