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
        const seenInThisPost = new Set<string>();
        for (const rawTag of post.data.tags) {
            const slug = slugifyStr(rawTag);
            if (seenInThisPost.has(slug)) continue;
            seenInThisPost.add(slug);
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
