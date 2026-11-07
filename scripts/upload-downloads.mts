/**
 * Uploads content/downloads/*.pdf to the PRIVATE Supabase bucket "downloads".
 * Run: npm run upload:downloads   (needs SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local)
 * Safe to run again: existing files are replaced.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local first.");
  process.exit(1);
}
const dir = resolve("content/downloads");
if (!existsSync(dir)) {
  console.error("content/downloads/ not found. Run npm run build:downloads first.");
  process.exit(1);
}
const files = readdirSync(dir).filter((f) => f.endsWith(".pdf"));
if (!files.length) {
  console.error("No PDFs in content/downloads/. Run npm run build:downloads first.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
let failed = 0;
for (const f of files) {
  const { error } = await db.storage.from("downloads").upload(f, readFileSync(join(dir, f)), { contentType: "application/pdf", upsert: true });
  console.log(error ? `FAILED  ${f}: ${error.message}` : `uploaded ${f}`);
  if (error) failed++;
}
process.exit(failed ? 1 : 0);
