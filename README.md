# Trongate Module Registry

The list of open-source modules shown in the marketplace. **Your module code stays in your own repo** -
this repo only holds a pointer to it, like the Zed extensions registry. The store reads each module's
`module.json` and `README.md` automatically; you never enter titles or descriptions by hand.

## Submit a module

1. Put your module in a **public** GitHub repo with `module.json` and `README.md` in the root
   (see `module.json.example` and `docs/MODULE_JSON.md`).
2. Publish a release: `git tag v1.0.0 && git push --tags`.
3. Fork this repo and add one entry to `registry.json`, keeping `modules` sorted by slug:

```json
{
  "slug": "my-module",
  "repo": "your-user/trongate-my-module",
  "license": "free",
  "ref": "v1.0.0"
}
```

4. Open a pull request. A check validates the entry automatically; the maintainer reviews the code at that tag.
5. After merge, the store syncs and your module page appears (title, description, README, website, license, version).

**Updating:** publish a new tag, then open a PR changing `ref`. Pinning means buyers only ever get code the
maintainer has reviewed. Rules: free/open-source licenses only, public repo, unique slug, `id` in `module.json`
equals the slug.

## Maintainer notes

- Add `.github/` and `scripts/` from the marketplace zip to this repo, and set `TRUSTED_OWNERS` in
  `validate.yml` to the GitHub accounts you control.
- Your own modules (and paid modules, price, `"delivery": "release_asset"`) may use `"ref": "latest"`;
  keep paid entries in a PRIVATE registry repo - see `docs/PRIVATE_REPOS.md`.
- Optional: add a GitHub webhook (push events) so the store syncs on merge - or just click *Sync now*.
