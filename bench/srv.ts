import { srv } from "../mod.ts";
import { PORT } from "./config.ts";

const app = srv({ port: PORT });

app.get("/", ({ html }) => html("root"));

app.listen();
