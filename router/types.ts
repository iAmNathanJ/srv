import { ResponseUtils } from "../utils/response.ts";

export interface HandlerArgs extends ResponseUtils {
  request: Request;
  url: URL;
  params?: Record<string, string>;
  error?: Error;
}

export type RouteHandler = (args: HandlerArgs) => Response | Promise<Response>;

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
