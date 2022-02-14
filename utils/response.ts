import { mime, Status, STATUS_TEXT } from "../deps/prod.ts";

export interface ResponseUtils {
  json: (body: unknown, init?: ResponseInit) => Response;
  html: (body: string, init?: ResponseInit) => Response;
  redirect: (urlOrPath: string, init?: ResponseInit) => Response;
}

export const json: ResponseUtils["json"] = (body, init): Response => {
  const res = new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": mime.getType(".json")!,
      ...init?.headers ?? {},
    },
  });

  return res;
};

export const html: ResponseUtils["html"] = (body, init): Response => {
  return new Response(body, {
    ...init,
    headers: {
      "content-type": mime.getType(".html")!,
      ...init?.headers ?? {},
    },
  });
};

export const redirect: ResponseUtils["redirect"] = (
  urlOrPath,
  init,
): Response => {
  return new Response(null, {
    status: init?.status ?? Status.Found,
    statusText: init?.statusText ?? STATUS_TEXT.get(Status.Found),
    headers: {
      ...init?.headers ?? {},
      location: urlOrPath,
    },
  });
};
