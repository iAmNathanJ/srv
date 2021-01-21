export type Options = Pick<Deno.ListenOptions, "port" | "hostname">;

interface SrvConfig {
  location: URL;
}

export function getConfig({
  hostname = "localhost",
  port = 8000,
}: Options): SrvConfig {
  const location = new URL(`http://${hostname}:${port}`);
  return { location };
}
