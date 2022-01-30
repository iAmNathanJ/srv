import { Application } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { PORT } from "./config.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "root";
});

await app.listen({ port: PORT });
