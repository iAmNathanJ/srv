import { Status, STATUS_TEXT } from "../deps.ts";
import { HTTPMethod } from "../request.ts";
import { Route, RouteHandler } from "./types.ts";

export const notFound: Partial<Route> = {
  handle({ req }) {
    req.respond({
      status: Status.NotFound,
      body: `${Status.NotFound} ${STATUS_TEXT.get(Status.NotFound)}`,
    });
  },
  method: HTTPMethod.ANY,
};

export const internalError: { handle: RouteHandler } = {
  handle({ req }) {
    req.respond({
      status: Status.InternalServerError,
      body: `${Status.InternalServerError} ${
        STATUS_TEXT.get(Status.InternalServerError)
      }`,
    });
  },
};
