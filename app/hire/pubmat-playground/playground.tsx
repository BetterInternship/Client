"use client";

import { useEffect, useState } from "react";
import { renderPubmatArtifact } from "@/lib/pubmat/render";
import {
  PUBMAT_DESIGNS,
  PUBMAT_DESIGN_IDS,
  type PubmatDesign,
} from "@/lib/pubmat/designs";

/** Temporary dev tool: imports the actual renderers so Fast Refresh redraws them. */
export function PubmatPlayground() {
  const [theme, setTheme] = useState<PubmatDesign>("centered-group-flow");
  const [background, setBackground] = useState("01-tech-editorial");
  const [title, setTitle] = useState("Brand Marketing Intern");
  const [description, setDescription] = useState(
    "Support creator campaigns, social media content, and community initiatives across digital channels.",
  );
  const [location, setLocation] = useState("Makati City");
  const [setup, setSetup] = useState("Hybrid");
  const [pay, setPay] = useState("₱15,000 / month");
  const [preview, setPreview] = useState<{ png: string; svg: string }>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [revision, setRevision] = useState(0);
  const [showBorders, setShowBorders] = useState(false);
  const backgrounds = PUBMAT_DESIGNS[theme].backgrounds;

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    const timer = setTimeout(() => {
      void renderPubmatArtifact(
        {
          company: "Northstar Media",
          title,
          description,
          location,
          workMode: setup,
          pay,
          backgroundImage: background,
          link: "https://betterinternship.com/",
        },
        theme,
        showBorders,
      )
        .then(({ blob, svg }) => {
          if (cancelled) return;
          setPreview({
            png: URL.createObjectURL(blob),
            svg: URL.createObjectURL(
              new Blob([svg], { type: "image/svg+xml" }),
            ),
          });
          setError("");
        })
        .catch((reason: unknown) => {
          if (!cancelled)
            setError(
              reason instanceof Error ? reason.message : "Rendering failed.",
            );
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    theme,
    background,
    title,
    description,
    location,
    setup,
    pay,
    revision,
    showBorders,
  ]);

  useEffect(
    () => () => {
      if (preview) {
        URL.revokeObjectURL(preview.png);
        URL.revokeObjectURL(preview.svg);
      }
    },
    [preview],
  );

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-white p-2 text-sm";
  return (
    <main className="mx-auto max-w-7xl space-y-5 p-5">
      <header>
        <h1 className="text-xl font-semibold">
          Poster playground · development only
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Edit the template in VS Code and save. This preview regenerates the
          actual Satori/resvg export, not a browser approximation.
        </p>
        <code className="mt-2 block break-all text-xs">
          {PUBMAT_DESIGNS[theme].templatePath}
        </code>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <label className="block space-y-1 text-sm">
            Theme
            <select
              className={inputClass}
              value={theme}
              onChange={(event) => {
                const next = event.target.value as PubmatDesign;
                setTheme(next);
                setBackground(PUBMAT_DESIGNS[next].backgrounds[0].id);
              }}
            >
              {PUBMAT_DESIGN_IDS.map((id) => (
                <option key={id} value={id}>
                  {PUBMAT_DESIGNS[id].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            Background
            <select
              className={inputClass}
              value={background}
              onChange={(event) => setBackground(event.target.value)}
            >
              {backgrounds
                .filter((item) => item.src)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            Title
            <input
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            Description
            <textarea
              className={inputClass}
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          {[
            { label: "Location", value: location, set: setLocation },
            { label: "Work mode", value: setup, set: setSetup },
            { label: "Pay", value: pay, set: setPay },
          ].map((field) => (
            <label key={field.label} className="block space-y-1 text-sm">
              {field.label}
              <input
                className={inputClass}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </label>
          ))}
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => setRevision((value) => value + 1)}
          >
            Render again
          </button>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showBorders}
              onChange={(event) => setShowBorders(event.target.checked)}
            />
            Show component borders
          </label>
          {showBorders && (
            <p className="text-xs text-gray-500">
              Layout debug outlines are included in PNG/SVG downloads while
              enabled.
            </p>
          )}
          <p className="text-xs text-gray-500">
            Blank optional fields disappear. Sample data stays in this page
            only. The QR uses the homepage for testing.
          </p>
        </aside>
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span role="status">
              {busy
                ? "Rendering…"
                : error
                  ? "Render failed — last good preview retained"
                  : "1080 × 1080 · actual export"}
            </span>
            {preview && (
              <div className="flex gap-3">
                <a
                  href={preview.png}
                  download="poster-playground.png"
                  className="underline"
                >
                  PNG
                </a>
                <a
                  href={preview.svg}
                  download="poster-playground.svg"
                  className="underline"
                >
                  SVG
                </a>
              </div>
            )}
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          {preview ? (
            <img
              src={preview.png}
              alt="Actual generated poster"
              className="h-auto w-full max-w-[760px] border shadow-sm"
            />
          ) : (
            <div
              className="aspect-square max-w-[760px] bg-gray-100"
              aria-busy={busy}
            />
          )}
        </section>
      </div>
    </main>
  );
}
