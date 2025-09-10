export function getReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return `${minutes} min read`;
}

export function getReadingTimeFromMarkdown(markdown: string): string {
  // Remove frontmatter
  const withoutFrontmatter = markdown.replace(/^---[\s\S]*?---/, '');
  
  // Remove markdown syntax
  const plainText = withoutFrontmatter
    .replace(/#{1,6}\s+/g, '') // headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italic
    .replace(/`(.*?)`/g, '$1') // inline code
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/>\s+/g, '') // blockquotes
    .replace(/^\s*[-*+]\s+/gm, '') // list items
    .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
    .replace(/^\s*\|.*?\|.*?$/gm, '') // tables
    .replace(/\n{2,}/g, '\n') // multiple newlines
    .trim();

  return getReadingTime(plainText);
}