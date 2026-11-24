// T0 — checks on the source files. No browser needed; runs once (chromium project).
// See docs/plans/ui-polish-tests.md § T0.
const { test, expect } = require("@playwright/test");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

// Every .js file in a folder (and its sub-folders)
function jsFiles(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return jsFiles(rel);
    return entry.name.endsWith(".js") ? [rel] : [];
  });
}

test("T0.1 node --check passes on every JS file", () => {
  const files = [...jsFiles("src"), ...jsFiles("tests"), "playwright.config.js"];
  expect(files).toContain(path.join("src", "ui", "cosmic.js"));
  for (const file of files) {
    // throws (and names the file) when the syntax is broken
    execFileSync(process.execPath, ["--check", path.join(ROOT, file)], { stdio: "pipe" });
  }
});

test("T0.4 renderGrid is defined exactly once", () => {
  const source = fs.readFileSync(path.join(ROOT, "src/ui/cosmic.js"), "utf8");
  const definitions = source.match(/function renderGrid\s*\(/g) || [];
  expect(definitions).toHaveLength(1);
});

test.skip("T0.3 new CSS uses tokens only — manual: needs the diff and human eyes", () => {});
test.skip("T0.5 CATALOG field names unchanged — manual: compare with git show HEAD", () => {});
