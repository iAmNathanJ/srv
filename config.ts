export interface ServerOptions extends Deno.ListenOptions {
  controller?: AbortController;
}

interface SrvConfig {
  location: URL;
  controller: AbortController;
}

export function getConfig({
  hostname = "localhost",
  port = 8000,
  controller = new AbortController(),
}: ServerOptions): SrvConfig {
  const location = new URL(`http://${hostname}:${port}`);

  return {
    location,
    controller,
  };
}
