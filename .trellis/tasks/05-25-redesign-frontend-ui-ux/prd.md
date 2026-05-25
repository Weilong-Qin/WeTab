# PRD: Frontend Redesign (Command Center)

## Context
vTab is being evolved from a standard bookmark manager to a high-density "Command Center" for power users. The current UI is too "SaaS-cliché" with excessive whitespace and redundant text labels.

## Goals
- Transition the UI to a "Command Center" aesthetic (precise, technical, high-performance).
- Overhaul the design language to prioritize information density.
- Eliminate redundant text descriptions and labels.
- Ensure the interface feels like an expert tool (e.g., similar to Raycast or a modern terminal).

## Core Requirements
- **Refined App Shell**: More compact navigation and search.
- **High-Density Bookmark Cards**: Redesign `BookmarkCard.tsx` to show more data in less space. Remove labels like "URL:".
- **Visual Hierarchy**: Use weight, color (OKLCH), and alignment to communicate structure rather than borders or explicit labels.
- **Performance Feedbacks**: Fast, precise transitions (no "bouncy" animations).

## Technical Decisions
- Use OKLCH for all colors.
- Strict adherence to the `product` register's shared design laws.
- No em-dashes.
- No "hero-metric" patterns.

## Success Criteria
- Information density increased significantly.
- Professional, technical feel confirmed via UI review.
- No accessibility regressions.
