# Design Brief: Command Center Redesign

## Discovery Summary
- **Target**: Power users requiring high-density information.
- **Register**: Product (Expert tool).
- **Core Aesthetic**: "Command Center"—precise, technical, non-decorative.
- **Problem**: Current UI is cluttered with redundant text and excessive whitespace.

## UX Architecture
- **Layout**: High-density Grid. Focus on horizontal and vertical density to maximize elements per viewport.
- **Navigation**: Search is fixed in the top bar for omnipresent access.
- **Component: Bookmark Card**:
  - Elements: Favicon + Title only.
  - No explicit labels (e.g., no "Name:", no "URL:").
  - Interactions: Precise hover states, no bouncy animations.

## Visual Design
- **Color Strategy**: Restrained. Tinted neutrals with high-contrast text.
- **Theme Scene**: "A software engineer navigating hundreds of resources in a focused terminal-like environment." Light/Dark support via OKLCH.
- **Typography**: Inter (already in use), but tightened. Smaller base sizes (e.g., 13px/14px) for cards to support density.
- **Spacing**: Reduced gutters and paddings. Use structured hierarchy (font weight/color) over whitespace.

## Implementation Scope
- **Fidelity**: Production-ready.
- **Interactivity**: Fully functional React components.
- **Friction Reduction**: Remove all "helper" text that explains the obvious.

## Constraints & Anti-Goals
- **Anti-Goal**: Avoid the "SaaS-cliché" (no huge cards, no pastel gradients).
- **Constraint**: Must use existing `bookmarkService` and `lucide-react` icons.
