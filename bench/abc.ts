import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { PORT } from "./config.ts";

const app = new Application();

app.get("/", () => {
  return "root";
}).start({ port: PORT });
