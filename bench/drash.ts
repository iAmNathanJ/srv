import * as Drash from "https://deno.land/x/drash@v2.5.0/mod.ts";
import { PORT } from "./config.ts";

class HomeResource extends Drash.Resource {
  public paths = ["/"];

  public GET(request: Drash.Request, response: Drash.Response): void {
    return response.text("root");
  }
}

// Create and run your server

const server = new Drash.Server({
  hostname: "0.0.0.0",
  port: PORT,
  protocol: "http",
  resources: [HomeResource],
});

server.run();
