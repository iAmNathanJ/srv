import { SrvResponse } from "../utils/response.ts";
import { Cookies } from "../utils/cookies.ts";

export interface HandlerArgs {
  url: URL;
  request: Request;
  response: SrvResponse;
  cookies: Cookies;
  params?: Record<string, string>;
  error?: Error;
}

export type RouteHandler = (
  args: HandlerArgs,
) => unknown | Promise<unknown>;

export type ErrorRouteHandler = (
  args: HandlerArgs & { error: Error },
) => unknown | Promise<unknown>;

export type RouteMatcher = (reqPath: string) => {
  isMatch: boolean;
  params?: Record<string, string>;
};

export interface Route {
  handle: RouteHandler;
  match: RouteMatcher;
}

export interface ParsedRoute extends Route {
  params?: Record<string, string>;
}

export enum HTTPMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
  ANY = "*",
}

export type Routes = Partial<Record<HTTPMethod, Route[]>>;
