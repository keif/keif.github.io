# Tag Filter Row Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trim the Header nav by removing Tags, move it to the Footer, and add a chip-style tag-filter row at the top of `/posts/` and `/tags/<tag>/` pages.

**Architecture:** Pure SSG — chips are `<a>` links to existing pre-built `/tags/<tag>/` pages. A new self-contained `TagFilterRow.astro` component fetches blog posts, derives unique tags, sorts by post count desc, slices the top 8. Highlights an `activeTag` prop when on a tag page. Zero JS shipped.

**Tech Stack:** Astro 6, Tailwind 4, content collections (`getCollection("blog")`).

**Spec:** `docs/superpowers/specs/2026-06-24-tag-filter-row-design.md`

**Verification gates per task (Option A — no test framework bootstrap):**
- `pnpm run build` (runs `astro check && astro build && pagefind`)
- `pnpm run lint`
- `pnpm run format:check`
- Visual QA via `pnpm run dev` where called out

---

## File Structure

| File | Operation | Responsibility |
|---|---|---|
| `src/utils/getUniqueTags.ts` | Modify | Add `count: number` to the returned `Tag` shape |
| `src/components/TagFilterRow.astro` | Create | Render top-8 chip nav with optional active highlight |
| `src/pages/posts/[...page].astro` | Modify | Insert `<TagFilterRow />` above `<PostsSortToggle />` |
| `src/pages/tags/[tag]/[...page].astro` | Modify | Insert `<TagFilterRow activeTag={tag} />` above the post list (non-redirect branch only) |
| `src/components/Header.astro` | Modify | Remove the `<li>` containing the `/tags` link |
| `src/components/Footer.astro` | Modify | Add a `Tags` link in a new small links row |

---

### Task 1: Cut feature branch

**Files:** none (git only)

- [ ] **Step 1: Create and check out the branch**

Run from repo root:

```bash
git checkout main
git pull --ff-only
git checkout -b feat/tag-filter-row
```

Expected: `Switched to a new branch 'feat/tag-filter-row'`.

---

### Task 2: Extend `getUniqueTags` with a `count` field

**Files:**
- Modify: `src/utils/getUniqueTags.ts`

**Why:** The chip row needs to sort tags by popularity. The current helper returns `{ tag, tagName }` only. Adding `count` is non-breaking for the existing consumer (`/tags/index.astro`) which destructures only `tag` and `tagName`.

- [ ] **Step 1: Replace the file contents**

Full new file contents (overwrite):

```typescript
import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import postFilter from "./postFilter";

interface Tag {
    tag: string;
    tagName: string;
    count: number;
}

const getUniqueTags = (posts: CollectionEntry<"blog">[]) => {
    const filteredPosts = posts.filter(postFilter);
    const tagCounts = new Map<string, { tagName: string; count: number }>();

    for (const post of filteredPosts) {
        for (const rawTag of post.data.tags) {
            const slug = slugifyStr(rawTag);
            const existing = tagCounts.get(slug);
            if (existing) {
                existing.count += 1;
            } else {
                tagCounts.set(slug, { tagName: rawTag, count: 1 });
            }
        }
    }

    const tags: Tag[] = Array.from(tagCounts.entries())
        .map(([slug, { tagName, count }]) => ({ tag: slug, tagName, count }))
        .sort((a, b) => a.tag.localeCompare(b.tag));

    return tags;
};

export default getUniqueTags;
```

**Notes:**
- The alphabetical sort (`localeCompare`) is preserved — `/tags/index.astro` depends on it for the all-tags listing.
- `Tag` is now exported-via-inference through the function return — existing consumers continue to work.

- [ ] **Step 2: Run the build to confirm type-check + build still pass**

```bash
pnpm run build
```

Expected: 170 pages built, 0 errors. The Zod `string().url()` deprecation warnings in `content.config.ts` are pre-existing and unrelated.

- [ ] **Step 3: Commit**

```bash
git add src/utils/getUniqueTags.ts
git commit -m "feat(tags): add count to getUniqueTags return shape"
```

---

### Task 3: Create the `TagFilterRow.astro` component

**Files:**
- Create: `src/components/TagFilterRow.astro`

- [ ] **Step 1: Create the file with this content**

```astro
---
import { getCollection } from "astro:content";
import getUniqueTags from "@/utils/getUniqueTags";

export interface Props {
    activeTag?: string;
}

const { activeTag } = Astro.props;

const posts = await getCollection("blog", ({ data }) => !data.draft);
const topTags = getUniqueTags(posts)
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
---

<nav aria-label="Browse posts by tag" class="my-4">
    <ul class="flex flex-wrap gap-2 p-0 list-none">
        {
            topTags.map(({ tag, tagName }) => (
                <li>
                    <a
                        href={`/tags/${tag}/`}
                        class:list={[
                            "inline-flex items-center rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-accent hover:text-background",
                            { "active-nav": activeTag === tag },
                        ]}
                    >
                        {tagName}
                    </a>
                </li>
            ))
        }
    </ul>
</nav>
```

