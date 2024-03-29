import { HTTPMethod, RouteHandler, RouteMatcher, Routes } from "./types.ts";

// characters allowed in path segments: . * + $ ( ) - _ ~ ! & ' , : ; = @
// OR encoded %\d\d
const validPathSegment = /([\.\*\+\$\(\)\-_~!&',:;=@a-zA-Z0-9]|%\d\d)/;
const validRoute = new RegExp(`^(\/${validPathSegment.source}*)+$`);

export function createMatcher(
  routePath: string,
  exact = true,
): RouteMatcher {
  const routeParamExpression = /:(\w+)/g;

  const routeRegex = routePath.split("/").map((pathSegment) => {
    return routeParamExpression.test(pathSegment)
      ? // create a named capture group for param segments
        pathSegment.replace(routeParamExpression, String.raw`(?<$1>\w+)`)
      : // otherwise, exscape any regexp special characters so they are interpretted literally
        escape(pathSegment);
  }).join("/");

  const matcher = exact
    ? new RegExp(`^${routeRegex}$`)
    : new RegExp(`^${routeRegex}`);

  return (reqPath: string) => {
    const matchResult = matcher.exec(reqPath);

    return {
      isMatch: !!matchResult,
      params: matchResult?.groups,
    };
  };
}

function escape(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export function validateRoutePath(routePath: string): void | never {
  if (!validRoute.test(routePath)) {
    throw new Error(`invalid route path "${routePath}"`);
  }
}

export function createOPTIONS(routes: Routes): RouteHandler {
  return ({ url, response }) => {
    const allow = Object.keys(routes).filter((method) => {
      return routes[method as HTTPMethod]?.some((route) =>
        route.match(url.pathname)
      );
    }).join(", ");

    response.setBody(null);
    response.setStatus(204);
    response.setHeader("allow", allow);
  };
}
