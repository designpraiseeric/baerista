# Baerista

DesignPraise's After Effects toolbar, and the update feed for every tool in it.

- `registry.json` lists each tool's current version, its files, their SHA-256 checksums and a changelog. The bar and the standalone scripts read this file to find updates.
- `tools/<id>/` holds the shipping version of each free tool.

Paid tools are not stored here. They are served after a Gumroad licence check.

## Releasing an update

1. Replace the tool's file in `tools/<id>/`.
2. Bump its `version`, update `sha256` and `changelog` in `registry.json`.
3. Commit and push. Every installed copy sees the update on its next check.

By DesignPraise (@designpraiseeric).
