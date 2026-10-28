const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.join(__dirname, "..");
function loadSource(relative, mocks, globals = {}) {
  const filename = path.join(root, relative);
  const module = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2017,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  vm.runInNewContext(
    compiled,
    {
      module,
      exports: module.exports,
      require(name) {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        if (name === "react/jsx-runtime") return require(name);
        throw new Error(`Unexpected dependency in ${relative}: ${name}`);
      },
      console: { warn() {}, error() {} },
      Error,
      URL,
      Blob,
      FormData,
      ...globals,
    },
    { filename },
  );
  return module.exports;
}

function setupFetch(status, body, options = {}) {
  const redirects = [];
  const requests = [];
  const window = {
    location: {
      pathname: "/god/listings",
      search: "?page=2",
      assign(url) {
        redirects.push(url);
      },
    },
  };
  const god = loadSource("lib/api/god-session.ts", {}, { window });
  const api = loadSource(
    "lib/api/career-fetch.ts",
    {
      "./api-origin": { apiUrl: (value) => `https://example.test${value}` },
      "./maintenance": { redirectIfMaintenanceMode: () => false },
      "./god-session": god,
    },
    {
      fetch: async (url, init) => {
        requests.push({ url, init });
        return new Response(options.text ?? JSON.stringify(body), {
          status,
          headers: {
            "Content-Type": options.text ? "text/plain" : "application/json",
          },
        });
      },
    },
  );
  return { ...api, redirects, requests };
}

test("admin 401 redirects and retains the legacy response envelope", async () => {
  const { careerFetch, redirects } = setupFetch(401, {
    message: "Session expired",
    success: false,
  });
  const result = await careerFetch("/api/god/employers");
  assert.equal(result.error, "Session expired");
  assert.equal(result.success, false);
  assert.deepEqual(redirects, ["/login?next=%2Fgod%2Flistings%3Fpage%3D2"]);
});

test("admin 401 redirects before throwing the typed query error", async () => {
  const { careerFetch, CareerApiError, redirects, requests } = setupFetch(401, {
    message: "Session expired",
  });
  await assert.rejects(
    careerFetch("/api/god/employers", { throwOnError: true }),
    (error) => {
      assert.ok(error instanceof CareerApiError);
      assert.equal(error.status, 401);
      assert.equal(error.body.message, "Session expired");
      return true;
    },
  );
  assert.equal(redirects.length, 1);
  assert.ok(!Object.hasOwn(requests[0].init, "throwOnError"));
  assert.equal(requests[0].init.credentials, "include");
});

test("student and admin-login 401 responses never redirect to admin login", async () => {
  for (const requestPath of ["/api/users/me", "/api/auth/god/me"]) {
    const { careerFetch, redirects } = setupFetch(401, {
      message: "Not signed in",
    });
    await careerFetch(requestPath);
    assert.equal(redirects.length, 0);
  }
});

test("legacy structured errors survive and non-JSON query failures remain typed", async () => {
  const legacy = setupFetch(409, {
    message: "Not eligible",
    eligible_listings: ["example"],
  });
  const result = await legacy.careerFetch("/api/applications");
  assert.equal(result.eligible_listings[0], "example");
  assert.equal(result.error, "Not eligible");
  const typed = setupFetch(500, null, { text: "Server unavailable" });
  await assert.rejects(
    typed.careerFetch("/api/jobs", { throwOnError: true }),
    (error) => {
      assert.ok(error instanceof typed.CareerApiError);
      assert.equal(error.status, 500);
      assert.equal(error.message, "Request failed (HTTP 500).");
      return true;
    },
  );
});

test("successful requests retain binary uploads and include cookies", async () => {
  const { careerFetch, requests } = setupFetch(200, { success: true });
  const body = new FormData();
  body.append("name", "example");
  const result = await careerFetch("/api/uploads", { method: "POST", body });
  assert.equal(result.success, true);
  assert.equal(requests[0].init.body, body);
  assert.ok(!Object.hasOwn(requests[0].init.headers, "Content-Type"));
});

test("homepage keeps the branch behavior without a separate session redirect", () => {
  const source = fs.readFileSync(
    path.join(root, "app/student/page.tsx"),
    "utf8",
  );
  assert.ok(source.includes("<StudentHomepage"));
  assert.ok(!source.includes("HomepageSessionRedirect"));
  assert.ok(!source.includes("session-hint"));
  assert.ok(
    !fs.existsSync(
      path.join(
        root,
        "components/landingStudent/homepage-session-redirect.tsx",
      ),
    ),
  );
});

