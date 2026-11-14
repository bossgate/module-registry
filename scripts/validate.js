// Runs on every pull request. No dependencies (Node 18+). Fails the check on a bad entry.
const fs = require('fs');
const OWNER = (process.env.GITHUB_REPOSITORY || '/').split('/')[0].toLowerCase();
const TRUSTED = (process.env.TRUSTED_OWNERS || '').toLowerCase().split(',').filter(Boolean).concat(OWNER);
const OSS = ['MIT','Apache-2.0','BSD-2-Clause','BSD-3-Clause','ISC','MPL-2.0','Zlib','Unlicense','CC0-1.0',
  'LGPL-2.1-only','LGPL-2.1-or-later','LGPL-3.0-only','LGPL-3.0-or-later','GPL-2.0-only','GPL-2.0-or-later',
  'GPL-3.0-only','GPL-3.0-or-later','AGPL-3.0-only','AGPL-3.0-or-later'];
let bad = 0;
const fail = (slug, msg) => { bad++; console.log(`::error::[${slug}] ${msg}`); };

(async () => {
  const reg = JSON.parse(fs.readFileSync('registry.json', 'utf8'));
  if (!Array.isArray(reg.modules)) { fail('registry', '"modules" must be an array'); process.exit(1); }
  const seen = new Set();
  for (const e of reg.modules) {
    const slug = String(e.slug || '');
    if (!/^[a-z0-9][a-z0-9-]{0,118}$/.test(slug)) { fail(slug, 'invalid slug'); continue; }
    if (seen.has(slug)) { fail(slug, 'duplicate slug'); continue; }
    seen.add(slug);
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(e.repo || '')) { fail(slug, 'repo must be owner/name'); continue; }
    const trusted = TRUSTED.includes(e.repo.split('/')[0].toLowerCase());
    if (!['free', 'paid'].includes(e.license)) { fail(slug, 'license must be "free" or "paid"'); continue; }
    if (!trusted && e.license !== 'free') fail(slug, 'community modules must be free');
    const ref = String(e.ref || '');
    if (!trusted && (ref === '' || ref === 'latest')) { fail(slug, 'pin "ref" to a release tag (e.g. v1.0.0) or commit SHA'); continue; }
    if (trusted || !ref) continue;
    const res = await fetch(`https://raw.githubusercontent.com/${e.repo}/${ref}/module.json`);
    if (!res.ok) { fail(slug, `module.json not found at ${e.repo}@${ref}`); continue; }
    let m; try { m = await res.json(); } catch { fail(slug, 'module.json is not valid JSON'); continue; }
    if (m.id !== slug) fail(slug, `module.json "id" must equal "${slug}"`);
    if (!m.title || !m.version || !m.summary) fail(slug, 'module.json needs title, version and summary');
    if (!OSS.includes(m.license)) fail(slug, `module.json "license" must be an open-source SPDX id, got "${m.license}"`);
  }
  console.log(bad ? `${bad} problem(s)` : 'registry.json OK');
  process.exit(bad ? 1 : 0);
})();
