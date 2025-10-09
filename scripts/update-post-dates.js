#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import yaml from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');

// Configuration
const DEFAULT_CONFIG = {
  contentGlob: 'src/data/blog/**/*.{md,mdx}',
  defaultAuthor: 'Blog Author'
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

function isGitAvailable() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isInGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore', cwd: ROOT_DIR });
    return true;
  } catch {
    return false;
  }
}

function getChangedFiles() {
  if (!isGitAvailable() || !isInGitRepo()) {
    return [];
  }

  try {
    // First try to get staged files (pre-commit context)
    const staged = execSync('git diff --cached --name-only --diff-filter=AMR', { 
      encoding: 'utf-8', 
      cwd: ROOT_DIR 
    }).trim();
    
    if (staged) {
      return staged.split('\n').filter(Boolean);
    }

    // Fallback to modified files
    const modified = execSync('git status --porcelain', { 
      encoding: 'utf-8', 
      cwd: ROOT_DIR 
    }).trim();
    
    return modified
      .split('\n')
      .filter(Boolean)
      .map(line => line.substring(3)) // Remove status prefix
      .filter(file => ['A', 'M', 'R'].includes(file.charAt(0)) || !file.startsWith('D'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️  Warning: Git command failed: ${err.message}`);
    return [];
  }
}

function globToRegex(glob) {
  return glob
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '§DOUBLESTAR§') // Temporary placeholder
    .replace(/\*/g, '[^/]*')
    .replace(/§DOUBLESTAR§/g, '.*?')  // Non-greedy match for any characters
    .replace(/\{([^}]+)\}/g, (match, group) => `(${group.replace(/,/g, '|')})`);
}

function matchesGlob(filePath, glob) {
  // Simple implementation: check if file is in the right directory and has right extension
  if (glob === 'src/data/blog/**/*.{md,mdx}') {
    const isInBlogDir = filePath.startsWith('src/data/blog/');
    const hasCorrectExt = filePath.endsWith('.md') || filePath.endsWith('.mdx');
    return isInBlogDir && hasCorrectExt;
  }
  
  // Fallback to regex for other patterns
  const regexPattern = globToRegex(glob);
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

function findBlogFiles(specificFiles = []) {
  const config = loadConfig();
  
  if (specificFiles.length > 0) {
    return specificFiles.filter(file => 
      existsSync(join(ROOT_DIR, file)) && 
      matchesGlob(file, config.contentGlob)
    );
  }

  // Get all blog files
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
        if (matchesGlob(relativePath, config.contentGlob)) {
          allFiles.push(relativePath);
        }
      });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️  Warning: Could not find blog files: ${err.message}`);
  }

  return allFiles;
}

function hasContentChanged(filePath) {
  if (!isGitAvailable() || !isInGitRepo()) {
    return true; // If no git, assume content changed
  }

  try {
    // Get the diff for this specific file
    const diff = execSync(`git diff HEAD -- "${filePath}"`, { 
      encoding: 'utf-8', 
      cwd: ROOT_DIR 
    }).trim();
    
    if (!diff) {
      // File hasn't changed since last commit
      return false;
    }
    
    // Strategy: Read the actual file and check if changes are only in frontmatter
    // This is more reliable than trying to parse git diff output
    
    try {
      const fullPath = join(ROOT_DIR, filePath);
      const fileContent = readFileSync(fullPath, 'utf-8');
      const { content: bodyContent } = matter(fileContent);
      
      // Get the body content from the previous commit
      const prevFileContent = execSync(`git show HEAD:"${filePath}"`, { 
        encoding: 'utf-8', 
        cwd: ROOT_DIR 
      });
      const { content: prevBodyContent } = matter(prevFileContent);
      
      // If the body content is different, then it's a content change
      return bodyContent.trim() !== prevBodyContent.trim();
    } catch {
      // If we can't get the previous version, fall back to diff analysis
      const lines = diff.split('\n');
      
      // Look for changes that are clearly in the body (after line numbers that would be frontmatter)
      for (const line of lines) {
        // Skip diff headers
        if (line.startsWith('@@') || line.startsWith('+++') || line.startsWith('---') || 
            line.startsWith('index ') || line.startsWith('diff --git') || 
            line.startsWith('\\ No newline at end of file')) {
          continue;
        }
        
        // If we see changes and the change includes body content indicators
        if ((line.startsWith('+') || line.startsWith('-')) && 
            (line.includes('##') || line.includes('#') || line.length > 100)) {
          return true;
        }
      }
      
      return false;
    }
  } catch {
    // If git command fails, assume content changed
    return true;
  }
}

function updateFrontmatter(filePath, isPreCommit = false, forceUpdate = false) {
  const fullPath = join(ROOT_DIR, filePath);
  const content = readFileSync(fullPath, 'utf-8');
  const { data: frontmatter, content: body } = matter(content);
  
  const now = new Date().toISOString();
  let updated = false;

  if (isPreCommit) {
    if (!frontmatter.pubDatetime) {
      frontmatter.pubDatetime = now;
      updated = true;
    } else {
      // Only update modDatetime if the actual content (not just frontmatter) changed
      const contentChanged = hasContentChanged(filePath);
      if (contentChanged) {
        frontmatter.modDatetime = now;
        updated = true;
      }
    }
  } else if (forceUpdate) {
    if (!frontmatter.pubDatetime) {
      frontmatter.pubDatetime = now;
      updated = true;
    }
    frontmatter.modDatetime = now;
    updated = true;
  }

  if (!updated) {
    return false;
  }

  // Preserve frontmatter order as much as possible
  const orderedFrontmatter = {};
  
  // Common fields in preferred order
  const preferredOrder = [
    'title', 'author', 'pubDatetime', 'modDatetime', 'slug', 
    'featured', 'draft', 'tags', 'description', 'excerpt'
  ];
  
  // Add fields in preferred order if they exist
  preferredOrder.forEach(key => {
    if (frontmatter.hasOwnProperty(key)) {
      orderedFrontmatter[key] = frontmatter[key];
    }
  });
  
  // Add any remaining fields
  Object.keys(frontmatter).forEach(key => {
    if (!orderedFrontmatter.hasOwnProperty(key)) {
      orderedFrontmatter[key] = frontmatter[key];
    }
  });

  // Create new content with updated frontmatter
  const yamlString = yaml.stringify(orderedFrontmatter, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false
  }).trim();
  
  const newContent = `---\n${yamlString}\n---\n${body}`;

  // Write to temp file first, then replace (atomic write)
  const tempPath = `${fullPath}.tmp`;
  writeFileSync(tempPath, newContent, 'utf-8');
  writeFileSync(fullPath, newContent, 'utf-8');
  
  try {
    unlinkSync(tempPath);
  } catch {}

  return true;
}

