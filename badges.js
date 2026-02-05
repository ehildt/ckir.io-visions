#!/usr/bin/env node
/**
 * badges.js
 * =========
 *
 * Generates Shields-compatible badges for your Node.js project dependencies.
 * Produces:
 *   1. badges.json – JSON file compatible with Shields.io dynamic badges
 *   2. BADGES_README.md – optional README snippet with badges for dependencies and devDependencies
 *
 * Features:
 *   - Supports explicit dependency names via CLI arguments
 *   - Supports `--all` to include all dependencies/devDependencies/peerDependencies
 *   - Reads `.badgesrc.yml` if it exists (takes precedence over --all)
 *   - Auto-generates `.badgesrc.yml` template if missing
 *   - Auto-detects current Git branch (via `git rev-parse`) for badge URLs
 *   - Optional override of branch via `--b <branch>`
 *   - Deterministic color generation per dependency
 *
 * Usage:
 *   # Generate badges for all dependencies, auto-detect branch
 *   node badges.js --all
 *
 *   # Generate badges for specific dependencies
 *   node badges.js bullmq rxjs
 *
 *   # Override branch explicitly
 *   node badges.js --all --b feature/ci-badges
 *
 * Output:
 *   - badges.json: { "<dep>": { label, message, color, schemaVersion } }
 *   - BADGES_README.md: Markdown snippet ready to paste into README
 *
 * Author: Eugen Hildt <eugen.hildt@gmail.com>
 * Project: ckir.io-visions
 */

const fs = require("fs");
const { execSync } = require("child_process");
const yaml = require("js-yaml");

// --- Load package.json ---
const PKG = JSON.parse(fs.readFileSync("package.json", "utf8"));

const ALL_DEPS = {
  ...(PKG.dependencies || {}),
  ...(PKG.devDependencies || {}),
  ...(PKG.peerDependencies || {})
};

// --- CLI argument parsing ---
const ARGS = process.argv.slice(2);

// Branch detection (auto or override)
let BRANCH;
const branchIndex = ARGS.indexOf("--b");
if (branchIndex !== -1 && ARGS[branchIndex + 1]) {
  BRANCH = ARGS[branchIndex + 1];
  ARGS.splice(branchIndex, 2);
} else {
  try {
    BRANCH = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    if (!BRANCH) throw new Error("Empty branch");
  } catch {
    console.error("Cannot detect Git branch. Use --b <branch>.");
    process.exit(1);
  }
}

const USE_ALL = ARGS.includes("--all");
const NAMES = ARGS.filter(a => a !== "--all");

const BADGES_RC = ".badgesrc.yml";

// --- Helpers ---
/**
 * Generates a deterministic HSL color from a string
 * @param {string} name Dependency name
 * @returns {string} HSL color
 */
const colorFromName = name => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${h % 360},70%,45%)`;
};

/**
 * Ensures that .badgesrc.yml exists. If not, creates a template.
 * @returns {boolean} true if created, false if already exists
 */
const ensureBadgesRc = () => {
  if (fs.existsSync(BADGES_RC)) return false;
  const example = {
    dependencies: ["bullmq"],
    devDependencies: ["jest"],
    peerDependencies: ["react"]
  };
  const content = Object.entries(example)
    .map(([k, arr]) => `${k}:\n${arr.map(dep => `  - ${dep}`).join("\n")}`)
    .join("\n\n");
  fs.writeFileSync(BADGES_RC, content);
  console.log(`Created ${BADGES_RC} (edit it and re-run)`);
  return true;
};

/**
 * Reads .badgesrc.yml using js-yaml
 * @returns {object} { dependencies: [], devDependencies: [], peerDependencies: [] }
 */
const readBadgesRc = () => {
  if (!fs.existsSync(BADGES_RC)) return {};
  return yaml.load(fs.readFileSync(BADGES_RC, "utf8")) || {};
};

// --- Determine targets ---
let targets = [];

if (NAMES.length) {
  targets = NAMES;
} else if (fs.existsSync(BADGES_RC)) {
  const cfg = readBadgesRc();
  targets = [
    ...(cfg.dependencies || []),
    ...(cfg.devDependencies || []),
    ...(cfg.peerDependencies || [])
  ];
} else if (USE_ALL) {
  targets = Object.keys(ALL_DEPS);
} else if (ensureBadgesRc()) {
  process.exit(0);
}

if (!targets || !targets.length) {
  console.error("No dependencies selected. Use --all, .badgesrc.yml, or provide names as arguments.");
  process.exit(1);
}

// --- Generate badges.json ---
const badges = Object.fromEntries(
  [...new Set(targets)].map(n => {
    if (!ALL_DEPS[n]) throw new Error(`Dependency not found: ${n}`);
    return [
      n,
      {
        schemaVersion: 1,
        label: n,
        message: ALL_DEPS[n],
        color: colorFromName(n)
      }
    ];
  })
);

fs.writeFileSync("badges.json", JSON.stringify(badges, null, 2));
console.log(`Generated badges.json (${Object.keys(badges).length} badges)`);

// --- Generate README snippet ---
const deps = Object.keys(PKG.dependencies || {});
const devDeps = Object.keys(PKG.devDependencies || {});
const peerDeps = Object.keys(PKG.peerDependencies || {});

// Helper to construct Shields URL for a dependency
const urlFor = dep => `https://raw.githubusercontent.com/ehildt/ckir.io-visions/${BRANCH}/badges.json`;

// Compose README snippet
const readmeSection = `
## Dependencies

${deps.map(dep => `![${dep}](${urlFor(dep)}&query=$.${encodeURIComponent(dep)})`).join("\n")}

## Dev Dependencies

${devDeps.map(dep => `![${dep}](${urlFor(dep)}&query=$.${encodeURIComponent(dep)})`).join("\n")}

${peerDeps.length ? "## Peer Dependencies\n\n" + peerDeps.map(dep => `![${dep}](${urlFor(dep)}&query=$.${encodeURIComponent(dep)})`).join("\n") : ""}
`;

fs.writeFileSync("BADGES_README.md", readmeSection.trim());
console.log("Generated BADGES_README.md for README usage");
