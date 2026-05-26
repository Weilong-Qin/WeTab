# Fix CI artifact upload

## Goal
Fix GitHub Actions packaging workflow so the zip artifact produced by `wxt zip` is reliably found and uploaded.

## What I already know
* Workflow `package-extension.yml` uploads `.output/**/*.zip` but CI still reports no files found.
* Locally, `npm run zip` produces `.output/wetab-0.1.0-chrome.zip` (WXT 0.20.26).
* Current workflow runs: install -> test -> lint -> typecheck -> build -> zip -> upload artifact.
* CI logs show `.output/wetab-0.1.0-chrome.zip` exists, but upload-artifact still reports no files found.

## Assumptions (temporary)
* CI is running the updated workflow that includes the artifact listing step.
* The zip step completes without a non-zero exit (otherwise the job would fail earlier).

## Open Questions
* None (CI logs confirm the zip exists in `.output/`).

## Requirements (evolving)
* CI must always upload the WXT zip artifact produced by `npm run zip`.
* Artifact path should be robust to WXT output directory structure.

## Acceptance Criteria (evolving)
* [ ] GitHub Actions run uploads at least one `.zip` artifact after `npm run zip`.
* [ ] The workflow fails if no zip is produced (to avoid silent release failures).

## Definition of Done (team quality bar)
* CI green on a `v*` tag push.
* Workflow logs show zip output path before upload.

## Out of Scope (explicit)
* Changing the extension packaging format or switching build tools.

## Technical Notes
* Workflow: `.github/workflows/package-extension.yml`
* Local WXT output: `.output/wetab-0.1.0-chrome.zip`
* `actions/upload-artifact@v4` defaults to `include-hidden-files: false`, so dot-prefixed `.output/` can be ignored unless enabled.
