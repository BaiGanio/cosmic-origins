// Playwright Test config — test tooling only.
// The app (index.html, src/, styles/) does not know about this file.
// Run: npm test   (all 3 engines)   ·   npm run test:firefox   (one engine)
const { defineConfig, devices } = require("@playwright/test");

const PORT = 4310;            // not 4300, so it never clashes with your own dev server
const inCI = !!process.env.CI;

module.exports = defineConfig({
  testDir: "tests/ui",
  fullyParallel: true,
  forbidOnly: inCI,           // a forgotten test.only fails the CI run
  retries: inCI ? 1 : 0,      // a test that passes on retry is still reported as "flaky"
  workers: inCI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:" + PORT,
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // The static checks (node --check, grep) do not need a browser: run them once.
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, testIgnore: /t0-static/ },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: /t0-static/ },
  ],
  webServer: {
    command: "npx serve -l " + PORT + " .",
    url: "http://localhost:" + PORT,
    reuseExistingServer: !inCI,
    timeout: 30000,
  },
});
