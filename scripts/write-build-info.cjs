const fs = require("fs");
const path = require("path");

const buildTime = new Date().toISOString();
const publicDir = path.join(__dirname, "..", "public");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outPath = path.join(publicDir, "build-info.json");
fs.writeFileSync(
  outPath,
  JSON.stringify({ buildTime }, null, 2),
  "utf-8",
);

console.log("Build info written:", outPath, "->", buildTime);
