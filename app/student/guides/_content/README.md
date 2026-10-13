# Guides publishing

Articles live alongside their routes in `app/student/guides/_content`. The underscore makes this a private, non-routable Next.js folder.

The launch library is the resume, internship-fit, and interview guide. These articles are marked published and eligible for the next deployment. Editing these files does not deploy them.

## How the system works

**Write Markdown → mark published → deploy → serve generated pages.**

The source articles are files in this repository, not database records. Next.js reads them while generating pages, and Vercel stores the built pages in the deployment/cache. Editing a local file does not update the live site until you deploy. Because Guides shares the student root layout, its cached reference-data dependency can cause periodic page revalidation using the deployed files. It is not a Markdown parse or database query on every visit.

`guide-content-loader.ts` reads and prepares article files. It runs only on the Next.js build/server side, not as a separate server or API. React `cache()` deduplicates loading within server rendering; it is not permanent storage. The browser receives rendered content, with small interactive controls for copying and analytics.

### File map (paths relative to Code-Client)

| File                                      | Responsibility                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| `app/student/guides/_content/*.md`        | Article metadata and body; filename determines its public slug              |
| `lib/guides/guide-content-loader.ts`      | Reads files, parses YAML, checks links, sorts and filters visibility        |
| `lib/guides/content.ts`                   | Validates metadata; generates unique heading IDs, TOC data and reading time |
| `app/student/guides/layout.tsx`           | Visual wrapper within the shared student root                               |
| `app/student/guides/page.tsx`             | Library and landing-page Discord CTA                                        |
| `app/student/guides/[slug]/page.tsx`      | Eligible static paths, SEO metadata and article loading                     |
| `app/student/guides/[slug]/not-found.tsx` | Unavailable-article presentation                                            |
| `components/guides/guides-shell.tsx`      | Shared landing navigation, background, skip link and footer                 |
| `components/guides/guide-card.tsx`        | Library card using the shared landing Card and desktop subgrid alignment    |
| `components/guides/guide-article.tsx`     | Reading layout, JSON-LD and related guides                                  |
| `components/guides/guide-body.tsx`        | Server Markdown rendering, Tailwind Typography, tables and templates        |
| `components/guides/guide-toc.tsx`         | Native heading links and mobile disclosure                                  |
| `components/guides/guide-actions.tsx`     | Client clipboard and minimal click analytics; shared Button/LinkButton      |

### Frontmatter fields

| Field         | Meaning                                                   |
| ------------- | --------------------------------------------------------- |
| `title`       | Article/card heading and SEO title                        |
| `description` | Article introduction and search/social description        |
| `category`    | Breadcrumb context, not an extra category route           |
| `takeaway`    | Card summary                                              |
| `order`       | Library sorting, with slug as a tie-breaker               |
| `image`       | Optional future artwork; current cards are text-only      |
| `author`      | Optional; defaults to BetterInternship Team               |
| `status`      | `draft` or `published`                                    |
| `publishedAt` | Quoted ISO date for published content; null for drafts    |
| `updatedAt`   | Quoted substantive revision date or null                  |
| `related`     | Existing article filenames without `.md`; omit self-links |

## Preview and review

`tags` is an optional list of article topics (for example, `[Philippines, OJT resume]`). These populate Open Graph article tags and Article structured-data keywords; they are not displayed as badges on the cards. Tags describe content, not a ranking guarantee.

Optional frontmatter fields: `seoTitle` overrides the search/social title, `nextStep` customizes the closing advice, and `archived: true` hides an article from both preview and production. Archived articles should not be linked from visible articles.

`ctaTitle` and `ctaLabel` optionally customize the closing heading and marketplace button. The destination stays the existing `/search` route.

For accordion FAQs, add a `faqs` list in frontmatter, with `question` and `answer` strings for each item. Keep `## Questions you might still have` in the body where the accordion should appear; do not duplicate the answers below it. This reuses the landing page's `FaqList` and preserves the heading's table-of-contents anchor. FAQ text is included in the reading-time estimate.

- `npm run dev`, then open `/guides`.
- For a local production-mode preview, set `GUIDES_PREVIEW=true` **both when building and starting**. All Guides pages are noindex in this mode. Use this only locally or in an access-controlled preview deployment.
- `VERCEL_ENV=production` always disables draft preview. No public URL/query parameter enables it.
- In a regular production build with no published articles, the library displays its coming-soon state; draft URLs return 404.

## Publish an article

1. Review the Markdown body, examples, product claims, and cited source sections.
2. In the Markdown file's frontmatter, set `status: published` and `publishedAt` to the actual publication date as a quoted string (`"YYYY-MM-DD"`). Set `updatedAt` to null initially.
3. Publish linked launch articles together, or remove body links to drafts. Related cards are automatically filtered, but an explicit body link to an unpublished guide fails validation.
4. Run TypeScript, focused lint, and a production build. Verify metadata, sitemap and an unknown URL's 404.
5. Deploy using the normal release process. Do not enable `GUIDES_PREVIEW` on the public production site.

For a substantial update, keep `publishedAt` and set `updatedAt` to the revision date. Do not update dates for unrelated deployments. Scheduled dates are excluded until eligible at render/build time; redeploy when publishing rather than relying on midnight cache expiry.

## Add an article

- Add a lowercase kebab-case `.md` file with YAML frontmatter. The filename determines the slug; no manifest entry is needed. Copy an existing article's metadata fields, including `order`. Publication dates must be quoted strings. Author defaults to BetterInternship Team.
- The template supplies H1. Start the body with a concise at-a-glance blockquote and use H2/H3 sections.
- Plain Markdown/GFM only; no executable MDX or raw HTML. Fenced text blocks become editable template fields with Copy buttons. Edits stay on the current page, are not saved or sent to analytics, and disappear on navigation/reload. The textarea supports manual editing/selection without JavaScript.
- Heading anchors use `guide-` plus the normalized heading. Duplicate headings receive suffixes. TOC and rendered IDs use the same function.
- Use relative `/guides/...` links for other guides and `/search` for the marketplace. Reference only real public routes.
- Keep facts attributable; label fictional examples, avoid invented metrics, and verify OJT sources against the student's applicable program rather than making universal claims.

## Maintenance

### Resume PDF

The resume guide's `## See an example resume` heading renders `ResumeDownload`. The static A4 example PDF and its preview are in `public/guide-resources/`. They download directly, without generating a PDF per visitor. `guide-resources` is excluded from host rewrites so PDF URLs resolve as public files. The sample uses explicitly fictional details; students should borrow its structure, not its achievements.

The finished PDF and PNG preview are maintained as static assets. The one-off generation script and dependency have been removed. If the example is replaced later, update both assets together so the preview matches the download. The downloaded sample is not a fillable template.

Owner: BetterInternship team. Recheck requirements before publication and quarterly thereafter, or when relevant guidance changes. The approved topic roadmap is in `ai/plans/guides-launch.md` at the workspace root.

Guides live under `app/student/guides` and share the student root layout for seamless navigation. Article paths are pre-generated at deployment, but inherit the student layout's cached reference-data dependency and revalidation interval. Direct entry uses the lightweight public route shell; once the application is activated, its providers remain mounted across navigation. Content edits are published through deployments.
