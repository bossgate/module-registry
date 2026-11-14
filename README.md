# Trongate Module Registry

Same layout as [zed-industries/extensions](https://github.com/zed-industries/extensions): the `extensions/` folder holds
**one git submodule per module, pinned to an exact commit**. Your code stays in your own repo; this repo only records
*which commit* is listed. The store reads `module.json` and `README.md` from that commit automatically.

```
extensions/
  hello-world/   -> submodule: github.com/bossgate/tg-hello-world @ 3f2a9c1...
  pro-notes/     -> submodule: github.com/bossgate/tg-pro-notes   @ 9b81d04...
.gitmodules
modules.json     (optional: price / category / expected version per module)
```

## Submit a module

1. Your module repo is **public** and has `module.json` and `README.md` in the root (see `module.json.example`).
2. Fork this repo, clone your fork, then:

```bash
git checkout -b add-my-module
git submodule add https://github.com/YOU/my-module.git extensions/my-module
git -C extensions/my-module checkout v1.0.0        # the tag or commit you want listed
git add .gitmodules extensions/my-module
git commit -m "Add my-module 1.0.0"
git push -u origin add-my-module
```
3. Open a pull request. A check validates the submodule URL, the pinned commit and your `module.json`.
4. The maintainer reviews the code **at that exact commit**. After merge the store syncs and the page appears.

The folder name is the slug (`a-z`, `0-9`, `-`) and must equal `"id"` in `module.json`.

## Update a module

```bash
git checkout -b update-my-module
git -C extensions/my-module fetch --tags
git -C extensions/my-module checkout v1.1.0
git add extensions/my-module
git commit -m "Update my-module to 1.1.0" && git push -u origin update-my-module
```
Only the commit hash changes in the PR diff; the maintainer reviews what changed between the two commits.

## Rules for community modules
Free, open-source licence (SPDX id in `module.json`), public GitHub repo, `version` in `module.json`.

## Maintainer notes
- Copy this folder's contents (incl. `.github/`, `scripts/`, `extensions/.gitkeep`, `modules.json`) into the registry repo.
- In `.github/workflows/validate.yml` set `TRUSTED_OWNERS` to the GitHub accounts you control.
- `modules.json` is where YOU mark your own modules paid:
  `{"modules": {"pro-notes": {"license": "paid", "price_usd": 5, "category": "Productivity", "version": "1.0.0"}}}`
  Paid only works for trusted owners and needs a read-only token on the server (see `docs/PRIVATE_REPOS.md`).
  A paid module's repo can be private - the registry only holds a pointer.
- Optional: add a GitHub webhook (push) so you remember to sync, or click **Sync now** after each merge.
