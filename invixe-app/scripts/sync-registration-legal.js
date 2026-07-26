#!/usr/bin/env node
/**
 * Sync registration legal HTML from Invixe-Policy into invixe-app.
 * Usage: node scripts/sync-registration-legal.js
 */
const fs = require("fs");
const path = require("path");

const POLICY_DIR = path.resolve(__dirname, "../../../Invixe-Policy");
const OUT_FILE = path.resolve(__dirname, "../src/content/registrationLegal.ts");

function extractMain(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const match = html.match(/<main class="doc">([\s\S]*?)<\/main>/);
  return match ? match[1].trim() : "";
}

const terms = extractMain(path.join(POLICY_DIR, "terms.html"));
const privacy = extractMain(path.join(POLICY_DIR, "privacy.html"));
const combined = `${terms}\n<hr />\n${privacy}`
  .replace(/class="doc-meta"/g, "")
  .replace(/<a href="mailto:([^"]+)">[^<]+<\/a>/g, "$1");

const updatedMatch = terms.match(/תאריך עדכון אחרון:\s*([0-9/]+)/);
const updated = updatedMatch ? updatedMatch[1] : "26/07/2026";

const output = `/**
 * Registration terms & privacy copy — sourced from Invixe-Policy (terms.html + privacy.html).
 * Re-generate: node scripts/sync-registration-legal.js
 */
export const REGISTRATION_LEGAL_HTML = ${JSON.stringify(combined)};
export const REGISTRATION_LEGAL_UPDATED = ${JSON.stringify(updated)};
`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, output);
console.log("Updated", OUT_FILE);
