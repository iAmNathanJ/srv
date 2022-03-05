import { srv } from "../mod.ts";
import { PORT } from "./config.ts";

const app = srv({ port: PORT, etag: false });

app.get("/", ({ response }) => {
  response.setBody("root");
});

app.listen();
