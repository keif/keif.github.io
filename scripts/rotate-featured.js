#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import matter from 'gray-matter';
import yaml from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');

// Configuration
const DEFAULT_CONFIG = {
  contentGlob: 'src/data/blog/**/*.{md,mdx}',
  featuredCount: 6,
  excludePatterns: ['_releases/', 'examples/'] // Exclude certain directories
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

function findBlogFiles() {
  const config = loadConfig();
  const allFiles = [];
  
  try {
    const findCmd = process.platform === 'win32' 
      ? 'dir /s /b *.md *.mdx' 
      : 'find src -name "*.md" -o -name "*.mdx"';
    
    const files = execSync(findCmd, { encoding: 'utf-8', cwd: ROOT_DIR }).trim();
    
    files.split('\n')
      .filter(Boolean)
      .forEach(file => {
        // File is already relative from the find command
        const relativePath = file.startsWith(ROOT_DIR) ? relative(ROOT_DIR, file) : file;
        
        // Check if file is in blog directory and not excluded
        const isInBlogDir = relativePath.startsWith('src/data/blog/');
        const hasCorrectExt = relativePath.endsWith('.md') || relativePath.endsWith('.mdx');
        const isExcluded = config.excludePatterns.some(pattern => relativePath.includes(pattern));
        
        if (isInBlogDir && hasCorrectExt && !isExcluded) {
          allFiles.push(relativePath);
        }
      });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️  Warning: Could not find blog files: ${err.message}`);
  }

  return allFiles;
}

function getPostMetadata(filePath) {
  const fullPath = join(ROOT_DIR, filePath);
  const content = readFileSync(fullPath, 'utf-8');
  const { data: frontmatter } = matter(content);
  
  return {
    path: filePath,
    title: frontmatter.title || 'Untitled',
    pubDatetime: frontmatter.pubDatetime,
    featured: frontmatter.featured || false,
    draft: frontmatter.draft || false,
    tags: frontmatter.tags || []
  };
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function updateFeaturedStatus(filePath, shouldBeFeatured) {
  const fullPath = join(ROOT_DIR, filePath);
  const content = readFileSync(fullPath, 'utf-8');
  const { data: frontmatter, content: body } = matter(content);
  
  // Only update if the featured status actually changes
  if ((frontmatter.featured || false) === shouldBeFeatured) {
    return false;
  }
  
  frontmatter.featured = shouldBeFeatured;
  
  // Preserve frontmatter order
  const orderedFrontmatter = {};
  const preferredOrder = [
    'title', 'author', 'pubDatetime', 'modDatetime', 'slug', 
    'featured', 'draft', 'tags', 'description', 'excerpt'
  ];
  
  preferredOrder.forEach(key => {
    if (frontmatter.hasOwnProperty(key)) {
      orderedFrontmatter[key] = frontmatter[key];
    }
  });
  
  Object.keys(frontmatter).forEach(key => {
    if (!orderedFrontmatter.hasOwnProperty(key)) {
      orderedFrontmatter[key] = frontmatter[key];
    }
  });

  const yamlString = yaml.stringify(orderedFrontmatter, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false
  }).trim();
  
  const newContent = `---\n${yamlString}\n---\n${body}`;
  writeFileSync(fullPath, newContent, 'utf-8');
  
  return true;
}

function selectNewFeaturedPosts(posts, featuredCount) {
  // Filter out draft posts
  const publishedPosts = posts.filter(post => !post.draft);
  
  if (publishedPosts.length <= featuredCount) {
    // If we have fewer published posts than the target, feature them all
    return publishedPosts.map(post => post.path);
  }
  
  // Strategy: Mix of recent posts and random selection
  const sortedByDate = publishedPosts
    .filter(post => post.pubDatetime)
    .sort((a, b) => new Date(b.pubDatetime) - new Date(a.pubDatetime));
  
  const recentPosts = sortedByDate.slice(0, Math.ceil(featuredCount / 2));
  const remainingPosts = publishedPosts.filter(post => 
    !recentPosts.some(recent => recent.path === post.path)
  );
  
  const randomPosts = shuffleArray(remainingPosts)
    .slice(0, featuredCount - recentPosts.length);
  
  const selectedPosts = [...recentPosts, ...randomPosts];
  return shuffleArray(selectedPosts).map(post => post.path);
}

function main() {
  const args = process.argv.slice(2);
  const flags = {
    dryRun: args.includes('--dry-run'),
    count: args.find(arg => arg.startsWith('--count='))?.split('=')[1] || null
  };
  
  const config = loadConfig();
  const featuredCount = flags.count ? parseInt(flags.count, 10) : config.featuredCount;
  
  if (isNaN(featuredCount) || featuredCount < 1) {
    // eslint-disable-next-line no-console
    console.error('❌ Featured count must be a positive number');
    process.exit(1);
  }
  
  // eslint-disable-next-line no-console
  console.log(`🎲 Rotating featured posts (target: ${featuredCount})...`);
  
  const blogFiles = findBlogFiles();
  if (blogFiles.length === 0) {
    // eslint-disable-next-line no-console
    console.log('ℹ️  No blog files found to process');
    process.exit(0);
  }
  
  // eslint-disable-next-line no-console
  console.log(`📊 Found ${blogFiles.length} blog posts`);
  
  const posts = blogFiles.map(getPostMetadata);
  const currentFeatured = posts.filter(post => post.featured);
  
  // eslint-disable-next-line no-console
  console.log(`📌 Currently featured: ${currentFeatured.length} posts`);
  
  const newFeaturedPaths = selectNewFeaturedPosts(posts, featuredCount);
  
  if (flags.dryRun) {
    // eslint-disable-next-line no-console
    console.log(`\n📋 Would feature these ${newFeaturedPaths.length} posts:`);
    newFeaturedPaths.forEach(path => {
      const post = posts.find(p => p.path === path);
      // eslint-disable-next-line no-console
      console.log(`   ✨ ${post.title} (${path})`);
    });
    
    const toUnfeature = currentFeatured.filter(post => 
      !newFeaturedPaths.includes(post.path)
    );
    
    if (toUnfeature.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`\n📋 Would unfeature these ${toUnfeature.length} posts:`);
      toUnfeature.forEach(post => {
        // eslint-disable-next-line no-console
        console.log(`   📌 ${post.title} (${post.path})`);
      });
    }
    
    process.exit(0);
  }
  
  let updated = 0;
  
  // Unfeature all current featured posts
  posts.forEach(post => {
    if (post.featured && !newFeaturedPaths.includes(post.path)) {
      const wasUpdated = updateFeaturedStatus(post.path, false);
      if (wasUpdated) {
        // eslint-disable-next-line no-console
        console.log(`📌 Unfeatured: ${post.title}`);
        updated++;
      }
    }
  });
  
  // Feature the new selection
  newFeaturedPaths.forEach(path => {
    const post = posts.find(p => p.path === path);
    if (!post.featured) {
      const wasUpdated = updateFeaturedStatus(path, true);
      if (wasUpdated) {
        // eslint-disable-next-line no-console
        console.log(`✨ Featured: ${post.title}`);
        updated++;
      }
    }
  });
  
  // eslint-disable-next-line no-console
  console.log(`\n📊 Summary:`);
  // eslint-disable-next-line no-console
  console.log(`   Posts processed: ${posts.length}`);
  // eslint-disable-next-line no-console
  console.log(`   Featured posts: ${newFeaturedPaths.length}`);
  // eslint-disable-next-line no-console
  console.log(`   Files updated: ${updated}`);
  
  if (updated > 0) {
    // eslint-disable-next-line no-console
    console.log(`\n💡 Tip: Run 'git add .' and commit the changes`);
  }
}

main();