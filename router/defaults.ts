import { Status, STATUS_TEXT } from "../deps/prod.ts";
import { Route, RouteHandler } from "./types.ts";

export const notFound: Partial<Route> = {
  handle() {
    return new Response(
      `${Status.NotFound} ${STATUS_TEXT.get(Status.NotFound)}`,
      {
        status: Status.NotFound,
      },
    );
  },
};

export const internalError: { handle: RouteHandler } = {
  handle({ error = { stack: "" } }) {
    return new Response(
      `
        <h1>${Status.InternalServerError} ${
        STATUS_TEXT.get(Status.InternalServerError)
      }</h1>
        <pre>${error.stack}</pre>,
      `,
      {
        status: Status.InternalServerError,
        headers: {
          "content-type": "text/html",
        },
      },
    );
  },
};
