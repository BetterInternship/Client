# Poster themes

Both offered themes use the client-side JSX → Satori → resvg → PNG pipeline.

- `jsx-renderer.ts`: shared fonts, self-contained images, SVG rendering and PNG export.
- `designs.ts`: registry of themes, backgrounds, editor capabilities and lazy JSX templates.
- `assets.ts`: shared background selection and logo preparation.
- `qr-image.ts`: shared transparent, padding-free QR generation.
- `centered/template.tsx`: vertically/horizontally centered group composition.
- `studio/template.tsx`: Studio photo's bottom-anchored group composition.
- Each theme contains only `template.tsx` and `config.ts`: its layout, tokens,
  backgrounds, logo settings, QR size and overflow limits.
- Root `render.ts`: prepares assets, checks configured layout limits and exports
  every theme through the same pipeline for production and the playground.

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
but should not place or draw poster content. Preview, download and share all use
the same generated PNG bytes.

The former Studio Canvas renderer has been removed after migration. Both active
themes export through `jsx-renderer.ts`; no legacy layout renderer is retained.
