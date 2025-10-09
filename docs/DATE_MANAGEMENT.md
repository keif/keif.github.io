# Automatic Date Management

This system automatically manages `pubDatetime` and `modDatetime` fields in blog post frontmatter using Git hooks and CLI tools.

## Overview

- **New posts**: Automatically get `pubDatetime` set to creation time
- **Modified posts**: Automatically get `modDatetime` updated on commit via pre-commit hook
- **Date format**: ISO 8601 UTC with milliseconds (e.g., `2025-06-09T02:41:38.032Z`)
- **Blog location**: `src/data/blog/**/*.{md,mdx}`

## Commands

### Create New Posts

```bash
# Interactive mode - prompts for all details
pnpm new-post

# Command line mode
pnpm new-post "My Post Title" --tags "javascript,tutorial" --featured --published --author "Your Name"
```

**Flags:**
- `--tags "tag1,tag2"` - Comma-separated tags
- `--featured` - Mark as featured post
- `--published` - Publish immediately (default: draft)
- `--author "Name"` - Set author
- `--description "Text"` - Set description

### Update Dates

```bash
# Update dates for changed files only
pnpm update-dates

# Force update all blog posts
pnpm update-dates:force

# Dry run - see what would change
pnpm update-dates -- --dry-run

# Update specific files
pnpm update-dates src/data/blog/my-post.md
```

## Pre-commit Hook

The pre-commit hook automatically:
1. Detects modified blog posts in staging area
2. Sets `pubDatetime` for new posts (posts without this field)
3. Updates `modDatetime` for existing posts
4. Re-stages the updated files
5. Runs `lint-staged` if available

## Date Logic

| Scenario | Action |
|----------|--------|
| New post (no `pubDatetime`) | Set `pubDatetime = now` |
| Existing post | Set `modDatetime = now` |
| Unchanged post | No action |
| Non-blog file | Ignored |

## Configuration

Create optional `date-manager.config.json` in project root:

```json
{
  "contentGlob": "src/data/blog/**/*.{md,mdx}",
  "defaultAuthor": "Your Name",
  "blogDir": "src/data/blog"
}
```

## Frontmatter Format

Generated posts use this frontmatter structure:

```yaml
---
title: "Your Post Title"
author: "Author Name"
pubDatetime: 2025-06-09T02:41:38.032Z
slug: "your-post-title"
featured: false
draft: true
tags:
  - javascript
  - tutorial
description: "Brief description of the post"
---
```

## Examples

### Creating a Quick Draft
```bash
pnpm new-post "Quick Thoughts on React" --tags "react,thoughts"
```

### Publishing a Featured Post
```bash
pnpm new-post "Advanced TypeScript Patterns" \
  --tags "typescript,advanced,patterns" \
  --featured \
  --published \
  --author "Jane Doe"
```

### Checking What Would Change
```bash
pnpm update-dates -- --dry-run
```

### Force Update All Posts
```bash
pnpm update-dates:force
```

## Troubleshooting

### Hook Not Running
If the pre-commit hook isn't working:
1. Ensure Git hooks are executable: `chmod +x .husky/pre-commit`
2. Verify Husky is installed: `npx husky init`
3. Check the hook exists: `ls -la .husky/pre-commit`

### No Files Updated
Common reasons:
- Repository is clean (no changed files)
- Files are outside `src/data/blog/` directory
- Files are not `.md` or `.mdx` extensions
- Git is not available or not in a Git repository

### Wrong Directory Structure
If your blog posts are in a different location, update `date-manager.config.json`:

```json
{
  "contentGlob": "src/content/posts/**/*.{md,mdx}",
  "blogDir": "src/content/posts"
}
```

### Dates Not Updating
Check that:
1. Files are actually staged: `git status`
2. Pre-commit hook has execute permissions
3. Node.js can run the scripts: `node scripts/update-post-dates.js --help`

## Integration with CI/CD

The date management system is designed to be Git-centric and works in any environment where:
- Node.js 18+ is available
- Git is available
- Project dependencies are installed

For CI/CD pipelines, ensure the workspace has proper Git history and the user has commit permissions.