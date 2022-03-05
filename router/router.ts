import { notFound } from "./defaults.ts";
import { createMatcher, createOPTIONS, validateRoutePath } from "./utils.ts";
import {
  HTTPMethod,
  ParsedRoute,
  Route,
  RouteHandler,
  Routes,
} from "./types.ts";
import { staticResponse } from "../utils/static.ts";

export class Router {
  #routes: Routes = {};
  // TODO: LRU
  #parsedRouteCache = new Map<string, ParsedRoute>();

  addRoute = (route: Route, method: HTTPMethod) => {
    if (!Array.isArray(this.#routes[method])) {
      this.#routes[method] = [];
    }

    this.#routes[method]!.push(route);
  };

  use = (
    routePath: string,
    handle: RouteHandler,
    method = HTTPMethod.ANY,
  ) => {
    validateRoutePath(routePath);

    const match = createMatcher(routePath);

    this.addRoute({ handle, match }, method);
    this.addRoute({ handle: handle, match }, HTTPMethod.HEAD);
    this.addRoute(
      { handle: createOPTIONS(this.#routes), match },
      HTTPMethod.OPTIONS,
    );
  };

  find = (reqPath: string, reqMethod: string): ParsedRoute => {
    const cacheKey = `${reqMethod}_${reqPath}`;
    if (this.#parsedRouteCache.has(cacheKey)) {
      return this.#parsedRouteCache.get(cacheKey)!;
    }

    let parsedRoute: ParsedRoute;

    // check explicit method first
    for (const route of this.#routes[reqMethod as HTTPMethod] ?? []) {
      const { isMatch, params } = route.match(reqPath);

      if (isMatch) {
        parsedRoute = route;
        parsedRoute.params = params;
        break;
      }
    }

    // check wildcard method second
    for (const route of this.#routes[HTTPMethod.ANY] ?? []) {
      const { isMatch, params } = route.match(reqPath);

      if (isMatch) {
        parsedRoute = route;
        parsedRoute.params = params;
        break;
      }
    }

    const route = parsedRoute! ?? notFound;

    this.#parsedRouteCache.set(cacheKey, route);

    return route;
  };

  static = (routePath: string, dir = Deno.cwd()) => {
    const handle: RouteHandler = async ({ request, url, response }) => {
      // TODO: implement static response without using std
      const res = await staticResponse(request, url, routePath, dir);
      response.setHeaders(res.headers);
      response.setBody(res.body);
    };
    const match = createMatcher(routePath, false);
    this.addRoute({ handle, match }, HTTPMethod.GET);
    this.addRoute({ handle, match }, HTTPMethod.HEAD);
  };

  get routes() {
    return this.#routes;
  }

  get = (routePath: string, handler: RouteHandler) => {
    this.use(routePath, handler, HTTPMethod.GET);
  };

  post = (routePath: string, handler: RouteHandler) => {
    this.use(routePath, handler, HTTPMethod.POST);
  };

  put = (routePath: string, handler: RouteHandler) => {
    this.use(routePath, handler, HTTPMethod.PUT);
  };

  patch = (routePath: string, handler: RouteHandler) => {
    this.use(routePath, handler, HTTPMethod.PATCH);
  };

  delete = (routePath: string, handler: RouteHandler) => {
    this.use(routePath, handler, HTTPMethod.DELETE);
  };
}