function stageFile(filePath) {
  if (!isGitAvailable() || !isInGitRepo()) {
    return;
  }

  try {
    execSync(`git add "${filePath}"`, { cwd: ROOT_DIR, stdio: 'ignore' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️  Warning: Could not stage ${filePath}: ${err.message}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const flags = {
    preCommit: args.includes('--pre-commit'),
    force: args.includes('--force'),
    dryRun: args.includes('--dry-run')
  };
  
  const fileArgs = args.filter(arg => !arg.startsWith('--'));

  if (!isGitAvailable()) {
    // eslint-disable-next-line no-console
    console.log('ℹ️  Git not available, skipping date management');
    process.exit(0);
  }

  if (!isInGitRepo()) {
    // eslint-disable-next-line no-console
    console.log('ℹ️  Not in a git repository, skipping date management');
    process.exit(0);
  }

  let targetFiles = [];

  if (flags.preCommit) {
    const changedFiles = getChangedFiles();
    targetFiles = findBlogFiles().filter(file => changedFiles.includes(file));
  } else if (fileArgs.length > 0) {
    targetFiles = findBlogFiles(fileArgs);
  } else if (flags.force) {
    targetFiles = findBlogFiles();
  } else {
    const changedFiles = getChangedFiles();
    if (changedFiles.length === 0) {
      // eslint-disable-next-line no-console
      console.log('✅ No blog files to update (repository is clean)');
      process.exit(0);
    }
    targetFiles = findBlogFiles().filter(file => changedFiles.includes(file));
  }

  if (targetFiles.length === 0) {
    // eslint-disable-next-line no-console
    console.log('ℹ️  No blog files found to process');
    process.exit(0);
  }

  let updated = 0;
  let staged = 0;

  // eslint-disable-next-line no-console
  console.log(`🕒 Processing ${targetFiles.length} blog file(s)...`);

  targetFiles.forEach(file => {
    try {
      if (flags.dryRun) {
        // eslint-disable-next-line no-console
        console.log(`📋 Would update: ${file}`);
        updated++;
      } else {
        const wasUpdated = updateFrontmatter(file, flags.preCommit, flags.force);
        if (wasUpdated) {
          // eslint-disable-next-line no-console
          console.log(`✅ Updated: ${file}`);
          updated++;
          
          if (flags.preCommit) {
            stageFile(file);
            staged++;
          }
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`❌ Failed to process ${file}: ${err.message}`);
    }
  });

  // eslint-disable-next-line no-console
  console.log(`\n📊 Summary:`);
  // eslint-disable-next-line no-console
  console.log(`   Files scanned: ${targetFiles.length}`);
  // eslint-disable-next-line no-console
  console.log(`   Updated: ${updated}`);
  if (flags.preCommit && staged > 0) {
    // eslint-disable-next-line no-console
    console.log(`   Staged: ${staged}`);
  }
  if (targetFiles.length - updated > 0) {
    // eslint-disable-next-line no-console
    console.log(`   Skipped: ${targetFiles.length - updated}`);
  }
}

main();