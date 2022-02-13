import { HTTPMethod, RouteMatcher } from "./types.ts";

function matchMethod(reqMethod: string, routeMethod?: HTTPMethod): boolean {
  return routeMethod === reqMethod || routeMethod === HTTPMethod.ANY;
}

export function createMatcher(
  routePath: string,
  routeMethod: HTTPMethod,
  exact = true,
): RouteMatcher {
  const routeParamExpression = /:(\w+)/g;

  const processed = routePath.split("/").map((segment) => {
    return routeParamExpression.test(segment)
      ? segment.replace(routeParamExpression, String.raw`(?<$1>\w+)`)
      : escape(segment);
  }).join("/");

  const pathExpression = exact
    ? new RegExp(`^${processed}$`)
    : new RegExp(`^${processed}`);

  return (reqPath: string, reqMethod: string) => {
    if (!matchMethod(reqMethod, routeMethod)) {
      return {
        isMatch: false,
      };
    }

    const pathMatch = pathExpression.exec(reqPath);

    return {
      isMatch: !!pathMatch,
      params: pathMatch?.groups,
    };
  };
}

function escape(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const validRouteExpression = /^(\/[\.\*\+\$\(\)\-%_~!&',:;=@a-zA-Z0-9]*)+$/;

export function validateRoutePath(routePath: string): void | never {
  if (!validRouteExpression.test(routePath)) {
    throw new Error(`invalid route path "${routePath}"`);
  }
}

const validRouteParamExpression = /^[$_a-zA-Z]/;
