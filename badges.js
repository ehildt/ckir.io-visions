const fs = require("fs");
const yaml = require("js-yaml");

const PKG = JSON.parse(fs.readFileSync("package.json", "utf8"));

const ALL_DEPS = {
  ...(PKG.dependencies || {}),
  ...(PKG.devDependencies || {}),
  ...(PKG.peerDependencies || {})
};

const ARGS = process.argv.slice(2);
const USE_ALL = ARGS.includes("--all");
const NAMES = ARGS.filter(a => a !== "--all");

const BADGES_RC = ".badgesrc.yml";

const colorFromName = name => {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${h % 360},70%,45%)`;
};

const ensureBadgesRc = () => {
  if (fs.existsSync(BADGES_RC)) return false;

  const example = {
    dependencies: ["bullmq"],
    devDependencies: ["jest"],
    peerDependencies: ["react"]
  };

  fs.writeFileSync(BADGES_RC, yaml.dump(example));
  console.log(`Created ${BADGES_RC} (edit it and re-run)`);
  return true;
};

const readBadgesRc = () =>
  yaml.load(fs.readFileSync(BADGES_RC, "utf8")) || {};

let targets = [];

/* 1️⃣ Explicit CLI deps */
if (NAMES.length) {
  targets = NAMES;

/* 2️⃣ Config file takes precedence over --all */
} else if (fs.existsSync(BADGES_RC)) {
  const cfg = readBadgesRc();
  targets = [
    ...(cfg.dependencies || []),
    ...(cfg.devDependencies || []),
    ...(cfg.peerDependencies || [])
  ];

/* 3️⃣ --all only if no config exists */
} else if (USE_ALL) {
  targets = Object.keys(ALL_DEPS);

/* 4️⃣ Bootstrap config */
} else if (ensureBadgesRc()) {
  process.exit(0);
}

if (!targets.length) {
  console.error("No dependencies selected");
  process.exit(1);
}

const badges = Object.fromEntries(
  [...new Set(targets)].map(n => {
    if (!ALL_DEPS[n]) throw new Error(`Dependency not found: ${n}`);
    return [n, {
      schemaVersion: 1,
      label: n,
      message: ALL_DEPS[n],
      color: colorFromName(n)
    }];
  })
);

fs.writeFileSync("badges.json", JSON.stringify(badges, null, 2));
console.log(`Generated badges.json (${Object.keys(badges).length} badges)`);
