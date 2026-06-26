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
    screenshotUrl: data.screenshotUrl,
    title: data.title,
    draft: data.draft || false,
  };
}

// Quick reachability probe so we don't try to screenshot a URL whose service
// isn't running (typical for local-only projects). Any HTTP response counts as
// "running" — Playwright handles redirects/error pages itself. Only connection
// failures and timeouts cause us to skip.
async function isUrlReachable(url, timeoutMs = 3000) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'manual',
    });
    // Drain so the connection closes cleanly
    await res.body?.cancel().catch(() => {});
    return true;
  } catch {
    return false;
  }
}

async function captureScreenshot(browser, project) {
  const { slug, url, screenshotUrl, title } = project;
  const targetUrl = screenshotUrl || url;

  console.log(`\n📸 Capturing screenshot for: ${title}`);
  console.log(`   URL: ${targetUrl}${screenshotUrl ? ' (screenshotUrl override)' : ''}`);

  if (!(await isUrlReachable(targetUrl))) {
    console.log(`   ⏭️  Skipped: ${targetUrl} not reachable (service not running?)`);
    return { success: false, slug, error: 'URL not reachable', skipped: true };
  }

  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });

  const page = await context.newPage();

  try {
    // Navigate to the page. Use 'load' instead of 'networkidle' so we don't
    // hang on apps with long-lived connections (SSE, WebSockets, polling) that
    // keep the network "busy" forever. The explicit waitForTimeout below
    // handles fonts/animations.
    await page.goto(targetUrl, {
      waitUntil: 'load',
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
  const skipped = results.filter(r => r.skipped);
  const failed = results.filter(r => !r.success && !r.skipped);

  console.log(`✅ Successful: ${successful.length}`);
  if (skipped.length > 0) {
    console.log(`⏭️  Skipped: ${skipped.length}`);
    skipped.forEach(s => console.log(`   - ${s.slug}: ${s.error}`));
  }
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
