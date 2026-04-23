import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setupEnv.ts"],
    globalSetup: ["./tests/globalSetup.ts"],
    include: ["tests/**/*.test.ts"],
  },
});
