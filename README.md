# BetterInternship

A comprehensive internship platform connecting students with employers.

## Installing dependencies
```bash
npm install --legacy-peer-deps
```

## Running Locally
```bash
npm run dev
```

## Jest Testing
```bash
npm run test
```

## Link-preview gallery

```bash
npm run preview:og
```

Opens a local gallery at `http://127.0.0.1:3200` with the actual Top-page OG
images, sample data, and link-card shells. No API, login, or Next dev server is
needed. Internet access is required for the preview fonts. Includes long titles,
single listings, and empty collections.

Restart the command after editing the OG route. Set `OG_PREVIEW_PORT` to change
the port or `OG_PREVIEW_NO_OPEN=1` to skip opening the browser. Press Ctrl+C to stop.
