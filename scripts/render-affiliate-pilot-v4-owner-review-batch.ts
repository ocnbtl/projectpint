import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { Script } from "node:vm";

const require = createRequire(import.meta.url);
const sharp = require("sharp") as any;
type JsonRecord = Record<string, any>;

function argument(name: string): string {
  const prefix = `--${name}=`;
  const value = process.argv.slice(2).find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
  if (!value) throw new Error(`Missing --${name}=...`);
  return value;
}

function readJson(filePath: string): JsonRecord {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as JsonRecord;
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value: unknown): string {
  return escapeHtml(value);
}

function amazonListingUrl(asin: unknown): string {
  const normalizedAsin = String(asin).trim().toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(normalizedAsin)) {
    throw new Error(`Cannot build Amazon listing URL for invalid ASIN: ${normalizedAsin}`);
  }
  return `https://www.amazon.com/dp/${normalizedAsin}`;
}

const batchId = argument("batch-id");
const repositoryRoot = process.cwd();
const reviewRoot = path.join(
  repositoryRoot,
  "output",
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "owner-review-batches",
  batchId
);
const batchPath = path.join(reviewRoot, "batch.json");
const manifestPath = path.join(repositoryRoot, "output", "affiliate-pilot", "v4", "manifest.json");
const batch = readJson(batchPath);
const manifest = readJson(manifestPath);
const manifestJobs = manifest.jobs as JsonRecord[];
const reviewJobs: JsonRecord[] = (batch.jobs as JsonRecord[]).map((frozen): JsonRecord => {
  const current = manifestJobs.find((job) => job.sceneId === frozen.sceneId);
  if (!current) throw new Error(`Missing manifest job ${frozen.sceneId}.`);
  if (current.promptSha256 !== frozen.promptSha256 || current.promptVersion !== frozen.promptVersion) {
    throw new Error(`${frozen.sceneId} prompt changed after batch freeze.`);
  }
  if (current.status !== "assistant_pass_owner_pending" || current.decisionStatus !== "assistant_pass_owner_pending") {
    throw new Error(`${frozen.sceneId} is not ready for owner review: ${current.status}/${current.decisionStatus}.`);
  }
  const candidatePath = path.resolve(repositoryRoot, frozen.candidatePath);
  if (!fs.existsSync(candidatePath)) throw new Error(`Missing candidate ${candidatePath}.`);
  return {
    ...frozen,
    candidateSha256: current.candidateSha256,
    generationEvidencePath: current.generationEvidencePath,
    amazonListingUrl: amazonListingUrl(frozen.asin),
    absoluteCandidatePath: candidatePath,
    relativeImagePath: path.relative(reviewRoot, candidatePath).replace(/\\/g, "/")
  };
});
if (reviewJobs.length !== Number(batch.targetOwnerReviewCandidateCount)) {
  throw new Error(`Expected ${batch.targetOwnerReviewCandidateCount} review candidates, received ${reviewJobs.length}.`);
}

const sheetWidth = 1600;
const cellWidth = 320;
const imageWidth = 288;
const imageHeight = 432;
const labelHeight = 64;
const sheetHeight = (imageHeight + labelHeight) * 2;
const sheetPaths: string[] = [];
for (let page = 0; page < Math.ceil(reviewJobs.length / 10); page += 1) {
  const pageJobs = reviewJobs.slice(page * 10, page * 10 + 10);
  const composites: JsonRecord[] = [];
  for (let index = 0; index < pageJobs.length; index += 1) {
    const job = pageJobs[index];
    const column = index % 5;
    const row = Math.floor(index / 5);
    const left = column * cellWidth + 16;
    const top = row * (imageHeight + labelHeight);
    const image = await sharp(job.absoluteCandidatePath)
      .resize(imageWidth, imageHeight, { fit: "cover" })
      .png()
      .toBuffer();
    const label = Buffer.from(
      `<svg width="${imageWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#171717"/><text x="8" y="22" fill="#ffffff" font-family="Arial" font-size="17" font-weight="700">${String(job.reviewNumber).padStart(3, "0")} · ${escapeXml(job.asin)}</text><text x="8" y="46" fill="#d4d4d4" font-family="Arial" font-size="14">${escapeXml(job.styleSlug)} · slot ${escapeXml(job.slot)}</text></svg>`
    );
    composites.push({ input: image, left, top });
    composites.push({ input: label, left, top: top + imageHeight });
  }
  const sheetPath = path.join(reviewRoot, `contact-sheet-${String(page + 1).padStart(2, "0")}.png`);
  await sharp({
    create: { width: sheetWidth, height: sheetHeight, channels: 3, background: "#262626" }
  })
    .composite(composites)
    .png()
    .toFile(sheetPath);
  sheetPaths.push(path.basename(sheetPath));
}

