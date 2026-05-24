<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

## Project Overview

vTab is a Chromium-first new-tab browser extension for rendering and managing native browser bookmarks as a homepage navigation workspace. The current frontend is a WXT + React + TypeScript app that ports the `tmp.html` Digital Air visual system into reusable local CSS tokens and components.

## Frontend Directory Structure

- `entrypoints/newtab/` contains the browser new-tab replacement.
- `entrypoints/options/` contains extension settings, starting with OpenAI-compatible LLM configuration.
- `entrypoints/design-system/` is a development-only preview surface for validating tokens and reusable components.
- `src/components/` contains reusable UI primitives and composed layout components.
- `src/pages/` contains thin page assemblies that compose existing components.
- `src/styles/` contains global CSS, design tokens, and shared component class styles.
- `src/services/` isolates browser/platform integration boundaries from presentation components.
- `src/data/` contains sample data used until native bookmark integration is wired in.
- `src/types/` contains shared TypeScript view-model types.

## Design System Architecture

The Digital Air design system is token-first. Colors, typography, spacing, radius, effects, and responsive shell measurements live in `src/styles/tokens.css`. Shared component and layout styles live in `src/styles/global.css`; pages should not repeat large style stacks.

Reusable components cover the app shell, sidebar navigation, top search, buttons, glass panels, bookmark cards, tags, empty states, and preview examples. Components accept focused props and `className` where useful so callers can compose variants without cloning similar implementations.

## Component Reuse Rules

- Develop pages by reusing existing components first.
- Only add a new component when existing components cannot satisfy the need.
- Extend existing components with props, variants, or `className` before creating similar components.
- Keep browser APIs and storage logic behind services instead of calling platform APIs directly from React components.
- Keep page files thin: they should orchestrate state and compose components, not define new visual systems.

## Future Development Notes

- Native browser bookmarks remain the source of truth; extension-only metadata should stay in sidecar services keyed by bookmark IDs.
- Search should continue to cover title, URL/domain, and folder path before adding heavier semantic search.
- LLM-assisted organization must remain opt-in and reviewable before any bookmark write occurs.
- If the design system gains new primitives, add them to the development preview page so visual regressions are easy to spot.
