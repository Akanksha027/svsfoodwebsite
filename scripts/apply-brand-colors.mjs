import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src");

const replacements = [
  ["#f16a35", "svs-orange"],
  ["#F16A35", "svs-orange"],
  ["#F16A34", "svs-orange"],
  ["#f16a34", "svs-orange"],
  ["#E84B10", "svs-orange"],
  ["#e84b10", "svs-orange"],
  ["#d45a2b", "svs-orange-dark"],
  ["#D95A2A", "svs-orange-dark"],
  ["#d95a2a", "svs-orange-dark"],
  ["#1a1a1a", "svs-ink"],
  ["#1A1A1A", "svs-ink"],
  ["#03071e", "svs-ink"],
  ["#3a1e12", "svs-ink"],
  ["#1a0a00", "svs-ink"],
  ["#4a1c0a", "svs-ink"],
  ["#fff8f3", "svs-cream"],
  ["#FFF4EE", "svs-cream"],
  ["#fff4ee", "svs-cream"],
  ["#fff1e8", "svs-cream"],
  ["#fffdfb", "svs-cream"],
  ["#f2ebe3", "svs-cream"],
  ["#f3f3f3", "svs-cream"],
  ["#c4ea21", "svs-yellow"],
  ["#C4EA21", "svs-yellow"],
  ["#ffd166", "svs-yellow"],
  ["#12a107", "svs-green"],
  ["#2D9E75", "svs-green"],
  ["#2d9e75", "svs-green"],
  ["rgba(241,106,53,", "rgba(241,106,52,"],
  ["text-gray-900", "text-svs-ink"],
  ["text-gray-800", "text-svs-ink"],
  ["text-gray-700", "text-svs-ink/80"],
  ["hover:text-black", "hover:text-svs-ink"],
  ["hover:text-gray-900", "hover:text-svs-ink"],
  ["border-gray-100", "border-svs-cream"],
  ["#5c3a28", "svs-ink/75"],
  ["#4B2B0A", "svs-ink/80"],
  ["#4b2b0a", "svs-ink/80"],
  ["#4a5568", "svs-ink/65"],
  ["#7a5a3a", "svs-ink/60"],
  ["#6b7280", "svs-ink/55"],
  ["#efe4da", "svs-cream"],
  ["#ece8e4", "svs-cream"],
  ["#e8d5c8", "svs-cream"],
  ["#e8ddd0", "svs-cream"],
  ["#f0c9b0", "svs-orange/30"],
  ["#f3e0d4", "svs-cream"],
  ["#e8ddd0", "svs-cream"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx|css)$/.test(entry.name) && !/globals\.css|bagoss\.css/.test(entry.name))
      files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(root)) {
  let text = fs.readFileSync(file, "utf8");
  const original = text;

  for (const [from, to] of replacements) {
    // bg-[#hex] -> bg-svs-orange
    text = text.replaceAll(`[${from}]`, to);
    // bare hex in quotes if any left
    text = text.replaceAll(from, to);
  }

  // Fix double-prefix mistakes like bg-svs-orange -> already ok
  // Fix text-svs-ink/80 if broken

  if (text !== original) {
    fs.writeFileSync(file, text);
    changed++;
    console.log("updated", path.relative(process.cwd(), file));
  }
}

console.log(`Done. ${changed} files updated.`);
