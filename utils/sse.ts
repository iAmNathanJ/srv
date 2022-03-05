import { RouteHandler } from "../router/types.ts";

interface ServerEventInit {
  event: string;
  data: unknown;
}

const encoder = new TextEncoder();

export class EventSource extends EventTarget
  implements UnderlyingSource<Uint8Array> {
  #controller?: ReadableStreamDefaultController;

  start = (controller: ReadableStreamDefaultController) => {
    this.#controller = controller;
    this.addEventListener("message", this.push as EventListener);
  };

  push = (e: CustomEvent<ServerEventInit>) => {
    this.#controller?.enqueue(EventSource.serverEventPayload(e));
  };

  dispatch = (payload: ServerEventInit) => {
    this.dispatchEvent(
      new CustomEvent<ServerEventInit>("message", { detail: payload }),
    );
  };

  cancel = () => {
    this.removeEventListener("message", this.push as EventListener);
    this.#controller?.close();
  };

  static serverEventPayload = (e: CustomEvent<ServerEventInit>) => {
    const { event, data } = e.detail;
    return encoder.encode(
      `event:${event}\ndata:${JSON.stringify(data)}\n\n`,
    );
  };
}

function createEventStreamRouteHandler(eventSource: EventSource): RouteHandler {
  return ({ response }) => {
    const stream = new ReadableStream<Uint8Array>(eventSource);

    response.setHeader("cache-control", "no-store");
    response.setHeader("content-type", "text/event-stream");
    response.setBody(stream);
  };
}

export function createEventSource() {
  const eventSource = new EventSource();
  const sendEvents = createEventStreamRouteHandler(eventSource);

  return {
    eventSource,
    sendEvents,
  };
}