**Notes on styling:**
- `border-border`, `bg-accent`, `text-background`, `active-nav` are all existing tokens/classes used elsewhere in the repo (see `Header.astro` for `active-nav` usage and the header's `border-b border-border` for `border-border`).
- Pill shape via `rounded-full` distinguishes the chip row visually from the existing inline `Tag.astro` component (which uses underlined-dashed styling).

- [ ] **Step 2: Verify the build still passes (component is created but not yet wired in)**

```bash
pnpm run build
```

Expected: clean build. Astro's TypeScript check will validate the component compiles even though nothing renders it yet.

- [ ] **Step 3: Commit**

```bash
git add src/components/TagFilterRow.astro
git commit -m "feat(tags): add TagFilterRow chip-row component"
```

---

### Task 4: Render `TagFilterRow` on `/posts/` and `/tags/<tag>/` pages

**Files:**
- Modify: `src/pages/posts/[...page].astro`
- Modify: `src/pages/tags/[tag]/[...page].astro`

- [ ] **Step 1: Edit `src/pages/posts/[...page].astro`**

Add the import (alongside existing imports):

```astro
import TagFilterRow from "@/components/TagFilterRow.astro";
```

Insert `<TagFilterRow />` above `<PostsSortToggle />`. The `<Main>` block should look like:

```astro
<Main pageTitle="Posts" pageDesc="All the articles I've posted.">
    <TagFilterRow />
    <PostsSortToggle currentSort="modified" />
    <ul>
        {page.data.map(data => <Card {...data} />)}
    </ul>
</Main>
```

- [ ] **Step 2: Edit `src/pages/tags/[tag]/[...page].astro`**

Add the import (alongside existing imports):

```astro
import TagFilterRow from "@/components/TagFilterRow.astro";
```

Insert `<TagFilterRow activeTag={tag} />` inside the **non-redirect branch only** (the `else` arm of the `redirectTo` ternary), after the `<h1 slot="title">` line:

```astro
<Main
    pageTitle={[`Tag:`, `${tagName}`]}
    titleTransition={tag}
    pageDesc={`All the articles with the tag "${tagName}".`}
>
    <h1 slot="title" transition:name={tag}>{`Tag:${tag}`}</h1>
    <TagFilterRow activeTag={tag} />
    <ul>
        {page && page.data.map((data) => (
            <Card {...data} />
        ))}
    </ul>
</Main>
```

Do **not** insert it inside the redirect branch — that branch returns a bare `<html>` with a meta-refresh and should stay minimal.

**Known edge case to verify in QA:** `params.tag` is the URL slug produced by `sanitizeTag(rawTag)`. The TagFilterRow's chip slugs come from `slugifyStr(rawTag)` (inside `getUniqueTags`). For canonical tags these typically match, but if a visual QA on `/tags/<tag>/` shows the active chip is NOT highlighted, the cause is a slug mismatch between `sanitizeTag` and `slugifyStr`. Resolution: pass the slugified form to `activeTag` (e.g., compute it from `tagName` in the page frontmatter) or normalize one of the helpers.

- [ ] **Step 3: Run the build**

```bash
pnpm run build
```

Expected: clean.

- [ ] **Step 4: Visual QA in dev server**

```bash
pnpm run dev
```

Then in a browser:
- Open `http://localhost:4321/posts/` → chip row appears above the sort toggle; chips are clickable.
- Click a chip → navigates to `/tags/<tag>/`; chip row appears again at the top with that tag highlighted (active state).
- Click a different chip on the tag page → navigates to the new tag page with the new chip highlighted.
- Resize browser to mobile width → chips wrap to multiple rows cleanly (no overflow, no horizontal scroll).

Stop the dev server (`Ctrl+C`).

- [ ] **Step 5: Commit**

```bash
git add src/pages/posts/[...page].astro src/pages/tags/[tag]/[...page].astro
git commit -m "feat(tags): render TagFilterRow on posts and tag pages"
```

---

### Task 5: Reshuffle Tags nav (Header out, Footer in)

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Edit `src/components/Header.astro`**

Delete the entire `<li>` block for Tags (currently around lines 78-82 — find by content, not line number):

```astro
<li class="col-span-2 sm:col-span-1">
    <a href="/tags" class:list={{ "active-nav": isActive("/tags") }}>
      Tags
    </a>
</li>
```

The resulting nav `<ul>` should have Blog, About, Now, Projects, Meetups, then the conditional Archives + the Socials/Search/Theme row.

- [ ] **Step 2: Edit `src/components/Footer.astro`**

Add a small links row above the existing flex container. The full new file:

```astro
---
import Hr from "./Hr.astro";
import Socials from "./Socials.astro";

const currentYear = new Date().getFullYear();

export interface Props {
    noMarginTop?: boolean;
}

const { noMarginTop = false } = Astro.props;
---

<footer class:list={["w-full", { "mt-auto": !noMarginTop }]}>
    <Hr noPadding />
    <nav aria-label="Footer links" class="flex justify-center gap-6 pt-4 text-sm">
        <a href="/tags/" class="hover:text-accent">Tags</a>
    </nav>
    <div
        class="flex flex-col items-center justify-between py-6 sm:flex-row-reverse sm:py-4"
    >
        <Socials centered />
        <div class="my-2 flex flex-col items-center sm:items-start">
            <div class="flex flex-col items-center whitespace-nowrap sm:flex-row">
                <span>Copyright &#169; {currentYear}</span>
                <span class="hidden sm:inline">&nbsp;|&nbsp;</span>
                <span>All rights reserved.</span>
            </div>
            <div class="mt-1 text-xs text-skin-base opacity-70">
                <span>Some links may be affiliate links.</span>
            </div>
        </div>
    </div>
</footer>
```

**Note:** The `<nav>` element + `gap-6` leaves room for future footer links (Archives, etc.) without restructuring.

- [ ] **Step 3: Run build and lint**

```bash
pnpm run build
pnpm run lint
```

Expected: both clean.

- [ ] **Step 4: Visual QA in dev server**

```bash
pnpm run dev
```

Then in browser:
- Header no longer shows Tags link.
- Footer shows Tags link above the copyright row.
- Click footer Tags link → lands on `/tags/` index page (all tags listing, unchanged).
- All other Header links (Blog, About, Now, Projects, Meetups) still work.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro
git commit -m "feat(nav): move Tags from Header to Footer"
```

---

### Task 6: Final QA, push, open PR

**Files:** none (verification + git only)

- [ ] **Step 1: Run all CI gates locally**

```bash
pnpm run build
pnpm run lint
pnpm run format:check
```

All three must be clean. If `format:check` complains, run `pnpm run format` and re-check.

- [ ] **Step 2: Final visual sweep**

```bash
pnpm run dev
```

Walk through:
- `/` (home) — Header has 5 nav items, no Tags. Footer has Tags link.
- `/posts/` — chip row above sort toggle; ~8 chips; no chip highlighted.
- `/posts/2/` (paginated) — chip row appears on every paginated page.
- `/tags/` — unchanged.
- `/tags/astro/` (or any popular tag) — chip row at top, current tag highlighted as active.
- Switch tag via a chip — active highlight follows.
- Mobile viewport (DevTools → 375px wide) — chips wrap cleanly; nothing overflows.
- Dark mode toggle (if enabled) — chip border + active state still readable.

Stop the dev server.

- [ ] **Step 3: Push the branch**

```bash
git push -u origin feat/tag-filter-row
```

- [ ] **Step 4: Open the PR**

```bash
gh pr create --title "feat(nav): tag filter row + tags nav relocation" --body "$(cat <<'EOF'
## Summary

Implements the tag-filter-row design ([spec](docs/superpowers/specs/2026-06-24-tag-filter-row-design.md)).

- Removes the Tags link from the Header nav (now 5 items instead of 6).
- Adds Tags link to the Footer.
- Adds a top-8-by-post-count chip row at the top of `/posts/` and `/tags/<tag>/` pages.
- Chips are pure `<a>` links to existing `/tags/<tag>/` pages — zero JS shipped.
- Active tag highlighted on `/tags/<tag>/` pages via the existing `active-nav` class.

## Files touched

- `src/utils/getUniqueTags.ts` — added `count` to returned shape
- `src/components/TagFilterRow.astro` — new component
- `src/pages/posts/[...page].astro` — render chip row
- `src/pages/tags/[tag]/[...page].astro` — render chip row with active tag
- `src/components/Header.astro` — remove Tags `<li>`
- `src/components/Footer.astro` — add Tags link in new footer nav row

## Test plan

- [x] `pnpm run build` clean (170 pages, 0 errors)
- [x] `pnpm run lint` clean
- [x] `pnpm run format:check` clean
- [x] Visual QA on `/posts/`, `/tags/<tag>/`, Header, Footer
- [x] Mobile responsive — chip wrapping verified at 375px width
- [x] Active state verified on a tag page
EOF
)"
```

- [ ] **Step 5: Run codex review gate before merging**

Per `~/.claude/CLAUDE.md`, the local codex review is required before merging any PR:

```bash
/codex review
```

If `[P1]` findings → fix and re-run. If clear → merge:

```bash
gh pr merge <PR#> --merge --delete-branch
git checkout main
git pull --ff-only
```

---

## Out of scope (will not be done in this plan)

- No URL query params or client-side filter logic — chips are pure navigation.
- No "All posts" reset chip on `/tags/<tag>/` — Header link to `/posts/` already does this.
- No promotion of `/overthinking` into the chip row — tracked separately as a memory item.
- No additional Footer links beyond Tags — the `<nav>` structure leaves room for them later.
