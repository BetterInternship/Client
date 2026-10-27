# Poster themes

Both themes use client-side JSX → Satori → SVG previews. PNG export rasterizes
the exact preview SVG through resvg only when an image action is requested.

- `jsx-renderer.ts`: shared fonts, self-contained images, SVG rendering and PNG export.
- `designs.ts`: registry of themes, backgrounds, editor capabilities and lazy JSX templates.
- `assets.ts`: shared background selection and logo preparation.
- `asset-cache.ts`: bounded, short-lived caches for embedded images and prepared logos.
- `preview.ts`: SVG preview snapshots and memoized on-demand PNG exports.
- `qr-image.ts`: shared transparent, padding-free QR generation.
- `centered/template.tsx`: vertically/horizontally centered group composition.
- `studio/template.tsx`: Studio photo's bottom-anchored group composition.
- Each theme contains only `template.tsx` and `config.ts`: its layout, tokens,
  backgrounds, logo settings, QR size and overflow limits.
- Root `render.ts`: prepares assets, checks configured layout limits and exports
  every theme through the same pipeline for production and the playground.
- `worker-client.ts` / `render.worker.ts`: keep layout and PNG export off the UI
  thread. `render-prepared.ts` is the DOM-free entry shared with the fallback for
  browsers without Web Workers. Obsolete previews are cancelled; unused queued
  jobs are discarded. Fit checks use dimensioned image placeholders and skip
  glyph outlines; only the passing layout embeds the real image assets.

## Adding a theme

1. Add a JSX template using Satori-supported flex styles, group gaps and alignment.
2. Use `PosterTemplateProps`: listing `data`, prepared `assets`, and a text-fit
   `adjustment`. Put icons directly in JSX using Lucide.
3. Add config for backgrounds, logo policy, QR size and limits for `data-poster`
   nodes. These are overflow checks, not coordinates for placing content.
4. Register its label, template path, config and lazy template loader in
   `designs.ts`. No per-theme renderer or UI branching is needed.
5. Verify native/feed PNG output. Existing public image URLs can stay unchanged;
   the historical `/pubmat/v2/` path is only an asset location, not another engine.

Keep image preparation separate from layout. Canvas may trim image alpha margins,
but should not place or draw poster content. Preview, download and share use the
same SVG snapshot; image actions memoize its full-resolution PNG conversion.
Opening the native share menu may prepare a PNG to preserve user activation for
the subsequent share tap. No PNG/WASM work is needed for ordinary text editing.

The former Studio Canvas renderer has been removed after migration. Both active
themes export through `jsx-renderer.ts`; no legacy layout renderer is retained.
