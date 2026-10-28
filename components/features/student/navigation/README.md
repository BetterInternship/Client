# Student navigation

One local navigation module for the student site. The visual foundation preserves the landing header; the icon/label account controls are adapted from `Package.Components/src/components/ui/app-header.tsx`.

## Responsibilities

- `student-navigation.tsx`: top header, desktop resource links, account dropdown, and login entry point.
- `student-bottom-navigation.tsx`: the existing compact mobile tab-bar design, driven by shared destinations and route policy.
- `navigation-config.ts`: typed presets, path normalization, active states, Forms-aware destinations, and route visibility.
- `navigation-behavior.tsx`: observes the shell's `data-student-scroll` container, with scroll thresholds and focus/menu safeguards.
- `task-search-navigation.tsx`: search URL state, debounce, and filters. Dynamically imported only for the search task by the app header adapter.
- `use-navigation-avatar.ts`: account-scoped desktop avatar resolution, shared through TanStack Query.

## Configuration

```tsx
<StudentNavigation
  preset="editorial"
  config={{
    desktop: "sticky", // "static" | "sticky" | "hide-on-scroll"
    mobile: "hide-on-scroll",
    surface: "transparent", // "solid" | "transparent" | "translucent"
    solidAfter: 160, // scroll offset; not automatic hero-element detection
  }}
  links={[
    { label: "Guides", href: "/guides" },
    { label: "For Companies", href: hireUrl },
  ]}
/>
```

Use `public`, `editorial`, or `app` as a starting preset. Visual tokens are the existing `landing-*` tokens in `app/globals.css`. Root styling can be extended through `className`; task search is an optional `search` slot. Changes to positioning, resource destinations/order, and surface treatment do not require editing the renderer.

Default desktop resources appear on landing, Guides, and Top—not other app pages. Both links appear beside the brand from 768px upward; there is no More menu. The brand always returns to landing. Public/editorial headers keep the wordmark on mobile; app headers show only the logo icon below 768px. Mobile account controls show Log in for guests; verified students use the bottom Account menu. Search also has a mobile header search icon. Landing and Guides do not get a bottom bar.

On mobile Search, a header search icon opens the existing search/filter overlay instead of a separate search bar. Landing and Guides headers are static on desktop and mobile; Top is static on mobile and sticky on desktop. Search stays sticky. Headers span the viewport with 16px mobile and 24px desktop side padding. The bottom bar overlays content and slides offscreen without reserving a blank strip or resizing the scroll viewport.

Navigation configuration is presentation, not authorization. Built-in signed-in controls depend on the verified shared session. Forms is capability-filtered. Backend authorization remains mandatory.

## Session and background work

`StudentFoundation` owns one memory-only QueryClient and one profile/session query above the public/app route selector. There is no student cache hydration from legacy persisted private records. The recruiter provider is unchanged.

The app shell stays activated during same-account public navigation. Account identity scopes private query keys, tracked jobs, and global account dialogs. Public/Top/search page content does not remount merely because session verification completes. Private page content (profile, forms, applications, Discord setup) resets on identity changes so local editors and selections cannot carry across accounts; background jobs remain owned above that page boundary.

`app/student/student-page-layout.tsx` selects page chrome and session-gate placement. The bottom navigation remains outside its scrolling content in `StudentAppShell`.

Tracked form jobs use `bi.mq-jobs.form-fillout:<userId>`, validated on restore and retained for up to seven days. Legacy ownerless entries are discarded, not assigned to the next account. Browser tracking stops without verified identity; server jobs are not cancelled. Completion reconciliation runs outside Forms as well.

## Checks

```powershell
node --test tests/student-navigation/session-contract.test.cjs
.\node_modules\.bin\tsc.cmd --noEmit --incremental false
```

Local automated browser checks with simulated sessions are not substitutes for real OAuth, two-account switching, form generation/signing, or production-like mobile checks on the dev site. Top runtime/budget work remains a separate release gate; this refactor alone is not a measured performance improvement.
