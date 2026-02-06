#!/usr/bin/env node
/**
 * badges.js – hash-aware badge generator without glob
 * Stores _hash in .badgesrc.yml, ensures badges.json exists
 * Supports Shields.io-safe URLs
 * HSL hue is always non-negative
 */

const fs = require("fs");
const yaml = require("js-yaml");
const crypto = require("crypto");

// --- Files ---
const BADGES_RC = ".badgesrc.yml";
const BADGES_JSON = "badges.json";
const BADGES_README = "BADGES_README.md";

// --- Read .badgesrc.yml ---
if (!fs.existsSync(BADGES_RC)) {
  console.error(`${BADGES_RC} not found`);
  process.exit(1);
}

let rcContent = fs.readFileSync(BADGES_RC, "utf8");
let rc = yaml.load(rcContent) || {};

// Extract previous hash and remove for hashing
const previousHash = rc._hash || null;
delete rc._hash;

// Compute hash of YAML content (without _hash)
const yamlString = yaml.dump(rc);
const yamlHash = crypto.createHash("sha256").update(yamlString, "utf8").digest("hex");

// --- Read package.json for versions ---
const PKG = JSON.parse(fs.readFileSync("package.json", "utf8"));
const ALL_DEPS = {
  ...(PKG.dependencies || {}),
  ...(PKG.devDependencies || {}),
  ...(PKG.peerDependencies || {})
};

// --- Ensure sections exist ---
const sections = {
  dependencies: Array.isArray(rc.dependencies) ? rc.dependencies : [],
  devDependencies: Array.isArray(rc.devDependencies) ? rc.devDependencies : [],
  peerDependencies: Array.isArray(rc.peerDependencies) ? rc.peerDependencies : [],
  internalDependencies: Array.isArray(rc.internalDependencies) ? rc.internalDependencies : []
};

// Assign versions for internalDependencies from package.json
sections.internalDependencies.forEach(dep => {
  if (!ALL_DEPS[dep]) ALL_DEPS[dep] = "unknown";
});

// --- Helpers ---
const colorFromName = name => {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = name.charCodeAt(i) + ((h << 5) - h);
  const hue = ((h % 360) + 360) % 360; // ensure 0 <= hue < 360
  return `hsl(${hue},70%,45%)`;
};
const encodeLabelURL = str => encodeURIComponent(str.replace(/[^a-zA-Z0-9]/g, "_"));
const encodeMessageURL = str => encodeURIComponent(str.replace(/^\^/, "v"));
const encodeColor = str => encodeURIComponent(str);

// --- Determine if badges.json needs regeneration ---
let badges = {};
let regenerate = previousHash !== yamlHash || !fs.existsSync(BADGES_JSON);

if (!regenerate) {
  try {
    badges = JSON.parse(fs.readFileSync(BADGES_JSON, "utf8"));
    console.log("No changes detected; using existing badges.json");
  } catch {
    regenerate = true;
  }
}

// --- Generate badges.json ---
if (regenerate) {
  const targets = [
    ...sections.dependencies,
    ...sections.devDependencies,
    ...sections.peerDependencies,
    ...sections.internalDependencies
  ];

  badges = Object.fromEntries(
    targets.filter(n => n).map(dep => {
      const version = ALL_DEPS[dep] || "unknown";
      return [dep, {
        schemaVersion: 1,
        label: dep,
        message: version,
        color: colorFromName(dep)
      }];
    })
  );

  fs.writeFileSync(BADGES_JSON, JSON.stringify(badges, null, 2));
  console.log(`Generated badges.json (${targets.length} badges)`);

  // Update _hash in .badgesrc.yml
  rc._hash = yamlHash;
  fs.writeFileSync(BADGES_RC, yaml.dump(rc));
  console.log(`Updated _hash in ${BADGES_RC}`);
}

// --- Generate BADGES_README.md from badges.json ---
const readmeLines = [];

for (const [section, deps] of Object.entries(sections)) {
  if (!deps.length) continue;
  readmeLines.push(`## ${section[0].toUpperCase() + section.slice(1)}`);
  deps.forEach(dep => {
    if (!badges[dep]) {
      console.warn(`Warning: ${dep} not found in badges.json, skipping`);
      return;
    }
    const { label, message, color } = badges[dep];
    const url = `https://img.shields.io/badge/${encodeLabelURL(label)}-${encodeMessageURL(message)}-${encodeColor(color)}.svg`;
    readmeLines.push(`![${label}](${url})`);
  });
  readmeLines.push("");
}

fs.writeFileSync(BADGES_README, readmeLines.join("\n"));
console.log("Generated BADGES_README.md from badges.json with URL-safe encoding");
