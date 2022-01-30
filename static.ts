import { join, serveFile } from "./deps.ts";

export function staticResponse(
  req: Request,
  url: URL,
  routePath: string,
  dir: string,
): Promise<Response> {
  const filePath = resolveFilePath(url.pathname, routePath, dir);
  return serveFile(req, filePath);
}

function resolveFilePath(
  reqPath: string,
  routePath: string,
  dir: string,
): string {
  const file = reqPath.replace(routePath, "");
  return join(dir, file);
}
