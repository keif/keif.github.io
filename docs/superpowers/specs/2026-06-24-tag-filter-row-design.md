# Tag Filter Row + Tag Nav Relocation — Design

**Date:** 2026-06-24
**Status:** Approved, ready for implementation plan

## Summary

Trim the Header nav by removing the `/tags` link, move it to the Footer, and replace its old utility with a chip-style tag-filter row that appears at the top of `/posts/` and `/tags/<tag>/` pages. Chips are pure `<a>` links to the existing per-tag pages — zero JS, fully static.

## Motivation

The Header nav currently lists six items (Posts, Tags, About, Now, Projects, Meetups) plus Archives/Search. Tags is the lowest-value destination in the set — a list of tags is a finding aid, not a place readers go on purpose. Demoting it to the Footer reclaims primary-nav real estate, and a chip row on the content pages turns tags into the navigation surface they were always meant to be.

## Decisions

Three structural forks were locked in during brainstorming:

1. **Chips are navigation, not in-place filter.** Clicking a chip navigates to `/tags/<tag>/` (Astro pre-builds these pages). No client-side state, no URL query params, no JS shipped. Rationale: native fit for an SSG site; per-tag pages already exist and are indexable.
2. **Top N by post count.** The chip row renders the N most-used tags, sorted by post count descending. Long-tail tags are reachable via the `/tags/` link in the Footer. Rationale: keeps the chip row useful without it becoming a wall of tags.
3. **Symmetric across `/posts/` and `/tags/<tag>/`.** The same chip row appears on both pages; on tag pages the current tag is highlighted as the active chip. Rationale: tag-to-tag switching becomes one click from any tag page, instead of requiring a back-trip to `/posts`.

## Files touched

| File | Change |
|---|---|
| `src/components/Header.astro` | Remove the `<a href="/tags">Tags</a>` list item |
| `src/components/Footer.astro` | Add a `Tags` link alongside the existing Socials/copyright row |
| `src/components/TagFilterRow.astro` | **New.** Renders the chip row. Props: `activeTag?: string`. |
| `src/pages/posts/[...page].astro` | Insert `<TagFilterRow />` above `<PostsSortToggle />` |
| `src/pages/tags/[tag]/[...page].astro` | Insert `<TagFilterRow activeTag={tag} />` above the post list |
| `src/utils/getUniqueTags.ts` | Extend the returned `Tag` shape with `count: number` (current shape is `{ tag, tagName }` alphabetized). Non-breaking — existing consumer `/tags/index.astro` can keep ignoring the new field. |

## Component contract — `TagFilterRow.astro`

**Props:**
- `activeTag?: string` — the slug of the current tag, if any. When present, the matching chip gets active styling.

**Behavior:**
- Calls `getCollection("blog", ({ data }) => !data.draft)` itself (self-contained, no prop-drilling).
- Derives unique tags via the existing `getUniqueTags()` helper.
- Sorts by `count` descending; slices the top 8.
- Each chip is `<a href="/tags/<slug>/">` with the tag name as text. No post counts shown on chips.
- The chip whose slug matches `activeTag` renders with `active-nav` styling (the same class Header uses for current-page indication).

**No JS, no event handlers, no client directive.**

## Visual defaults

| Choice | Default | Notes |
|---|---|---|
| N (chip count) | 8 | Fits one row on desktop, wraps to 2–3 rows on mobile. |
| Show post counts on chips | No | Chip row is for discovery, not census. |
| Active state | `active-nav` class (matches Header) | Reuses existing accent treatment for consistency. |
| Placement on `/posts/` | Above `<PostsSortToggle />` | Filter-first read order: pick a slice, then choose sort. |
| Placement on `/tags/<tag>/` | Top of content area | Visual continuity with `/posts/`. |
| Footer link label | `Tags` | Sits alongside the existing Socials/copyright row. |

## Out of scope (explicit non-goals)

- No URL query params, no client-side state, no JS bundle.
- No keyboard-shortcut affordances beyond what `<a>` already gives.
- No "All posts" reset chip on `/tags/<tag>/` — the Header link to `/posts/` already does this.
- No promotion of `/overthinking` into the chip row. That collection is tracked separately for nav promotion once it has 3–4 entries.
- No analytics, no telemetry on chip clicks.
- No drag-to-reorder, no user-saved chip sets, no per-visitor personalization.

## Acceptance criteria

- `/posts/` renders the chip row above the sort toggle. Chips are clickable links to `/tags/<tag>/` pages.
- `/tags/<tag>/` renders the chip row with the current tag visually highlighted.
- The Header no longer contains a Tags link.
- The Footer contains a Tags link to `/tags/`.
- `pnpm run build` passes (`astro check && astro build && pagefind`) with zero new errors.
- View source on `/posts/` shows no JS associated with the chip row — purely static `<a>` tags.
- The chip row reflects current top-8-by-count tags without manual upkeep when new posts are added.

## Open questions

None. Visual defaults can be adjusted in implementation if a build artifact looks wrong, but no further design input is needed before plan-writing.
