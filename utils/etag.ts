import { base64, readAll, readerFromStreamReader } from "../deps/prod.ts";
import type { HandlerArgs } from "../router/types.ts";
import type { Body } from "./response.ts";

const encoder = new TextEncoder();

async function etagFromStream(
  body: ReadableStream<Uint8Array>,
): Promise<string> {
  const reader = readerFromStreamReader(body.getReader());
  return base64.encode(
    await crypto.subtle.digest("SHA-1", await readAll(reader)),
  );
}

async function etagFromString(body: string): Promise<string> {
  return base64.encode(
    await crypto.subtle.digest("SHA-1", encoder.encode(body)),
  );
}

export function createEtag(body: Body): Promise<string> {
  if (body === null) {
    return Promise.resolve("");
  }

  switch (body.constructor.name) {
    case "String":
      return etagFromString(body as string);
    case "ReadableStream": {
      return etagFromStream(body as ReadableStream);
    }
    case "FormData":
      break; // no etag
    case "URLSearchParams":
      break; // no etag
  }

  return Promise.resolve("");
}

export async function etagMiddleware({ request, response }: HandlerArgs) {
  // TODO: create allow or deny list for etag content types
  if (request.headers.get("accept") === "text/event-stream") {
    return;
  }

  let etag = "";

  if (response.body?.constructor.name === "ReadableStream") {
    const [originalBody, bodyForEtag] = (response.body as ReadableStream).tee();
    response.setBody(originalBody);
    etag = await createEtag(bodyForEtag);
  } else {
    etag = await createEtag(response.body);
  }

  response.setHeader("etag", etag);
}
