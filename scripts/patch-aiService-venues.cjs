const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "SRC", "services", "aiService.js");
let s = fs.readFileSync(p, "utf8");
const startMark = "  const CURATED_VENUES = [";
const endMark = "  // ─── SEÇİM MOTORU ────────────────────────────────────────────────────────────";
const i = s.indexOf(startMark);
const j = s.indexOf(endMark);
if (i === -1 || j === -1) {
  console.error("Markers not found", { i, j });
  process.exit(1);
}
const before = s.slice(0, i);
const after = s.slice(j);
fs.writeFileSync(p, before + after);
console.log("Removed CURATED_VENUES block; VENUES now from data/venues.js only.");
