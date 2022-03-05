import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { PORT } from "./config.ts";

const app = new Application();
const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = "root";
});

app.use(router.routes());

await app.listen({ port: PORT });
