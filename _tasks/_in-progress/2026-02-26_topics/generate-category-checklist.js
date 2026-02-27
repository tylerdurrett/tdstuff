#!/usr/bin/env node
/**
 * Generate a checklist of readingList items that need category re-assignment.
 *
 * - Creates "Agentic Systems" and "Under the Hood" categories if they don't exist
 * - Queries all published readingList items NOT in any approved category
 * - Writes checklist JSON to category-recategorize-checklist.json
 *
 * Usage:
 *   node generate-category-checklist.js
 *   node generate-category-checklist.js --dry-run
 */
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Paths ──────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

// ── Env loading (inlined from .claude/skills/sanity-cms/scripts/lib/client.js) ─

function loadEnv() {
  const envPath = path.join(PROJECT_ROOT, '.env.local');
  const env = {};
  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch {
    // .env.local doesn't exist — that's fine
  }
  return env;
}

let _envCache = null;
function resolveEnv(key) {
  if (process.env[key]) return process.env[key];
  if (!_envCache) _envCache = loadEnv();
  return _envCache[key] || undefined;
}

function getClient() {
  const token = resolveEnv('SANITY_API_TOKEN');
  if (!token) {
    console.error('Error: SANITY_API_TOKEN is required but not set.');
    process.exit(1);
  }
  return createClient({
    projectId: resolveEnv('SANITY_PROJECT_ID') || 'g1sakegy',
    dataset: resolveEnv('SANITY_DATASET') || 'production',
    apiVersion: '2025-07-23',
    token,
    useCdn: false,
  });
}

// ── Configuration ──────────────────────────────────────────────────────────────

const EXISTING_APPROVED = {
  'damage-control': '6bd6eee1-d5eb-406a-a02e-65f5c44744ca',
  programming: 'b86db0c6-1975-4f93-a19b-e1d32dd8f8eb',
  'creative-code': '132e1fbc-def1-493d-8f6b-460b83efece9',
  'products-and-announcements': '903dee45-e05f-42f8-9b32-53c83641225b',
};

const NEW_CATEGORIES = [
  {
    title: 'Agentic Systems',
    slug: 'agentic-systems',
    description:
      'The frontier. AI agents, coding agents, orchestration, human-AI workflows.',
  },
  {
    title: 'Under the Hood',
    slug: 'under-the-hood',
    description:
      'The lab. Research, benchmarks, reasoning, how things actually work.',
  },
];

const isDryRun = process.argv.includes('--dry-run');

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const client = getClient();

  console.log('=== Category Re-categorization Checklist Generator ===\n');

  // Step 1: Ensure new categories exist
  console.log('[Step 1] Ensuring new categories exist...');

  const approvedIds = [...Object.values(EXISTING_APPROVED)];

  for (const cat of NEW_CATEGORIES) {
    const existing = await client.fetch(
      `*[_type == "category" && slug.current == $slug][0]{ _id }`,
      { slug: cat.slug }
    );

    if (existing) {
      console.log(`  "${cat.title}" already exists (ID: ${existing._id})`);
      approvedIds.push(existing._id);
    } else if (isDryRun) {
      console.log(`  "${cat.title}" would be created (dry run)`);
    } else {
      const result = await client.create({
        _type: 'category',
        title: cat.title,
        slug: { _type: 'slug', current: cat.slug },
        description: cat.description,
      });
      console.log(`  "${cat.title}" created (ID: ${result._id})`);
      approvedIds.push(result._id);
    }
  }

  // Step 2: Query items needing re-categorization
  console.log(
    '\n[Step 2] Querying published readingList items not in approved categories...'
  );

  const query = `*[
    _type == "readingList"
    && !(_id in path("drafts.**"))
    && (
      !defined(categories)
      || count(categories) == 0
      || count(categories[_ref in $approvedIds]) == 0
    )
  ]|order(savedAt desc){
    _id,
    title,
    "currentCategories": categories[]->{ title, "slug": slug.current }
  }`;

  const items = await client.fetch(query, { approvedIds });
  console.log(`  Found ${items.length} items needing re-categorization.`);

  // Step 3: Build and write checklist
  console.log('\n[Step 3] Writing checklist...');

  const checklist = items.map((item) => ({
    title: item.title,
    _id: item._id,
    currentCategories: (item.currentCategories || []).map((c) => c.title),
    status: 'unprocessed',
  }));

  const outputPath = path.join(
    __dirname,
    'category-recategorize-checklist.json'
  );

  if (isDryRun) {
    console.log(`  Would write ${checklist.length} items (dry run)`);
    console.log('  First 5 items:');
    for (const item of checklist.slice(0, 5)) {
      console.log(
        `    - "${item.title}" [${item.currentCategories.join(', ') || 'no categories'}]`
      );
    }
  } else {
    fs.writeFileSync(outputPath, JSON.stringify(checklist, null, 2) + '\n');
    console.log(
      `  Wrote ${checklist.length} items to category-recategorize-checklist.json`
    );
  }

  // Summary
  console.log('\nBreakdown by current category:');
  const breakdown = {};
  for (const item of checklist) {
    if (!item.currentCategories || item.currentCategories.length === 0) {
      breakdown['(no categories)'] = (breakdown['(no categories)'] || 0) + 1;
    } else {
      for (const cat of item.currentCategories) {
        breakdown[cat] = (breakdown[cat] || 0) + 1;
      }
    }
  }
  const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  for (const [label, count] of sorted) {
    console.log(`  ${label}: ${count}`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Fatal error:', err.message || err);
  process.exit(1);
});
