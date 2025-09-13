import { getCollection } from "astro:content";

export async function getFeaturedPosts(limit = 6) {
    const posts = await getCollection("blog");

    // Separate evergreen and featured
    const evergreen = posts.filter(p => p.data.evergreen);
    const candidates = posts.filter(p => p.data.featured && !p.data.evergreen);

    // Sort candidates by date (newest first)
    candidates.sort(
        (a, b) =>
            new Date(b.data.modDatetime || b.data.pubDatetime).getTime() -
            new Date(a.data.modDatetime || a.data.pubDatetime).getTime()
    );

    // Rotate posts
    const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    candidates.sort((a, b) => a.slug.localeCompare(b.slug));
    const rotated = candidates.slice(week % candidates.length, week % candidates.length + slots);

    // Always include 1 evergreen if it exists
    const picked: typeof candidates = [];
    if (evergreen.length > 0) {
        picked.push(evergreen[0]);
    }

    // Fill the rest from rotating candidates
    const slots = limit - picked.length;
    picked.push(...candidates.slice(0, slots));

    return picked;
}