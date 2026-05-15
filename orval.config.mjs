import { defineConfig } from "orval";

export default defineConfig({
  prescriptions: {
    input: process.env.OPENAPI_SPEC_PATH || "../../backend/openapi.json",
    output: {
      target: "./src/lib/api/generated",
      schemas: "./src/lib/api/generated/schemas",
      client: "react-query",
      httpClient: "axios",
      mock: false,
      clean: true,
      override: {
        mutator: {
          path: "./src/lib/api/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
});
