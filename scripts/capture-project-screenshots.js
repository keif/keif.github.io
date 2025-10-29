#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Capture screenshots of project websites
 *
 * Usage:
 *   pnpm run screenshot-projects              # Screenshot all projects
 *   pnpm run screenshot-projects pointpal     # Screenshot specific project by slug
 */

import { chromium } from 'playwright';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const PROJECTS_DIR = 'src/data/projects';
const OUTPUT_DIR = 'public/images/projects';

// Screenshot configuration
const VIEWPORT = { width: 1280, height: 800 };
const WAIT_TIMEOUT = 10000; // 10 seconds

async function getProjectFiles(specificSlug) {
  const pattern = specificSlug
    ? `${PROJECTS_DIR}/${specificSlug}.{md,mdx}`
    : `${PROJECTS_DIR}/*.{md,mdx}`;

  return await glob(pattern);
}

async function extractProjectData(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data } = matter(content);

  const filename = path.basename(filePath, path.extname(filePath));
  const slug = data.slug || filename;

  return {
    slug,
    url: data.url,
    title: data.title,
    draft: data.draft || false,
  };
}

async function captureScreenshot(browser, project) {
  const { slug, url, title } = project;

  console.log(`\n📸 Capturing screenshot for: ${title}`);
  console.log(`   URL: ${url}`);

  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });

  const page = await context.newPage();

  try {
    // Navigate to the page
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: WAIT_TIMEOUT,
    });

    // Wait a bit for animations/fonts to load
    await page.waitForTimeout(2000);

    // Take screenshot
    const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);
    await page.screenshot({
      path: outputPath,
      fullPage: false, // Just capture viewport
    });

    console.log(`   ✅ Saved to: ${outputPath}`);

    return { success: true, slug, outputPath };
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return { success: false, slug, error: error.message };
  } finally {
    await context.close();
  }
}

async function main() {
  const specificSlug = process.argv[2];

  console.log('🚀 Project Screenshot Capture Tool\n');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Get project files
  const projectFiles = await getProjectFiles(specificSlug);

  if (projectFiles.length === 0) {
    console.error(`❌ No project files found${specificSlug ? ` for slug: ${specificSlug}` : ''}`);
    process.exit(1);
  }

  console.log(`Found ${projectFiles.length} project(s) to process\n`);

  // Extract project data
  const projects = [];
  for (const file of projectFiles) {
    const project = await extractProjectData(file);
    if (!project.draft) {
      projects.push(project);
    } else {
      console.log(`⏭️  Skipping draft: ${project.title}`);
    }
  }

  if (projects.length === 0) {
    console.log('\n✨ No non-draft projects to screenshot');
    return;
  }

  // Launch browser
  console.log('🌐 Launching browser...\n');
  const browser = await chromium.launch({
    headless: true,
  });

  // Capture screenshots
  const results = [];
  for (const project of projects) {
    const result = await captureScreenshot(browser, project);
    results.push(result);
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach(f => console.log(`   - ${f.slug}: ${f.error}`));
  }

  console.log('\n✨ Done!\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
