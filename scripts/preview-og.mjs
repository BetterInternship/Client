import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { platform } from "node:process";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Render the real route with sample data, not a separately maintained mock image.
// This standalone, localhost-only tool needs neither Next dev nor the API.
const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
const require = createRequire(import.meta.url);
const port = Number(process.env.OG_PREVIEW_PORT || 3200);
// Every Top page belongs to a university; a sample can name its own to try a
// long one.
const sampleUniversity = "De La Salle University - Manila";
const universityOf = (sample) => sample.university ?? sampleUniversity;
const samples = [
  {
    name: "Data Science",
    count: 5,
    companies: ["Canva", "Globe", "Accenture"],
  },
  {
    name: "Design",
    count: 10,
    companies: ["Canva", "Kumu", "Sprout Solutions"],
  },
  { name: "Software Engineering", count: 8, companies: ["Globe", "Accenture"] },
  {
    name: "Business Development and Communications",
    university: "Polytechnic University of the Philippines - Sta. Mesa",
    count: 12,
    companies: ["Example Company", "Another Company"],
  },
  { name: "Marketing", count: 1, companies: ["Example Company"] },
  { name: "Finance", count: 0, companies: [] },
];

function load(file, imports = {}) {
  const code = ts.transpileModule(readFileSync(resolve(root, file), "utf8"), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const context = {
    exports: {},
    process,
    Response,
    URL,
    fetch,
    require: (name) => imports[name] ?? require(name),
  };
  runInNewContext(code, context, { filename: file });
  return context.exports;
}

const heading = load("lib/utils/top-page-heading.ts");
const week = load("lib/utils/manila-week.ts");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
const images = new Map();

async function render(index) {
  const sample = samples[index];
  const route = load("app/student/[university]/top/[slug]/og/route.tsx", {
    "@/lib/utils/top-page-heading": heading,
    "@/lib/utils/manila-week": week,
    "@/lib/api/top-page.server": {
      fetchTopUniversityPage: async () => ({
        status: "ok",
        page: { name: sample.name, slug: "preview" },
        university: { name: universityOf(sample), slug: "preview-university" },
        jobs: Array.from({ length: sample.count }, (_, i) => ({
          employer: { name: sample.companies[i % sample.companies.length] },
        })),
      }),
    },
  });
  const response = await route.GET(
    new Request(`http://localhost:${port}/preview-university/top/preview/og`),
    {
      params: Promise.resolve({
        university: "preview-university",
        slug: "preview",
      }),
    },
  );
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("image/png")
  ) {
    throw new Error(
      "OG rendering failed. Check your connection to Google Fonts, then refresh.",
    );
  }
  return Buffer.from(await response.arrayBuffer());
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://localhost:${port}`);
    const match = url.pathname.match(/^\/images\/(\d+)\.png$/);
    if (match) {
      const index = Number(match[1]);
      if (!samples[index]) {
        response.writeHead(404).end();
        return;
      }
      if (!images.has(index))
        images.set(
          index,
          render(index).catch((error) => {
            images.delete(index);
            throw error;
          }),
        );
      const image = await images.get(index);
      response.writeHead(200, {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      });
      response.end(image);
      return;
    }
    if (url.pathname !== "/") {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>BetterInternship · Link previews</title>
      <style>
        *{box-sizing:border-box}body{margin:0;background:#f5f7fa;color:#061633;font-family:system-ui,sans-serif}main{max-width:1400px;margin:auto;padding:40px 24px}h1{margin:0 0 8px;font-size:28px}header p{color:#526175;line-height:1.5}header{margin-bottom:32px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}h2{font-size:17px;margin:0 0 12px}.card{overflow:hidden;border:1px solid #dce2eb;border-radius:12px;background:white}.card img{display:block;width:100%;aspect-ratio:1200/630;background:#edf2f9}.copy{padding:18px}.domain{font-size:12px;color:#526175}.title{font-size:18px;font-weight:650;margin:8px 0}.description{font-size:14px;line-height:1.5;color:#526175;margin:0}.original{display:inline-block;margin-top:10px;font-size:13px;color:#2563eb}footer{margin-top:32px;color:#526175;font-size:13px}@media(max-width:760px){.grid{grid-template-columns:1fr}main{padding:24px 16px}}
      </style><main><header><h1>Link previews</h1><p>Actual Top-page OG images in a link-card shell. Sample companies and counts, current Manila week.<br>Edit the OG route and restart this command to review changes.</p></header><div class="grid">${samples
        .map((sample, index) => {
          const title = heading.topUniversityPageTitle(
            sample.count,
            sample.name,
            universityOf(sample),
          );
          const description = `This week's top ${sample.name} internships for ${universityOf(sample)} students, ${week.currentManilaWeek().label}.${sample.companies.length ? ` Featuring ${sample.companies.join(", ")}.` : ""}`;
          return `<section><h2>${escape(sample.name)} · ${sample.count} listing${sample.count === 1 ? "" : "s"}</h2><div class="card"><img src="/images/${index}.png" alt="${escape(title)}"><div class="copy"><div class="domain">betterinternship.com</div><p class="title">${escape(title)}</p><p class="description">${escape(description)}</p></div></div><a class="original" href="/images/${index}.png" target="_blank" rel="noopener">Open full-size image ↗</a></section>`;
        })
        .join(
          "",
        )}</div><footer>1200 × 630 PNG · Local preview only · Link-card shells approximate social platforms, not their exact rendering.</footer></main></html>`);
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Preview rendering failed. See the terminal for details.");
  }
});

server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${port} is busy. Set OG_PREVIEW_PORT to another port.`
      : error,
  );
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}`;
  console.log(`Link-preview gallery: ${url}\nPress Ctrl+C to stop.`);
  if (process.env.OG_PREVIEW_NO_OPEN === "1") return;
  const command =
    platform === "win32"
      ? ["cmd.exe", ["/c", "start", "", url]]
      : platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
  const browser = spawn(...command, { detached: true, stdio: "ignore" });
  browser.on("error", () => console.log(`Open ${url} in your browser.`));
  browser.unref();
});
