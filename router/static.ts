import { extname, join, mime } from "../deps.ts";
import { SrvRequest } from "../request.ts";

const { open, stat } = Deno;

export async function serveFile(
  req: SrvRequest,
  routePath: string,
  dir: string,
): Promise<void> {
  const filePath = resolveFilePath(req.url.pathname, routePath, dir);
  const [file, fileInfo] = await Promise.all([
    open(filePath),
    stat(filePath),
  ]);
  const headers = new Headers();
  headers.set("content-length", fileInfo.size.toString());
  const contentTypeValue = mime.getType(extname(filePath));
  if (contentTypeValue) {
    headers.set("content-type", contentTypeValue);
  }
  req.done.then(() => {
    file.close();
  });
  req.respond({
    status: 200,
    body: file,
    headers,
  });
}

function resolveFilePath(
  reqPath: string,
  routePath: string,
  dir: string,
): string {
  const file = reqPath.replace(routePath, "");
  return join(dir, file);
}
