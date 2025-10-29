# Project Scripts

Utility scripts for managing content and assets.

## capture-project-screenshots.js

Automatically captures screenshots of project websites using Playwright.

### Installation

First, install the required dependencies:

```bash
pnpm install
```

After Playwright is installed, you may need to install browser binaries:

```bash
npx playwright install chromium
```

### Usage

**Capture all project screenshots:**
```bash
pnpm run screenshot-projects
```

**Capture a specific project:**
```bash
pnpm run screenshot-projects pointpal
```

The script will:
1. Read all project files from `src/data/projects/`
2. Extract the project URL and slug
3. Launch a headless browser
4. Navigate to each URL
5. Capture a 1280x800 screenshot
6. Save to `public/images/projects/{slug}.png`

### Configuration

Edit the script to customize:
- `VIEWPORT`: Screenshot dimensions (default: 1280x800)
- `WAIT_TIMEOUT`: Page load timeout (default: 10 seconds)
- Full page vs viewport-only screenshots

### Notes

- Draft projects are automatically skipped
- Screenshots overwrite existing files
- The script waits 2 seconds after page load to ensure fonts/animations are ready
- Failed captures are logged but don't stop the script

## Other Scripts

- `new-post.js` - Create a new blog post with frontmatter template
- `update-post-dates.js` - Update modification dates on blog posts
- `rotate-featured.js` - Manage featured posts rotation
