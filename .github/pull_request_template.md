## Add / update module

- Module folder: `extensions/my-module`
- Repo: `owner/repo` (public)
- Pinned to: tag `v1.0.0` / commit `abc1234`

Checklist
- [ ] Added with `git submodule add https://github.com/owner/repo.git extensions/my-module`
- [ ] Checked out the exact release commit/tag before `git add` (the PR diff shows ONE commit hash)
- [ ] Folder name = slug = `id` in the repo's `module.json`
- [ ] `module.json` at that commit has `title`, `summary`, `version`, `license` (open-source SPDX id)
- [ ] The repo has a `README.md`; contains no secrets, telemetry or obfuscated code
- [ ] To release an update I will open a new PR that moves the submodule to the new commit
