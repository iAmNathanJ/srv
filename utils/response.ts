import { mime, Status, STATUS_TEXT } from "../deps/prod.ts";

export type Body = BodyInit | null;
export class SrvResponse {
  #response = {
    body: null as Body,
    headers: new Headers(),
    status: Status.OK,
    statusText: STATUS_TEXT.get(Status.OK)!,
  };

  get body() {
    return this.#response.body;
  }

  get headers() {
    return this.#response.headers;
  }

  appendHeader = (k: string, v: string) => {
    this.#response.headers.append(k, v);
  };

  // TODO: accept headers as Headers
  appendHeaders = (headers: Record<string, string>) => {
    Object.entries(headers).forEach(([k, v]) => {
      this.#response.headers.append(k, v);
    });
  };

  setHeader = (k: string, v: string) => {
    this.#response.headers.set(k, v);
  };

  // TODO: accept headers as object
  setHeaders = (headers: Headers) => {
    this.#response.headers = headers;
  };

  deleteHeader = (k: string) => {
    this.#response.headers.delete(k);
  };

  setStatus = (s: Status) => {
    this.#response.status = s;
    this.#response.statusText = STATUS_TEXT.get(s)!;
  };

  setBody = (b: Body) => {
    this.#response.body = b;
  };

  json = (b: unknown) => {
    this.setHeader("content-type", mime.getType(".json")!);
    this.setBody(JSON.stringify(b));
  };

  html = (b: string) => {
    this.setHeader("content-type", mime.getType(".html")!);
    this.setBody(b);
  };

  redirect = (urlOrPath: string, status: Status = Status.Found) => {
    this.#response.status = status;
    this.#response.statusText = STATUS_TEXT.get(status)!;
    this.#response.headers.set("location", urlOrPath);
    this.#response.body = null;
  };

  final = () => {
    return new Response(this.#response.body, {
      headers: this.#response.headers,
      status: this.#response.status,
      statusText: this.#response.statusText,
    });
  };
}
