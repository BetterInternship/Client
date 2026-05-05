"use client";

import {
  ArrowRight,
  Bot,
  Brain as BrainIcon,
  CalendarDays,
  Check,
  CirclePlay,
  Database,
  File,
  FileSearch,
  Folder,
  Github,
  Home,
  Inbox,
  ListChecks,
  Mail,
  MessageCircle,
  Network,
  PanelsTopLeft,
  Search,
  Send,
  Slack,
  Sparkles,
  Table2,
  Workflow,
} from "lucide-react";

const updates = [
  ["Q2 Planning", "Google Docs", "Document", "2m ago"],
  ["Product Roadmap", "Notion", "Page", "15m ago"],
  ["Customer Research", "Google Sheets", "Database", "1h ago"],
  ["Design System", "Figma", "File", "3h ago"],
  ["Interview Notes", "Notion", "Page", "5h ago"],
  ["Usage Metrics", "Google Sheets", "Database", "1d ago"],
];

const sidebarItems = [
  ["Home", Home],
  ["Pages", File],
  ["Databases", Database],
  ["Files", Folder],
  ["Agents", Bot],
  ["Tasks", ListChecks],
  ["Connections", Network],
];

const agents = [
  ["Research Agent", "Finds what you need", Search],
  ["Data Analyst", "Answers with your data", Table2],
  ["Write Assistant", "Drafts and improves", File],
  ["Summarizer", "Condenses and explains", PanelsTopLeft],
  ["Task Builder", "Turns ideas into tasks", ListChecks],
  ["File Finder", "Searches across everything", FileSearch],
];

const integrations = [
  ["Slack", Slack, "text-[#36C5F0]"],
  ["Gmail", Mail, "text-[#D93025]"],
  ["Google Drive", Folder, "text-[#1A73E8]"],
  ["Notion", File, "text-[#111111]"],
  ["Figma", Workflow, "text-[#A259FF]"],
  ["Asana", Check, "text-[#F06A6A]"],
  ["HubSpot", Network, "text-[#FF7A59]"],
  ["GitHub", Github, "text-[#111111]"],
  ["Dropbox", Folder, "text-[#0061FF]"],
];

const primitiveCards = [
  {
    title: "Docs",
    body: "Bring your docs, wikis, and notes into one place.",
    icon: File,
    className: "bg-white",
    art: "stacked pages",
  },
  {
    title: "Databases",
    body: "Connect and organize structured data.",
    icon: Database,
    className: "bg-[#FBFBF5]",
    art: "soft grid",
  },
  {
    title: "Files",
    body: "Find and organize every file.",
    icon: Folder,
    className: "bg-white",
    art: "folder cluster",
  },
  {
    title: "Agents",
    body: "Let AI agents search, update, and act for you.",
    icon: Bot,
    className: "bg-[#F7FAF1]",
    art: "node map",
  },
];

const timeline = [
  ["Capture", "Bring docs, files, data, and chats into Brain."],
  ["Connect", "Brain understands and keeps things in sync."],
  ["Act", "Brain and agents take action across your context."],
  ["Move forward", "Spend less time maintaining systems."],
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-[#111111] ${className}`}>
      <BrainIcon className="h-8 w-8 stroke-[1.35]" />
      <span className="font-serif text-[28px] leading-none">Brain</span>
    </div>
  );
}

