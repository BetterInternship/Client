import { defineConfig } from "orval";

// Generates the Career-Server client from lib/api/generated/spec.json.
//
// Refresh the spec first (Career-Server: `npm run spec`, then copy
// spec/spec.json over lib/api/generated/spec.json by hand), then run
// `npm run spec` here. Nothing under lib/api/generated/ is edited by hand:
// `clean: true` deletes anything else in it, except spec.json.
//
// No `workspace` key on purpose: combined with `target` it makes the output
// path relative to itself, which is what doubled the path in Docs-Client.
export default defineConfig({
  career: {
    input: { target: "./lib/api/generated/spec.json" },
    output: {
      mode: "tags-split",
      target: "./lib/api/generated/endpoints",
      schemas: "./lib/api/generated/models",
      client: "fetch",
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: "./lib/api/career-fetch.ts",
          name: "careerFetch",
        },
        // Generated functions return the response body, as APIClient does,
        // not { data, status, headers }.
        fetch: { includeHttpResponseReturnType: false },
      },
    },
  },
});
