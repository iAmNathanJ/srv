import { opine } from "https://deno.land/x/opine@2.1.1/mod.ts";
import { PORT } from "./config.ts";

const app = opine();

app.get("/", function (req, res) {
  res.send("root");
});

app.listen(PORT);
