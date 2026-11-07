/**
 * Builds the paid PDFs from content/downloads/src/*.html using headless Chrome.
 * Run: npm run build:downloads
 *
 * Each source file starts with a JSON comment:  <!--{"title":"...","subtitle":"...","kicker":"..."}-->
 * The output name is the source file name, e.g. lead-form.html -> content/downloads/lead-form.pdf
 * content/ is gitignored on purpose: the repository is public and these files are the product.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const SRC = resolve("content/downloads/src");
const OUT = resolve("content/downloads");
const TMP = join(OUT, ".tmp");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}. Set CHROME_PATH.`);
  process.exit(1);
}
mkdirSync(TMP, { recursive: true });
const css = readFileSync(join(SRC, "_doc.css"), "utf8");

const page = (meta: { title: string; subtitle: string; kicker: string }, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${meta.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>${css}</style></head><body>
<div class="cover"><div class="brand">Direct<b>Collabs</b></div><span class="kicker">${meta.kicker}</span><h1>${meta.title}</h1><p class="sub">${meta.subtitle}</p></div>
${body}
<div class="foot">DirectCollabs · your personal copy, please do not share</div>
</body></html>`;

let built = 0;
for (const f of readdirSync(SRC).filter((x) => x.endsWith(".html") && !x.startsWith("_"))) {
  const raw = readFileSync(join(SRC, f), "utf8");
  const m = raw.match(/^<!--(\{[\s\S]*?\})-->/);
  if (!m) throw new Error(`${f}: first line must be a <!--{json}--> meta comment`);
  const meta = JSON.parse(m[1]);
  const name = f.replace(/\.html$/, "");
  const html = join(TMP, `${name}.html`);
  const pdf = join(OUT, `${name}.pdf`);
  writeFileSync(html, page(meta, raw.slice(m[0].length)));
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=10000", `--print-to-pdf=${pdf}`, `file://${html}`], { stdio: "ignore" });
  console.log("built", `${name}.pdf`);
  built++;
}
if (!process.env.KEEP_TMP) rmSync(TMP, { recursive: true, force: true });
console.log(`${built} PDF(s) in content/downloads/`);
