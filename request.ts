import { ServerRequest } from "./deps.ts";
import { ParsedRoute } from "./router/types.ts";

export type Params = Record<string, unknown>;

export interface SrvRequest extends Pick<ServerRequest, "respond" | "done"> {
  url: URL;
  params: Params;
  error?: Error;
}

export function createRequest(
  req: ServerRequest,
  route: ParsedRoute,
): SrvRequest {
  return Object.assign(req, {
    url: parseRequestUrl(req),
    params: route.params,
  });
}

function parseRequestUrl(req: ServerRequest): URL {
  const protocol =
    req.headers.get("x-forwared-proto") ?? /^https/i.test(req.proto)
      ? "https"
      : "http";
  const host = req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "";
  return new URL(`${protocol}://${host}${req.url}`);
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
