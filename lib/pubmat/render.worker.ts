import { renderPreparedPoster, type PreparedPoster } from "./render-prepared";
import { rasterizePoster } from "./jsx-renderer";
import { PubmatFitError } from "./core";

export type PosterWorkerRequest =
  | { type: "layout"; id: number; input: PreparedPoster }
  | { type: "png"; id: number; svg: string }
  | { type: "cancel"; id: number };

const jobs = new Map<
  number,
  {
    request: Exclude<PosterWorkerRequest, { type: "cancel" }>;
    controller: AbortController;
  }
>();
let running = false;

async function drain() {
  if (running) return;
  running = true;
  try {
    while (jobs.size) {
      const entry = jobs.entries().next().value!;
      const [id, { request, controller }] = entry;
      try {
        controller.signal.throwIfAborted();
        const result =
          request.type === "layout"
            ? await renderPreparedPoster(request.input, controller.signal)
            : await rasterizePoster(request.svg);
        if (!controller.signal.aborted) self.postMessage({ id, result });
      } catch (error) {
        if (!controller.signal.aborted)
          self.postMessage({
            id,
            error: {
              message:
                error instanceof Error
                  ? error.message
                  : "Could not render the poster.",
              field: error instanceof PubmatFitError ? error.field : undefined,
            },
          });
      } finally {
        jobs.delete(id);
      }
      // Let cancel/new-preview messages run before starting the next queued job.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    running = false;
  }
}

self.addEventListener("message", (event: MessageEvent<PosterWorkerRequest>) => {
  const request = event.data;
  if (request.type === "cancel") {
    jobs.get(request.id)?.controller.abort();
    jobs.delete(request.id);
  } else {
    jobs.set(request.id, { request, controller: new AbortController() });
    void drain();
  }
});
