import { Status, STATUS_TEXT } from "../deps/prod.ts";
import { Route, RouteHandler } from "./types.ts";

export const notFound: Partial<Route> = {
  handle({ response }) {
    response.setStatus(Status.NotFound);
    response.setBody(`${Status.NotFound} ${STATUS_TEXT.get(Status.NotFound)}`);
  },
};

export const internalError: RouteHandler = ({
  error = { stack: "" },
  response,
}) => {
  response.setHeader("content-type", "text/html");
  response.setStatus(Status.InternalServerError);
  response.setBody(`
    <strong>${Status.InternalServerError} ${
    STATUS_TEXT.get(Status.InternalServerError)
  }</strong>
    <pre>${error.stack}</pre>,
  `);
};
