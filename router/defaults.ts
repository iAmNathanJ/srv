import { Status, STATUS_TEXT } from "../deps/prod.ts";
import { ErrorRouteHandler, Route } from "./types.ts";

export const notFound: Partial<Route> = {
  handle({ response }) {
    response.setStatus(Status.NotFound);
    response.setBody(`${Status.NotFound} ${STATUS_TEXT.get(Status.NotFound)}`);
  },
};

// TODO: refactor to use SrvResponse
export const internalError: { handle: ErrorRouteHandler } = {
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
