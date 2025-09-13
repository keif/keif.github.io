import { getCollection } from "astro:content";

export async function getFeaturedPosts(limit = 6) {
    const posts = await getCollection("blog");

    // Separate evergreen and featured
    const evergreen = posts.filter(p => p.data.evergreen);
    const candidates = posts.filter(p => p.data.featured && !p.data.evergreen && !p.data.draft);

    // Sort candidates by date (newest first)
    candidates.sort(
        (a, b) =>
            new Date(b.data.modDatetime || b.data.pubDatetime).getTime() -
            new Date(a.data.modDatetime || a.data.pubDatetime).getTime()
    );

    // Always include 1 evergreen if it exists (pick most recently updated)
    const picked: typeof candidates = [];
    if (evergreen.length > 0) {
        evergreen.sort(
            (a, b) =>
                new Date(b.data.modDatetime || b.data.pubDatetime).getTime() -
                new Date(a.data.modDatetime || a.data.pubDatetime).getTime()
        );
        picked.push(evergreen[0]);
    }

    // Compute remaining slots
    const slots = Math.max(limit - picked.length, 0);

    // Rotation: deterministic weekly rotation across the sorted candidates
    let rotated: typeof candidates = [];
    if (candidates.length > 0 && slots > 0) {
        const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
        const start = week % candidates.length;
        const take = Math.min(slots, candidates.length);
        for (let i = 0; i < take; i++) {
            rotated.push(candidates[(start + i) % candidates.length]);
        }
    }

    // Fill the rest from rotating candidates
    picked.push(...rotated);

    return picked;
}