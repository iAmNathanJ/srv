import Aqua from "https://deno.land/x/aqua@v1.3.3/mod.ts";
import { PORT } from "./config.ts";

const app = new Aqua(PORT);

app.get("/", () => {
  return "root";
});
