---
name: zip-branch-import
description: Import a zip archive containing a patch file and related assets into the repo, create or switch to a branch, and apply the patch with git history.
---

# Zip-to-branch import

Use this skill when a patch and visual assets arrive in a zip file, but the repo still needs the files moved into their correct paths and the patch applied on a branch.

## What it does

The workflow mirrors the manual steps we used in this session:

1. Validate the zip archive and the repo state.
2. Extract the archive into a temporary directory.
3. Detect the `.patch` file and any accompanying asset files.
4. Match accompanying assets to destinations in the patch. Paths already present under a wrapper such as `files/` are preserved; flat asset files are matched to a unique patch destination by filename.
5. Create or switch to the target branch (`--branch` or inferred from the patch name).
6. Apply the patch with `git am --3way --keep-cr` so the file additions and edits land in git history.
7. Copy any differing accompanying assets to their patch destinations and commit those changes separately.
8. Clean up the temporary zip extraction folder.

## Usage

```bash
node scripts/import-zip-branch.mjs /path/to/archive.zip
node scripts/import-zip-branch.mjs /path/to/archive.zip --branch templates/farm-logistics-landing-page
```

If a branch is not supplied, the script infers one from the patch filename. For template work, it prefers a `templates/<slug>` naming convention.

## Rules

- Run from inside the repository root.
- Refuse to operate on a dirty working tree; commit or stash changes before importing.
- Never reset an existing branch; check it out as-is, or create it if it does not exist.
- Treat patch destinations as the source of truth for file placement. Flat assets must match exactly one destination by basename; ambiguous or unmatched files stop the import.
- Reject unsafe archive paths and symbolic links.
- Remove the temp extraction directory before exiting, even if the import fails.

## Typical archive layout

A valid archive often looks like this:

```text
archive.zip
├── files/
│   ├── farm-logistics-landing-page.patch
│   ├── public/template-art/farm-logistics-hero.svg
│   ├── public/template-art/farm-logistics-logo.svg
│   └── ...
```

The script strips the leading `files/` directory. Flat files such as `farm-logistics-hero.svg` are also accepted when their basename matches exactly one destination in the patch. The patch should list the target paths for every accompanying asset.

## Failure handling

If `git am` reports conflicts, the script exits without swallowing the conflict state. Resolve the merge by editing the files, then run:

```bash
git am --continue
```

or abort with:

```bash
git am --abort
```

This keeps the patch workflow deterministic and leaves the repo in a standard git state for follow-up fixes.
