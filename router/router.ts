import { internalError, notFound } from "./defaults.ts";
import { createMatcher, createOPTIONS, validateRoutePath } from "./utils.ts";
import {
  HTTPMethod,
  ParsedRoute,
  Route,
  RouteHandler,
  Routes,
} from "./types.ts";
import { staticResponse } from "../utils/static.ts";

export function createRouter() {
  const routes: Routes = {};
  const parsedRouteCache = new Map<string, ParsedRoute>();

  function addRoute(route: Route, method: HTTPMethod) {
    if (!Array.isArray(routes[method])) {
      routes[method] = [];
    }

    routes[method]!.push(route);
  }

  function use(
    routePath: string,
    handle: RouteHandler,
    method = HTTPMethod.ANY,
  ) {
    validateRoutePath(routePath);

    const match = createMatcher(routePath);

    addRoute({ handle, match }, method);
    addRoute({ handle: handle, match }, HTTPMethod.HEAD);
    addRoute({ handle: createOPTIONS(routes), match }, HTTPMethod.OPTIONS);
  }

  function find(reqPath: string, reqMethod: string): ParsedRoute {
    const cacheKey = `${reqMethod}_${reqPath}`;
    if (parsedRouteCache.has(cacheKey)) {
      return parsedRouteCache.get(cacheKey)!;
    }

    let parsedRoute: ParsedRoute;

    // check explicit method first
    for (const route of routes[reqMethod as HTTPMethod] ?? []) {
      const { isMatch, params } = route.match(reqPath);

      if (isMatch) {
        parsedRoute = route;
        parsedRoute.params = params;
        break;
      }
    }

    // check wildcard method second
    for (const route of routes[HTTPMethod.ANY] ?? []) {
      const { isMatch, params } = route.match(reqPath);

      if (isMatch) {
        parsedRoute = route;
        parsedRoute.params = params;
        break;
      }
    }

    const route = parsedRoute! ?? notFound;

    parsedRouteCache.set(cacheKey, route);

    return route;
  }

  function staticHandler(routePath: string, dir = Deno.cwd()) {
    const handle: RouteHandler = async ({ request, url, response }) => {
      // TODO: implement static response without using std
      const res = await staticResponse(request, url, routePath, dir);
      response.setHeaders(res.headers);
      response.setBody(res.body);
    };
    const match = createMatcher(routePath, false);
    addRoute({ handle, match }, HTTPMethod.GET);
    addRoute({ handle, match }, HTTPMethod.HEAD);
  }

  return {
    internalError,
    routes,
    find,
    use,
    static: staticHandler,
    get(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.GET);
    },
    post(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.POST);
    },
    put(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.PUT);
    },
    patch(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.PATCH);
    },
    delete(routePath: string, handler: RouteHandler) {
      use(routePath, handler, HTTPMethod.DELETE);
    },
  };
}
