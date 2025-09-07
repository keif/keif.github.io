---
author: Keith Baker
pubDatetime: 2025-09-07T04:00:00Z
modDatetime: 2025-09-07T04:00:00Z
title: Migrating from Gatsby to Astro
slug: migrating-from-gatsby-to-astro
featured: true
draft: false
tags:
  - astro
  - gatsby
  - migration
  - blog
description:
  A summary of the process and decisions behind migrating our blog from Gatsby to Astro, including content migration, performance benefits, and simplification of the stack.
---

I recently completed the migration of my (meager) blog from **Gatsby** to **Astro**. This decision was driven by my desire to simplify the tech stack, speed up builds, and eliminate unnecessary GraphQL and plugin complexity.

As fun as it is to work with it daily, sometimes, you just want to write, draw, create, y'know?

## Why I migrated

- **Build performance**: Astro builds are much faster than Gatsby.
- **Simpler stack**: No GraphQL layer or plugin maze.
- **Better content management**: Astro’s Content Collections API is type-safe and easier to manage.
- **Cleaner output**: Astro ships less JavaScript by default.

## Migration steps

1. **Removed Gatsby-specific files**:  
   Deleted files like `gatsby-config.js`, `gatsby-node.js`, and all Gatsby-specific components.

2. **Converted Markdown posts**:  
   Moved all posts from `src/pages/` to `src/data/blog/`, updating their frontmatter to align with AstroPaper conventions (`slug`, `pubDatetime`, `draft`, etc.).

3. **Migrated embeds**:  
   For example, Gatsby’s `gist:` shortcodes were replaced with a custom `<GistEmbed />` components in `.mdx` files.

4. **Adopted AstroPaper theme**:  
   Chose [AstroPaper](https://github.com/satnaing/astro-paper) for its clean design and Content Collections support.

5. **Enabled MDX support**:  
   Configured the project to support `.mdx` files so I can embed components in posts.

## Outcome

The result is a faster, cleaner, and easier-to-maintain blog. My dev experience has improved and adding new posts is now as simple as dropping an `.mdx` file into a folder.

If you’re considering migrating from Gatsby to Astro — do it. It’s worth it (so far).