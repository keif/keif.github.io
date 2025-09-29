// Utility function to sanitize tags for consistent formatting
export default function sanitizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/\./g, "-")
    .replace(/-+/g, "-");
}
