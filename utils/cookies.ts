import { Cookie, deleteCookie, getCookies, setCookie } from "../deps/prod.ts";

export class Cookies {
  #cookies: Record<string, string> | null = null;
  #requestHeaders: Headers;
  #responseHeaders: Headers;

  constructor(requestHeaders: Headers, responseHeaders: Headers) {
    this.#requestHeaders = requestHeaders;
    this.#responseHeaders = responseHeaders;
  }

  get(name: string) {
    if (!this.#cookies) this.#cookies = getCookies(this.#requestHeaders);
    return this.#cookies[name];
  }

  set(cookie: Cookie) {
    setCookie(this.#responseHeaders, cookie);
  }

  delete(name: string, attrs?: { path?: string; domain?: string }) {
    deleteCookie(this.#responseHeaders, name, attrs);
  }
}
