import { assertEquals } from "../deps/dev.ts";
import { EventSource } from "./sse.ts";

const { test } = Deno;

const decoder = new TextDecoder();

test("EventSource can be used as a stream source", async () => {
  const eventSource = new EventSource();
  const stream = new ReadableStream(eventSource);
  const reader = stream.getReader();

  eventSource.dispatch({ event: "test", data: "payload" });

  const output = (await reader.read()).value;

  assertEquals(decoder.decode(output), 'event:test\ndata:"payload"\n\n');
});
