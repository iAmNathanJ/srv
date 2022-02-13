import { HTTPMethod, RouteMatcher } from "./types.ts";

// characters allowed in path segments: . * + $ ( ) - _ ~ ! & ' , : ; = @
// OR encoded %\d\d
const validPathSegment = /([\.\*\+\$\(\)\-_~!&',:;=@a-zA-Z0-9]|%\d\d)/;
const validRoute = new RegExp(`^(\/${validPathSegment.source}*)+$`);

function matchHTTPMethod(reqMethod: string, routeMethod?: HTTPMethod): boolean {
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
      ? // create a named capture group for param segments
        segment.replace(routeParamExpression, String.raw`(?<$1>\w+)`)
      : // otherwise, exscape any regexp special characters so they are interpretted literally
        escape(segment);
  }).join("/");

  const pathExpression = exact
    ? new RegExp(`^${processed}$`)
    : new RegExp(`^${processed}`);

  return (reqPath: string, reqMethod: string) => {
    if (!matchHTTPMethod(reqMethod, routeMethod)) {
      return {
        isMatch: false,
      };
    }

    const matchResult = pathExpression.exec(reqPath);

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
