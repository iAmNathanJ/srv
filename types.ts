import { Key } from "./deps.ts";
import { ResponseUtils } from "./utils.response.ts";

interface HandlerArgs extends ResponseUtils {
  request: Request;
  url: URL;
  params?: Record<string, string>;
  error?: Error;
}

export type RouteHandler = (args: HandlerArgs) => Response | Promise<Response>;

export interface Route {
  handle: RouteHandler;
  match: (reqPath: string, req: Request) => boolean;
  method: HTTPMethod;
  path: string;
  regex?: RegExp;
  paramKeys?: Key[];
}

export interface MatchedRoute extends Route {
  params: Record<string, string>;
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
