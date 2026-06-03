# Add GitHub Actions release packaging

## Goal

Add a GitHub Actions workflow that validates and packages the WXT browser extension when the repository is pushed to GitHub. Tagged releases should automatically publish the generated extension zip to GitHub Releases.

## What I already know

* The project is a WXT + React + TypeScript Chromium extension.
* `package.json` already defines `build`, `zip`, `lint`, `test`, and `typecheck` scripts.
* WXT build output is ignored locally through `.output/`, so CI should upload release artifacts explicitly.
* There is no existing `.github/workflows/` directory.

## Assumptions

* Release publishing should be driven by Git tags matching `v*`, such as `v0.1.0`.
* Normal branch pushes and pull requests should validate the project and upload the packaged zip as a workflow artifact, but should not create a GitHub Release.
* The repository should avoid adding third-party release dependencies when the GitHub-hosted runner already provides the `gh` CLI.

## Requirements

* Add a GitHub Actions workflow under `.github/workflows/`.
* Run on pull requests, pushes to `master`, and `v*` tags.
* Install dependencies with `npm ci`.
* Run `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run zip` sequentially.
* Upload generated `.output/*.zip` files as workflow artifacts.
* On tag builds only, create or update a GitHub Release and upload the zip files.

## Acceptance Criteria

* [ ] A workflow file exists and can package the extension without local-only assumptions.
* [ ] Tag pushes matching `v*` publish `.output/*.zip` files to a GitHub Release.
* [ ] Non-tag CI runs do not attempt to create releases.
* [ ] Workflow syntax is valid YAML.
* [ ] Local quality commands relevant to this change pass, or any blockers are documented.

## Out of Scope

* Chrome Web Store publishing.
* Firefox/addon store packaging.
* Code signing.
* Changing WXT build configuration or extension manifest versioning.

## Technical Notes

* Inspected `package.json`, `wxt.config.ts`, `.gitignore`, and Trellis specs.
* Frontend quality spec requires sequential `test`, `lint`, `typecheck`, and `build`; build must not run concurrently with typecheck because it cleans WXT generated state.
