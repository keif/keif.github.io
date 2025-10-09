#!/usr/bin/env node

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import yaml from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');

// Configuration
const DEFAULT_CONFIG = {
  defaultAuthor: 'Blog Author',
  blogDir: 'src/data/blog'
};

function loadConfig() {
  const configPath = join(ROOT_DIR, 'date-manager.config.json');
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      return { ...DEFAULT_CONFIG, ...config };
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  Warning: Could not parse config file, using defaults`);
    }
  }
  return DEFAULT_CONFIG;
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function parseTagsArg(tagsStr) {
  if (!tagsStr) return ['others'];
  return tagsStr.split(',').map(tag => tag.trim()).filter(Boolean);
}

function generateUniqueFilename(baseSlug) {
  const config = loadConfig();
  const blogDir = join(ROOT_DIR, config.blogDir);
  
  let filename = `${baseSlug}.md`;
  let counter = 1;
  
  while (existsSync(join(blogDir, filename))) {
    filename = `${baseSlug}-${counter}.md`;
    counter++;
  }
  
  return filename;
}

async function promptForPostDetails() {
  const questions = [
    {
      type: 'text',
      name: 'title',
      message: 'Post title:',
      validate: value => value.trim().length > 0 ? true : 'Title is required'
    },
    {
      type: 'text',
      name: 'description',
      message: 'Description:',
      initial: 'A brief description of this post'
    },
    {
      type: 'text',
      name: 'author',
      message: 'Author:',
      initial: loadConfig().defaultAuthor
    },
    {
      type: 'list',
      name: 'tags',
      message: 'Tags (comma-separated):',
      initial: 'others',
      separator: ','
    },
    {
      type: 'confirm',
      name: 'featured',
      message: 'Featured post?',
      initial: false
    },
    {
      type: 'select',
      name: 'status',
      message: 'Post status:',
      choices: [
        { title: 'Draft', value: 'draft' },
        { title: 'Published', value: 'published' }
      ],
      initial: 0
    }
  ];

  return await prompts(questions);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const flagName = arg.slice(2);
      
      if (flagName === 'tags' || flagName === 'author' || flagName === 'description') {
        // These flags expect a value
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          flags[flagName] = args[++i];
        }
      } else {
        // Boolean flags
        flags[flagName] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}

function createFrontmatter(details) {
  const now = new Date().toISOString();
  const slug = slugify(details.title);
  
  const frontmatter = {
    title: details.title,
    author: details.author || loadConfig().defaultAuthor,
    pubDatetime: now,
    slug: slug,
    featured: details.featured || false,
    draft: details.status === 'draft',
    tags: Array.isArray(details.tags) ? details.tags : parseTagsArg(details.tags),
    description: details.description || 'A brief description of this post'
  };

  return frontmatter;
}

function createPostContent(frontmatter) {
  const yamlString = yaml.stringify(frontmatter, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false
  }).trim();

  return `---
${yamlString}
---

# ${frontmatter.title}

Your post content goes here...
`;
}

async function main() {
  const { flags, positional } = parseArgs();
  
  let postDetails;

  if (positional.length > 0 || Object.keys(flags).length > 0) {
    // Non-interactive mode
    postDetails = {
      title: positional[0] || 'New Post',
      description: flags.description || 'A brief description of this post',
      author: flags.author || loadConfig().defaultAuthor,
      tags: flags.tags || 'others',
      featured: flags.featured || false,
      status: flags.published ? 'published' : 'draft'
    };
  } else {
    // Interactive mode
    // eslint-disable-next-line no-console
    console.log('📝 Creating a new blog post...\n');
    postDetails = await promptForPostDetails();
    
    // Check if user cancelled
    if (!postDetails.title) {
      // eslint-disable-next-line no-console
      console.log('\n❌ Post creation cancelled');
      process.exit(0);
    }
  }

  const frontmatter = createFrontmatter(postDetails);
  const content = createPostContent(frontmatter);
  const filename = generateUniqueFilename(frontmatter.slug);
  const config = loadConfig();
  const filePath = join(ROOT_DIR, config.blogDir, filename);

  try {
    writeFileSync(filePath, content, 'utf-8');
    // eslint-disable-next-line no-console
    console.log(`\n✅ Post created successfully!`);
    // eslint-disable-next-line no-console
    console.log(`📄 File: ${join(config.blogDir, filename)}`);
    // eslint-disable-next-line no-console
    console.log(`🏷️  Title: ${frontmatter.title}`);
    // eslint-disable-next-line no-console
    console.log(`📅 Date: ${frontmatter.pubDatetime}`);
    // eslint-disable-next-line no-console
    console.log(`🏃 Status: ${frontmatter.draft ? 'Draft' : 'Published'}`);
    
    if (frontmatter.featured) {
      // eslint-disable-next-line no-console
      console.log(`⭐ Featured: Yes`);
    }
    
    // eslint-disable-next-line no-console
    console.log(`🏷️  Tags: ${frontmatter.tags.join(', ')}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`❌ Failed to create post: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(`❌ Unexpected error: ${err.message}`);
  process.exit(1);
});