function DottedCurve({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className={`absolute top-16 hidden h-28 w-44 text-[#4F8A3D] md:block ${
        flip ? "right-8 scale-x-[-1]" : "left-8"
      }`}
      viewBox="0 0 180 110"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 26 C54 8 50 86 92 65 C127 48 119 95 168 83"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 5"
      />
      <circle cx="168" cy="83" r="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function HeroDoodles() {
  return (
    <>
      <div className="absolute left-[7%] top-32 hidden text-[#4F8A3D] lg:block">
        <BrainIcon className="h-24 w-24 stroke-[#536056] stroke-[1.1]" />
        <DottedCurve />
      </div>
      <div className="absolute right-[9%] top-36 hidden text-[#4F8A3D] lg:block">
        <div className="relative h-28 w-28">
          <Network className="absolute inset-8 h-12 w-12 stroke-[#4F8A3D] stroke-[1.3]" />
          {[["left-0 top-10"], ["right-0 top-10"], ["left-10 top-0"], ["left-10 bottom-0"]].map(
            ([pos]) => (
              <span
                key={pos}
                className={`absolute ${pos} h-3 w-3 rounded-full border border-[#4F8A3D] bg-[#FAF8F2]`}
              />
            ),
          )}
        </div>
        <DottedCurve flip />
      </div>
    </>
  );
}

function ProductMockup() {
  return (
    <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_28px_90px_rgba(17,17,17,0.08)]">
        <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[230px_1fr_300px]">
          <aside className="hidden border-r border-black/10 bg-[#FBFAF6] p-6 lg:flex lg:flex-col">
            <div className="mb-7 flex items-center justify-between">
              <Logo className="[&>svg]:h-6 [&>svg]:w-6 [&>span]:text-xl" />
              <span className="text-[#5F625C]">⌄</span>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map(([label, Icon], index) => (
                <div
                  key={label as string}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    index === 0
                      ? "bg-[#F1EEE8] text-[#111111]"
                      : "text-[#3E423B]"
                  }`}
                >
                  <Icon className="h-4 w-4 stroke-[1.6]" />
                  {label as string}
                </div>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-3 pt-10">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#DDE8D2] text-sm font-semibold text-[#4F8A3D]">
                A
              </div>
              <div>
                <p className="text-sm font-medium leading-tight text-[#111111]">
                  Alex Morgan
                </p>
                <p className="text-xs leading-tight text-[#73766F]">
                  Personal workspace
                </p>
              </div>
            </div>
          </aside>

          <main className="p-5 sm:p-7">
            <div className="mb-7 flex items-center gap-8 border-b border-black/10 text-sm text-[#73766F]">
              {["Page", "Overview", "Files", "Activity"].map((tab, index) => (
                <span
                  key={tab}
                  className={`pb-3 ${
                    index === 0
                      ? "border-b-2 border-[#111111] font-medium text-[#111111]"
                      : ""
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-3xl text-[#111111]">
                    Recent updates
                  </h2>
                  <span className="rounded-full bg-[#EEF5E7] px-3 py-1 text-xs font-medium text-[#4F8A3D]">
                    Live
                  </span>
                </div>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5F625C]">
                  A snapshot of your work — everything you&apos;ve added,
                  created, or connected across your workspace.
                </p>
              </div>
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {["All updates", "All sources", "All workspaces"].map((filter) => (
                <button
                  key={filter}
                  className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs text-[#5F625C]"
                >
                  {filter} ⌄
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-black/10">
              <div className="grid grid-cols-[1.2fr_.9fr_.75fr_.6fr] bg-[#FBFAF6] px-4 py-3 text-xs font-medium text-[#73766F]">
                <span>Item</span>
                <span>Source</span>
                <span>Type</span>
                <span>Updated</span>
              </div>
              {updates.map(([item, source, type, time]) => (
                <div
                  key={item}
                  className="grid grid-cols-[1.2fr_.9fr_.75fr_.6fr] border-t border-black/10 px-4 py-3 text-xs sm:text-sm"
                >
                  <span className="font-medium text-[#111111]">{item}</span>
                  <span className="text-[#5F625C]">{source}</span>
                  <span className="text-[#5F625C]">{type}</span>
                  <span className="text-[#5F625C]">{time}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Meeting Notes", "Transcribed", Inbox],
                ["Q2 Forecast", "Updated", CalendarDays],
                ["Budget Tracker", "Synced", Database],
              ].map(([title, meta, Icon]) => (
                <div
                  key={title as string}
                  className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-4"
                >
                  <Icon className="h-5 w-5 text-[#4F8A3D]" />
                  <div>
                    <p className="text-sm font-medium leading-tight text-[#111111]">
                      {title as string}
                    </p>
                    <p className="text-xs text-[#73766F]">{meta as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>

          <aside className="border-t border-black/10 bg-white p-5 sm:p-7 lg:border-l lg:border-t-0">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#4F8A3D]" />
              <h3 className="font-medium text-[#111111]">Agents</h3>
            </div>
            <div className="space-y-3">
              {agents.map(([title, body, Icon]) => (
                <div
                  key={title as string}
                  className="flex gap-3 rounded-xl border border-black/10 p-3"
                >
                  <Icon className="mt-0.5 h-5 w-5 text-[#3E423B]" />
                  <div>
                    <p className="text-sm font-medium text-[#111111]">
                      {title as string}
                    </p>
                    <p className="text-xs leading-5 text-[#73766F]">
                      {body as string}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex items-center gap-2 rounded-xl border border-black/10 bg-[#FBFAF6] p-3">
              <span className="flex-1 text-sm text-[#9A9D96]">
                Ask Brain anything...
              </span>
              <Send className="h-4 w-4 text-[#111111]" />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ConnectorDiagram() {
  return (
    <div className="relative mx-auto grid max-w-2xl grid-cols-[1fr_120px_1fr] items-center gap-5">
      <div className="space-y-7">
        {[
          ["Emails", Mail],
          ["Chats", MessageCircle],
          ["Calendar", CalendarDays],
        ].map(([label, Icon]) => (
          <div key={label as string} className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-[#5F625C]" />
            <span className="text-sm text-[#111111]">{label as string}</span>
            <span className="h-px flex-1 border-t border-dotted border-[#4F8A3D]" />
          </div>
        ))}
      </div>
      <div className="grid aspect-square place-items-center rounded-full bg-[#E3EBD8]">
        <BrainIcon className="h-16 w-16 stroke-[#536056] stroke-[1.1]" />
      </div>
      <div className="space-y-7">
        {[
          ["Docs", File],
          ["Files", Folder],
          ["Tools", Workflow],
        ].map(([label, Icon]) => (
          <div key={label as string} className="flex items-center gap-3">
            <span className="h-px flex-1 border-t border-dotted border-[#4F8A3D]" />
            <Icon className="h-5 w-5 text-[#5F625C]" />
            <span className="text-sm text-[#111111]">{label as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrimitiveArt({ art }: { art: string }) {
  if (art === "soft grid") {
    return <div className="h-20 rounded border border-[#DDE8D2] bg-[linear-gradient(#DDE8D2_1px,transparent_1px),linear-gradient(90deg,#DDE8D2_1px,transparent_1px)] bg-[size:24px_18px]" />;
  }

  if (art === "folder cluster") {
    return (
      <div className="relative h-20">
        <Folder className="absolute left-2 top-3 h-16 w-16 fill-[#EFEBDD] stroke-[#D8D1C1]" />
        <File className="absolute right-6 top-2 h-8 w-8 stroke-[#D8D1C1]" />
        <File className="absolute right-1 top-8 h-8 w-8 stroke-[#D8D1C1]" />
      </div>
    );
  }

  if (art === "node map") {
    return (
      <div className="relative h-20 text-[#4F8A3D]">
        <Network className="mx-auto h-16 w-16 stroke-[1.2]" />
      </div>
    );
  }

  return (
    <div className="relative h-20">
      <File className="absolute left-5 top-1 h-16 w-14 fill-[#FBFAF6] stroke-[#D8D1C1]" />
      <File className="absolute left-8 top-4 h-16 w-14 fill-white stroke-[#D8D1C1]" />
    </div>
  );
}

export default function BrainLandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FAF8F2] text-[#111111]">
      <header className="mx-auto flex max-w-7xl items-center px-6 py-8 sm:px-10 lg:px-12">
        <Logo />
      </header>

      <section className="relative px-6 pb-8 pt-10 text-center sm:px-10 lg:px-12">
        <HeroDoodles />
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-medium text-[#5F625C] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#4F8A3D]" />
            AI-native workspace
          </div>
          <h1 className="font-serif text-[44px] font-normal leading-[1.04] text-[#111111] sm:text-[64px] lg:text-[76px]">
            One Brain for everything you know — and{" "}
            <span className="text-[#4F8A3D]">everything your agents do.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#5F625C] sm:text-lg">
            Brain brings docs, databases, files, and agents into one connected
            workspace — so your context is organized, remembered, and ready to
            act on.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button className="rounded-xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2A2A2A]">
              Get started
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#111111] shadow-sm">
              <CirclePlay className="h-4 w-4" />
              Watch a demo
            </button>
          </div>
        </div>
      </section>

      <ProductMockup />

      <section className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-sm text-[#5F625C]">
          Works with the tools you already use
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {integrations.map(([name, Icon, color]) => (
            <div
              key={name as string}
              className="flex items-center gap-2 text-sm font-medium text-[#3E423B]"
            >
              <Icon className={`h-4 w-4 ${color as string}`} />
              {name as string}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F1F4E9] px-6 py-24 sm:px-10 lg:px-12">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="max-w-xl font-serif text-4xl font-normal leading-tight text-[#111111] sm:text-5xl">
              Your context is everywhere. Brain brings it together.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#5F625C]">
              Emails, chats, docs, files, and tools each hold a piece of the
              picture. Brain connects the dots so your context becomes useful.
            </p>
          </div>
          <ConnectorDiagram />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {primitiveCards.map((card) => (
            <article
              key={card.title}
              className={`min-h-[250px] rounded-2xl border border-black/10 p-7 shadow-[0_16px_50px_rgba(17,17,17,0.04)] ${card.className}`}
            >
              <PrimitiveArt art={card.art} />
              <card.icon className="mb-5 mt-3 h-6 w-6 text-[#4F8A3D]" />
              <h3 className="font-serif text-2xl font-normal text-[#111111]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#5F625C]">
                {card.body}
              </p>
              <a className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#111111]">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_70px_rgba(17,17,17,0.06)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-black/10 p-8 sm:p-12 lg:border-b-0 lg:border-r">
            <h2 className="max-w-md font-serif text-4xl font-normal leading-tight text-[#111111]">
              Ask Brain to do the work around your work.
            </h2>
            <div className="mt-8 space-y-4">
              {[
                "Summarize my unread emails",
                "Find decisions from last quarter",
                "Pull research for a new project",
                "Draft a brief from my recent notes",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-[#5F625C]">
                  <ArrowRight className="h-4 w-4 text-[#4F8A3D]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#FBFAF6] p-8 sm:p-12">
            <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-3xl font-normal text-[#111111]">
                    Q2 Planning Summary
                  </h3>
                  <p className="mt-1 text-xs text-[#73766F]">
                    Generated by Research Agent
                  </p>
                </div>
                <span className="rounded-full bg-[#EEF5E7] px-3 py-1 text-xs font-medium text-[#4F8A3D]">
                  Complete
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Key decisions", "12"],
                  ["Open items", "3"],
                  ["Risks identified", "3"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-black/10 p-4">
                    <p className="text-xs text-[#73766F]">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-[#111111]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium text-[#111111]">Summary</p>
                <p className="mt-2 text-sm leading-7 text-[#5F625C]">
                  Q2 execution is on track across core initiatives. Priorities:
                  launch, adoption, and platform stability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[250px_1fr]">
          <h2 className="font-serif text-4xl font-normal leading-tight text-[#111111] sm:text-5xl">
            From context to action.
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {timeline.map(([title, body], index) => (
              <div key={title} className="relative text-center">
                {index < timeline.length - 1 && (
                  <span className="absolute left-1/2 top-6 hidden h-px w-full translate-x-8 border-t border-dotted border-[#4F8A3D] md:block" />
                )}
                <div className="relative mx-auto grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-white font-serif text-lg text-[#111111]">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-sm font-semibold text-[#111111]">
                  {title}
                </h3>
                <p className="mx-auto mt-2 max-w-[170px] text-xs leading-5 text-[#5F625C]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 lg:px-8">
        <div className="relative overflow-hidden rounded-[26px] border border-black/10 bg-[#DDE8D2] p-8 shadow-[0_24px_80px_rgba(79,138,61,0.14)] sm:p-12">
          <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_30%,rgba(255,255,255,.85),transparent_24%),radial-gradient(circle_at_85%_30%,rgba(255,255,255,.55),transparent_28%),radial-gradient(circle_at_70%_90%,rgba(79,138,61,.18),transparent_32%)]" />
          <div className="relative grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-serif text-5xl font-normal leading-tight text-[#111111] sm:text-6xl">
                Start with one Brain.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#5F625C]">
                Your context. Your space. Ready for action.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button className="rounded-xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white shadow-sm">
                  Get started
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/70 px-6 py-3 text-sm font-semibold text-[#111111]">
                  <CirclePlay className="h-4 w-4" />
                  Watch a demo
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_130px_1fr] items-center gap-5">
              <div className="space-y-4">
                {["Docs", "Databases", "Files"].map((label) => (
                  <div key={label} className="flex items-center justify-end gap-3">
                    <span className="rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm font-medium">
                      {label}
                    </span>
                    <span className="h-px w-10 border-t border-dotted border-[#4F8A3D]" />
                  </div>
                ))}
              </div>
              <div className="grid aspect-square place-items-center rounded-full bg-[#C9DDB8]">
                <BrainIcon className="h-16 w-16 stroke-[#536056] stroke-[1.15]" />
              </div>
              <div className="space-y-4">
                {["Agents", "Tasks", "Pages"].map((label) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="h-px w-10 border-t border-dotted border-[#4F8A3D]" />
                    <span className="rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm font-medium">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#F8F6EF] px-6 py-16 sm:px-10 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.3fr_2fr_1.2fr]">
          <div>
            <Logo className="[&>svg]:h-7 [&>svg]:w-7 [&>span]:text-2xl" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#5F625C]">
              The AI-native workspace for everything you know and everything
              your agents do.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              ["Product", "Docs", "Databases", "Files", "Agents"],
              ["Use cases", "Personal brain", "Team hub", "Research", "Ops"],
              ["Resources", "Guides", "Templates", "Changelog", "Support"],
              ["Company", "About", "Careers", "Privacy", "Terms"],
            ].map(([heading, ...links]) => (
              <div key={heading}>
                <h3 className="text-sm font-semibold text-[#111111]">{heading}</h3>
                <div className="mt-4 space-y-3">
                  {links.map((link) => (
                    <a key={link} className="block text-sm text-[#5F625C]">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">Stay in sync</h3>
            <div className="mt-4 flex rounded-xl border border-black/10 bg-white p-1">
              <input
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none focus:ring-0"
                placeholder="Email address"
              />
              <button className="rounded-lg bg-[#111111] px-4 py-2 text-sm font-semibold text-white">
                Join
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