const cards = reviewJobs
  .map(
    (job) => `<article class="card" data-number="${job.reviewNumber}">
      <img loading="lazy" src="${escapeHtml(job.relativeImagePath)}" alt="Review ${job.reviewNumber}: ${escapeHtml(job.productName)} in ${escapeHtml(job.styleSlug)}" />
      <div class="meta"><div class="number">${String(job.reviewNumber).padStart(3, "0")}</div><div><strong>${escapeHtml(job.productName)}</strong><small>${escapeHtml(job.brand)} · ${escapeHtml(job.asin)} · ${escapeHtml(job.styleSlug)} · slot ${escapeHtml(job.slot)}</small></div></div>
      <a class="amazon-link" href="${escapeHtml(job.amazonListingUrl)}" target="_blank" rel="noopener noreferrer">View Amazon listing <span aria-hidden="true">↗</span></a>
      <div class="actions"><button type="button" data-decision="APPROVE">Approve</button><button type="button" data-decision="DENY">Deny</button></div>
      <textarea rows="2" placeholder="Optional reason or correction"></textarea>
    </article>`
  )
  .join("\n");
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Project Pint ${escapeHtml(batchId)} owner review</title><style>
:root{color-scheme:dark;font-family:Inter,system-ui,sans-serif;background:#111;color:#f5f5f5}body{margin:0;padding:24px}.top{position:sticky;top:0;z-index:3;background:#111e;padding:12px 0 18px;backdrop-filter:blur(12px)}h1{margin:0 0 6px;font-size:24px}.summary{color:#bbb;margin-bottom:12px}.toolbar{display:flex;gap:10px;flex-wrap:wrap}button{border:1px solid #555;background:#252525;color:#fff;border-radius:8px;padding:9px 13px;cursor:pointer}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}.card{background:#1d1d1d;border:2px solid #333;border-radius:12px;overflow:hidden}.card.approve{border-color:#2f9e64}.card.deny{border-color:#cf4b4b}.card img{width:100%;aspect-ratio:2/3;object-fit:cover;display:block}.meta{display:flex;gap:12px;padding:12px 12px 8px}.number{font-size:25px;font-weight:800}.meta small{display:block;color:#aaa;margin-top:4px}.amazon-link{display:inline-block;margin:0 12px 12px;color:#f1b05a;font-weight:700;text-decoration:none}.amazon-link:hover,.amazon-link:focus-visible{text-decoration:underline}.actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 12px 10px}.actions button.active[data-decision=APPROVE]{background:#17633d;border-color:#39b879}.actions button.active[data-decision=DENY]{background:#792f2f;border-color:#e06060}textarea{box-sizing:border-box;width:calc(100% - 24px);margin:0 12px 12px;background:#111;color:#fff;border:1px solid #555;border-radius:7px;padding:8px;resize:vertical}
</style></head><body><div class="top"><h1>Project Pint · ${escapeHtml(batchId)}</h1><div class="summary"><span id="progress">0 / ${reviewJobs.length} decided</span> · private owner selection only · nothing here is published</div><div class="toolbar"><button id="copy">Copy decision list</button><button id="download">Download JSON</button><button id="clear">Clear decisions</button></div></div><main class="grid">${cards}</main><script>
const key=${JSON.stringify(`project-pint:${batchId}:decisions`)};const cards=[...document.querySelectorAll('.card')];
function loadState(){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}let state=loadState();
function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{}render()}
function render(){let count=0;cards.forEach(card=>{const n=card.dataset.number;const entry=state[n]||{};card.classList.toggle('approve',entry.decision==='APPROVE');card.classList.toggle('deny',entry.decision==='DENY');card.querySelectorAll('[data-decision]').forEach(b=>b.classList.toggle('active',b.dataset.decision===entry.decision));card.querySelector('textarea').value=entry.note||'';if(entry.decision)count++});document.querySelector('#progress').textContent=count+' / '+cards.length+' decided'}
cards.forEach(card=>{const n=card.dataset.number;card.querySelectorAll('[data-decision]').forEach(b=>b.onclick=()=>{state[n]={...(state[n]||{}),decision:b.dataset.decision};save()});card.querySelector('textarea').onchange=e=>{state[n]={...(state[n]||{}),note:e.target.value.trim()};save()}});
function rows(){return cards.map(card=>{const n=card.dataset.number;const entry=state[n]||{};return {reviewNumber:Number(n),sceneId:${JSON.stringify(reviewJobs.map((job) => job.sceneId))}[Number(n)-1],decision:entry.decision||'UNDECIDED',note:entry.note||''}})}
document.querySelector('#copy').onclick=async()=>{const text=rows().map(r=>String(r.reviewNumber).padStart(3,'0')+' '+r.decision+(r.note?' — '+r.note:'')).join('\\n');await navigator.clipboard.writeText(text);document.querySelector('#copy').textContent='Copied';setTimeout(()=>document.querySelector('#copy').textContent='Copy decision list',1200)};
document.querySelector('#download').onclick=()=>{const blob=new Blob([JSON.stringify({batchId:${JSON.stringify(batchId)},decisions:rows()},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=${JSON.stringify(`${batchId}-decisions.json`)};a.click();URL.revokeObjectURL(a.href)};
document.querySelector('#clear').onclick=()=>{if(confirm('Clear every saved decision for this batch?')){state={};save()}};render();
</script></body></html>`;
const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!inlineScript) throw new Error(`Rendered ${batchId} without an inline review script.`);
new Script(inlineScript, { filename: `${batchId}-owner-review-inline.js` });
fs.writeFileSync(path.join(reviewRoot, "index.html"), html, "utf8");

const markdown = [
  `# Project Pint owner review: ${batchId}`,
  "",
  `Review ${reviewJobs.length} private candidates. Reply with each number and APPROVE or DENY; add a short correction after DENY when useful.`,
  "",
  ...reviewJobs.map(
    (job) =>
      `- ${String(job.reviewNumber).padStart(3, "0")} [ ] APPROVE [ ] DENY — ${job.productName} (${job.asin}), ${job.styleSlug}, slot ${job.slot} — [Amazon listing](${job.amazonListingUrl}) — \`${job.sceneId}\``
  )
].join("\n");
fs.writeFileSync(path.join(reviewRoot, "OWNER_REVIEW.md"), `${markdown}\n`, "utf8");
fs.writeFileSync(
  path.join(reviewRoot, "review-index.json"),
  `${JSON.stringify(
    {
      batchId,
      renderedAt: new Date().toISOString(),
      candidateCount: reviewJobs.length,
      contactSheets: sheetPaths,
      publicationStatus: "not_authorized_not_copied",
      jobs: reviewJobs.map(({ absoluteCandidatePath: _absolute, relativeImagePath: _relative, exactPrompt: _prompt, ...job }) => job)
    },
    null,
    2
  )}\n`,
  "utf8"
);
process.stdout.write(
  `Rendered ${batchId}: ${reviewJobs.length} candidates, ${sheetPaths.length} contact sheets, interactive approve/deny gallery at ${path.join(reviewRoot, "index.html")}.\n`
);
