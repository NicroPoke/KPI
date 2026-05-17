const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const include = ["background.js", "content.js", "core", "popup", "example", "scripts"];
const excludedNames = new Set(["node_modules", ".git", "dist"]);

function collectJsFiles(targetPath, bucket) {
  const stat = fs.statSync(targetPath);

  if (stat.isFile()) {
    if (targetPath.endsWith(".js")) {
      bucket.push(targetPath);
    }
    return;
  }

  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    if (excludedNames.has(entry.name)) {
      continue;
    }

    const absolute = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      collectJsFiles(absolute, bucket);
      continue;
    }

    if (entry.isFile() && absolute.endsWith(".js")) {
      bucket.push(absolute);
    }
  }
}

const files = [];
for (const relative of include) {
  const absolute = path.join(root, relative);
  if (fs.existsSync(absolute)) {
    collectJsFiles(absolute, files);
  }
}

files.sort();

if (files.length === 0) {
  console.log("No JavaScript files found for syntax check.");
  process.exit(0);
}

let hasErrors = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "pipe",
    encoding: "utf8",
  });

  if (result.status !== 0) {
    hasErrors = true;
    process.stderr.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} files.`);