test("app shell loads schools without nesting another auth/query provider", () => {
  const wrapper = (name) => ({ [name]: function Provider() {} });
  const mocks = {
    "@/lib/db/use-refs": { SchoolsRefsLoader: function SchoolsRefsLoader() {} },
    "@/lib/ctx-app": wrapper("AppContextProvider"),
    "@/components/ui/tooltip": wrapper("TooltipProvider"),
    "@/lib/ctx-header": wrapper("HeaderContextProvider"),
    "@/components/providers/mq-jobs-provider": wrapper("AppMQJobsProvider"),
    "@/hooks/forms/filloutFormProcess": wrapper("FilloutJobsProvider"),
    "@/components/providers/modal-provider/ModalProvider": {
      ModalProvider: function ModalProvider() {},
    },
    "@/components/features/student/navigation/student-bottom-navigation":
      wrapper("StudentBottomNavigation"),
    "@/components/ui/sonner-toast": wrapper("SonnerToaster"),
    "./student-page-layout": {
      __esModule: true,
      default: function StudentPageLayout() {},
    },
    "@/lib/ctx-student-auth": {
      useAuthContext: () => ({ user: { id: "student-example" } }),
    },
  };
  const Shell = loadSource("app/student/student-app-shell.tsx", mocks).default;
  const element = Shell({ children: "Page content" });
  assert.equal(element.type, mocks["@/lib/db/use-refs"].SchoolsRefsLoader);
  const elements = [];
  function visit(item) {
    if (Array.isArray(item)) return item.forEach(visit);
    if (!item || !item.props) return;
    elements.push(item);
    visit(item.props.children);
  }
  visit(element);
  const modal = elements.find(
    (item) =>
      item.type ===
      mocks["@/components/providers/modal-provider/ModalProvider"]
        .ModalProvider,
  );
  assert.equal(modal.props.accountScope, "student-example");
  assert.ok(
    elements.some((item) => Object.hasOwn(item.props, "data-student-scroll")),
  );
});

test("student layout combines server job refs with the shared foundation", async () => {
  const refs = { job_categories: [] };
  const RefsProvider = function RefsProvider() {};
  const Foundation = function Foundation() {};
  const PostHog = function PostHog() {};
  const RouteShell = function RouteShell() {};
  const layout = loadSource("app/student/layout.tsx", {
    "@/components/providers/student-foundation": {
      StudentFoundation: Foundation,
    },
    "@/lib/db/use-refs": { RefsContextProvider: RefsProvider },
    "@/lib/db/use-refs-backend": { getJobRefs: async () => refs },
    "@/lib/site-url": { baseUrl: "https://example.test" },
    "../fonts": { inter: { variable: "example-font" } },
    "../posthog-provider": { PostHogProvider: PostHog },
    "./student-route-shell": { __esModule: true, default: RouteShell },
    "../globals.css": {},
  });
  const html = await layout.default({ children: "Page content" });
  const analyticsElement = html.props.children.props.children;
  assert.equal(analyticsElement.type, PostHog);
  const refsElement = analyticsElement.props.children;
  assert.equal(refsElement.type, RefsProvider);
  assert.equal(refsElement.props.jobRefs, refs);
  assert.equal(refsElement.props.children.type, Foundation);
  assert.equal(refsElement.props.children.props.children.type, RouteShell);
  assert.equal(layout.metadata.metadataBase.href, "https://example.test/");
});

test("Reddit banner uses shared auth and leaves click tracking to the modal", () => {
  const opened = [];
  const job = { id: "job-example" };
  const banner = loadSource(
    "components/features/student/job/reddit-review-banner.tsx",
    {
      "@betterinternship/components": { Button: function Button() {} },
      "@betterinternship/components/status-notice": {
        StatusNotice: function StatusNotice() {},
      },
      "lucide-react": {
        ArrowUpRight: function ArrowUpRight() {},
        MessageSquare: function MessageSquare() {},
      },
      "@/lib/api/student.data.api": {
        useApplicationsData: () => ({
          data: [{ job_id: job.id, id: "application-example" }],
          isPending: false,
          error: null,
        }),
      },
      "@/lib/ctx-student-auth": {
        useAuthContext: () => ({ isAuthenticated: () => true }),
      },
      "@/components/modals/modal-registry": {
        useModalRegistry: () => ({
          redditDiscussion: { open: (input) => opened.push(input) },
        }),
      },
    },
  );
  const result = banner.RedditReviewBanner({ job });
  result.props.action.props.onClick();
  assert.equal(opened.length, 1);
  assert.equal(opened[0].job, job);
});
