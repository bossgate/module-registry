// Runs on every pull request (Node 18+, no dependencies).
// Checks every submodule in extensions/: GitHub URL, pinned commit, module.json at THAT commit.
const { execSync } = require('child_process');
const fs = require('fs');
const OWNER = (process.env.GITHUB_REPOSITORY || '/').split('/')[0].toLowerCase();
const TRUSTED = (process.env.TRUSTED_OWNERS || '').toLowerCase().split(',').filter(Boolean).concat(OWNER);
const OSS = ['MIT','Apache-2.0','BSD-2-Clause','BSD-3-Clause','ISC','MPL-2.0','Zlib','Unlicense','CC0-1.0',
  'LGPL-2.1-only','LGPL-2.1-or-later','LGPL-3.0-only','LGPL-3.0-or-later','GPL-2.0-only','GPL-2.0-or-later',
  'GPL-3.0-only','GPL-3.0-or-later','AGPL-3.0-only','AGPL-3.0-or-later'];
let bad = 0;
const fail = (n, msg) => { bad++; console.log(`::error::[${n}] ${msg}`); };
const sh = (c) => { try { return execSync(c, { encoding: 'utf8' }); } catch { return ''; } };

(async () => {
  // pinned commits: "160000 commit <sha>\textensions/<name>"
  const pinned = {};
  for (const l of sh('git ls-tree HEAD extensions/').split('\n')) {
    const m = l.match(/^(\d+) (\w+) ([0-9a-f]{40})\t(.+)$/);
    if (m) pinned[m[4]] = { mode: m[1], sha: m[3] };
  }
  const urls = {};
  for (const l of sh("git config -f .gitmodules --get-regexp '^submodule\\..*\\.url$'").split('\n')) {
    const m = l.match(/^submodule\.(.+)\.url (.+)$/);
    if (m) urls[m[1]] = m[2];
  }
  const meta = fs.existsSync('modules.json') ? (JSON.parse(fs.readFileSync('modules.json', 'utf8')).modules || {}) : {};

  for (const [path, p] of Object.entries(pinned)) {
    const name = path.replace(/^extensions\//, '');
    if (p.mode !== '160000') { fail(name, 'must be a git submodule (git submodule add ...), not a plain folder'); continue; }
    if (!/^[a-z0-9][a-z0-9-]{0,118}$/.test(name)) { fail(name, 'folder name (= module slug) may only use a-z, 0-9 and hyphens'); continue; }
    const um = (urls[path] || '').match(/^(?:https:\/\/github\.com\/|git@github\.com:)([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/);
    if (!um) { fail(name, `submodule url must be a github.com repository, got "${urls[path]}"`); continue; }
    const owner = um[1].toLowerCase(), repo = `${um[1]}/${um[2]}`;
    const trusted = TRUSTED.includes(owner);
    const m = meta[name] || {};
    if (!trusted && (m.license || 'free') !== 'free') fail(name, 'community modules must be free');
    const res = await fetch(`https://raw.githubusercontent.com/${repo}/${p.sha}/module.json`);
    if (!res.ok) { (trusted ? console.log(`::warning::[${name}] module.json not readable (private repo?)`) : fail(name, `module.json not found in ${repo} at commit ${p.sha.slice(0, 7)}`)); continue; }
    let mj; try { mj = await res.json(); } catch { fail(name, 'module.json is not valid JSON'); continue; }
    if (mj.id !== name) fail(name, `module.json "id" must equal the folder name "${name}"`);
    if (!mj.title || !mj.summary) fail(name, 'module.json needs title and summary');
    if (!/^\d+\.\d+\.\d+/.test(mj.version || '')) fail(name, 'module.json needs a semantic "version" like 1.0.0');
    if (m.version && m.version !== mj.version) fail(name, `modules.json version ${m.version} != module.json version ${mj.version}`);
    if (!trusted && !OSS.includes(mj.license)) fail(name, `module.json "license" must be an open-source SPDX id, got "${mj.license}"`);
  }
  for (const n of Object.keys(meta)) if (!pinned[`extensions/${n}`]) fail(n, 'listed in modules.json but there is no extensions/' + n + ' submodule');
  console.log(bad ? `${bad} problem(s)` : `OK - ${Object.keys(pinned).length} module(s) checked`);
  process.exit(bad ? 1 : 0);
})();
