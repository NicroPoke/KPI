const path = require("path");
const fs = require("fs");

const demoPath = path.join(process.cwd(), "example", "index.html");

if (!fs.existsSync(demoPath)) {
  throw new Error("example/index.html not found");
}

console.log("DecisionDex demo is ready.");
console.log(`Open this file in a browser: ${demoPath}`);