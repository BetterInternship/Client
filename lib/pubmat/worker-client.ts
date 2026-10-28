import type { PreparedPoster } from "./render-prepared";
import type { PosterArtifact } from "./theme-types";
import type { PosterWorkerRequest } from "./render.worker";
import { PubmatFitError, type PosterField } from "./core";

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<
  number,
  {
    resolve: (value: PosterArtifact | Blob) => void;
    reject: (error: Error) => void;
    cleanup: () => void;
  }
>();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./render.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (
      event: MessageEvent<{
        id: number;
        result?: PosterArtifact | Blob;
        error?: { message: string; field?: PosterField };
      }>,
    ) => {
      const job = pending.get(event.data.id);
      if (!job) return;
      pending.delete(event.data.id);
      job.cleanup();
      const { result, error } = event.data;
      if (error)
        job.reject(
          error.field
            ? new PubmatFitError(error.field, error.message)
            : new Error(error.message),
        );
      else if (result) job.resolve(result);
      else job.reject(new Error("The poster worker returned no image."));
    };
    worker.onerror = () => {
      worker?.terminate();
      worker = undefined;
      for (const job of pending.values()) {
        job.cleanup();
        job.reject(new Error("The poster renderer stopped. Please try again."));
      }
      pending.clear();
    };
  }
  return worker;
}

function requestWorker(
  request: Exclude<PosterWorkerRequest, { type: "cancel" }>,
  signal?: AbortSignal,
): Promise<PosterArtifact | Blob> {
  signal?.throwIfAborted();
  const target = getWorker();
  return new Promise((resolve, reject) => {
    const abort = () => {
      pending.delete(request.id);
      signal?.removeEventListener("abort", abort);
      target.postMessage({ type: "cancel", id: request.id });
      reject(new DOMException("Poster render cancelled", "AbortError"));
    };
    const cleanup = () => signal?.removeEventListener("abort", abort);
    pending.set(request.id, { resolve, reject, cleanup });
    signal?.addEventListener("abort", abort, { once: true });
    try {
      target.postMessage(request);
    } catch (error) {
      pending.delete(request.id);
      cleanup();
      reject(
        error instanceof Error
          ? error
          : new Error("Could not start poster rendering."),
      );
    }
  });
}

export async function renderOffThread(
  input: PreparedPoster,
  signal?: AbortSignal,
  priority = 0,
): Promise<PosterArtifact> {
  signal?.throwIfAborted();
  if (typeof Worker === "undefined")
    return (await import("./render-prepared")).renderPreparedPoster(
      input,
      signal,
    );
  return (await requestWorker(
    { type: "layout", id: ++nextId, input, priority },
    signal,
  )) as PosterArtifact;
}

export async function exportPosterPng(
  svg: string,
  priority = 0,
): Promise<Blob> {
  if (typeof Worker === "undefined")
    return (await import("./jsx-renderer")).rasterizePoster(svg);
  return (await requestWorker({
    type: "png",
    id: ++nextId,
    svg,
    priority,
  })) as Blob;
}
