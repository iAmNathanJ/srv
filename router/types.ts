import { Key, ServerRequest } from "../deps.ts";
import { HTTPMethod, Params, SrvRequest } from "../request.ts";
import { SrvResponse } from "../response.ts";

export type RouteHandler = ({ req, res }: {
  req: SrvRequest;
  res: SrvResponse;
}) => void;

export interface Route {
  handle: RouteHandler;
  match: (req: ServerRequest) => boolean;
  method: HTTPMethod;
  path: string;
  regex?: RegExp;
  paramKeys?: Key[];
}

export interface ParsedRoute extends Route {
  params: Params;
}
