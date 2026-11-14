## Add / update module

- Slug: `my-module`
- Repo: `owner/repo` (must be PUBLIC)
- Release tag: `v1.0.0`

Checklist
- [ ] Repo is public and has a `README.md`
- [ ] `module.json` exists at the tag and its `id` equals the slug
- [ ] `license` in `module.json` is an open-source SPDX id (MIT, Apache-2.0, GPL-3.0-or-later ...)
- [ ] `ref` is a release tag or full commit SHA (not a branch, not `latest`)
- [ ] The module contains no secrets, telemetry or obfuscated code
- [ ] I understand every update needs a new pull request with a new tag
