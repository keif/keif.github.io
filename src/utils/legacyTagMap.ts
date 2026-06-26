// Maps old URL tag patterns (as previously crawled by Google) to the canonical
// slugified tag. Used by src/pages/tags/[tag]/[...page].astro to generate
// redirect routes from the old URL to the current canonical /tags/<slug>/.
//
// Only entries where the old pattern actually differs from sanitizeTag(old) are
// useful — pure case-only variants (e.g. "Python" -> "python") are no-ops since
// the route generator already lowercases via sanitizeTag, and including them
// causes Astro's static-path dedup to overwrite the canonical with the redirect.
//
// Each entry's left side is the old URL pattern; right side is the current
// canonical slug (must match the slugifyStr output used by getUniqueTags).
const legacyTagMap: Record<string, string> = {
    // Tags with dots/special characters
    "Socket.IO": "socket-io",
    "Node.js": "node-js",
    "node.js": "node-js",
    "next.js": "next-js",
    "Fly.io": "fly-io",

    // Tags with spaces
    "Tailwind CSS": "tailwind-css",
    "Spotify API": "spotify-api",
    "Image Optimization": "image-optimization",
    "Developer Experience": "developer-experience",
    "Real-Time": "real-time",

    // Tags with slashes
    "CI/CD": "ci-cd",

    // CamelCase/PascalCase tags
    BusyTag: "busy-tag",
    DevOps: "dev-ops",
    JavaScript: "java-script",
    TypeScript: "type-script",
    YouTube: "you-tube",
    ContextAPI: "context-api",
    ReactJS: "react-js",

    // Legacy tag that no longer exists (redirect to closest match)
    node: "node-js",
};

export default legacyTagMap;
