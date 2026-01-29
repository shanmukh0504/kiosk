import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/playwright",
  timeout: 120000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  use: {
    headless: true,
    baseURL: "http://localhost:4173",
    viewport: { width: 390, height: 844 },
    actionTimeout: 10000,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

