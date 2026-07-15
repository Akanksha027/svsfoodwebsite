import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoDir = path.join(__dirname, "..", "public", "logo");
const src = fs.readFileSync(path.join(logoDir, "SVS FOOD LOGO.svg"), "utf8");

const bgRect = "M 0.00 0.00 L 1024.00 0.00 L 1024.00 1024.00 L 0.00 1024.00 ZM ";
const orangeMatch = src.match(/d="([^"]+)" fill="rgb\(240,106,50\)"/);
const whiteMatch = src.match(/d="([^"]+)" fill="rgb\(253,252,251\)"/);

if (!orangeMatch || !whiteMatch) {
  throw new Error("Could not parse logo SVG paths");
}

const orangePath = orangeMatch[1].replace(bgRect, "");
const whitePath = whiteMatch[1];
const viewBox = "240 250 580 480";

function buildSvg(foodFill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none">
<path d="${orangePath}" fill="#F16A34"/>
<path d="${whitePath}" fill="${foodFill}"/>
</svg>
`;
}

fs.writeFileSync(path.join(logoDir, "on-white.svg"), buildSvg("#1A1A1A"));
fs.writeFileSync(path.join(logoDir, "on-cream.svg"), buildSvg("#1A1A1A"));
fs.writeFileSync(path.join(logoDir, "on-ink.svg"), buildSvg("#FFFFFF"));
fs.writeFileSync(path.join(logoDir, "on-mark.svg"), buildSvg("#F16A34"));
console.log("Wrote on-white.svg, on-cream.svg, on-ink.svg, on-mark.svg");
