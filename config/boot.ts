export interface ServerOptions extends Deno.ListenOptions {
  controller?: AbortController;
  etag?: boolean;
}

interface SrvConfig {
  location: URL;
  controller: AbortController;
  etag: boolean;
}

export function getConfig({
  hostname = "localhost",
  port = 8000,
  controller = new AbortController(),
  etag = true,
}: ServerOptions): SrvConfig {
  const location = new URL(`http://${hostname}:${port}`);

  return {
    location,
    controller,
    etag,
  };
}
