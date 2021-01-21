import { mime, ServerRequest } from "./deps.ts";

type Body = Uint8Array | Deno.Reader | string;

export interface SrvResponse {
  json: (body: Record<string, unknown>) => void;
}

function json(
  req: ServerRequest,
  body: Record<string, unknown>,
) {
  const headers = new Headers();
  headers.set("content-type", mime.getType(".json")!);
  req.respond({
    headers,
    body: JSON.stringify(body),
  });
}

export function createResponse(req: ServerRequest) {
  return {
    json: (body: Record<string, unknown>) => json(req, body),
  };
}
