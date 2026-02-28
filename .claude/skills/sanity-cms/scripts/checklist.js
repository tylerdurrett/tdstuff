#!/usr/bin/env node
/**
 * Generate a processable checklist of readingList items matching filter criteria.
 * Outputs a JSON file where each item has title, _id, currentCategories, currentTopics, and status.
 *
 * Usage:
 *   node checklist.js --output /path/to/checklist.json
 *   node checklist.js --exclude-categories "damage-control,programming" --output checklist.json
 *   node checklist.js --categories "research-and-understanding" --output checklist.json
 *   node checklist.js --topic "ai-coding-agents" --output checklist.json
 *   node checklist.js --uncategorized --output checklist.json
 *   node checklist.js --no-topics --output checklist.json
 *   node checklist.js --no-metrics --output checklist.json
 *   node checklist.js --no-article-sentiment --output checklist.json
 *   node checklist.js --exclude-categories "..." --output checklist.json --dry-run
 */
import fs from 'fs';
import path from 'path';
import { getClient, parseArgs, outputJSON, outputError } from './lib/client.js';

const args = parseArgs(process.argv.slice(2));

// ── Validation ─────────────────────────────────────────────────────────────────

if (!args.output) {
  outputError(
    new Error(
      '--output is required. Specify a file path for the checklist JSON.\n\n' +
        'Usage:\n' +
        '  node checklist.js --output checklist.json\n' +
        '  node checklist.js --exclude-categories "slug1,slug2" --output checklist.json\n' +
        '  node checklist.js --categories "slug1,slug2" --output checklist.json\n' +
        '  node checklist.js --topic "topic-slug" --output checklist.json\n' +
        '  node checklist.js --uncategorized --output checklist.json'
    )
  );
  process.exit(1);
}

if (args.categories && args['exclude-categories']) {
  outputError(
    new Error(
      '--categories and --exclude-categories are mutually exclusive. Use one or the other.'
    )
  );
  process.exit(1);
}

if (args.uncategorized && (args.categories || args['exclude-categories'])) {
  outputError(
    new Error(
      '--uncategorized cannot be combined with --categories or --exclude-categories.'
    )
  );
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Resolve an array of category slugs to their Sanity document IDs.
 */
async function resolveCategoryIds(client, slugs) {
  const result = await client.fetch(
    `*[_type == "category" && slug.current in $slugs]{ _id, "slug": slug.current }`,
    { slugs }
  );

  const found = new Map(result.map((c) => [c.slug, c._id]));
  const missing = slugs.filter((s) => !found.has(s));

  if (missing.length > 0) {
    outputError(
      new Error(`Categories not found: ${missing.join(', ')}`)
    );
    process.exit(1);
  }

  return result.map((c) => c._id);
}

/**
 * Resolve a topic slug to its Sanity document ID.
 */
async function resolveTopicId(client, slug) {
  const result = await client.fetch(
    `*[_type == "topic" && slug.current == $slug][0]{ _id }`,
    { slug }
  );

  if (!result) {
    outputError(new Error(`Topic not found: ${slug}`));
    process.exit(1);
  }

  return result._id;
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const client = getClient();
  const isDryRun = args['dry-run'] === 'true';

  // Build GROQ filter conditions
  const filters = [
    '_type == "readingList"',
    '!(_id in path("drafts.**"))',
  ];
  const params = {};

  if (args.uncategorized === 'true') {
    filters.push('(!defined(categories) || count(categories) == 0)');
  } else if (args.categories) {
    const slugs = args.categories.split(',').map((s) => s.trim());
    const ids = await resolveCategoryIds(client, slugs);
    params.categoryIds = ids;
    filters.push('count(categories[_ref in $categoryIds]) > 0');
  } else if (args['exclude-categories']) {
    const slugs = args['exclude-categories'].split(',').map((s) => s.trim());
    const ids = await resolveCategoryIds(client, slugs);
    params.excludeIds = ids;
    filters.push(
      '(!defined(categories) || count(categories) == 0 || count(categories[_ref in $excludeIds]) == 0)'
    );
  }

  if (args['no-metrics'] === 'true') {
    filters.push(
      '(!defined(sentimentArticle) || !defined(hnScore) || !defined(hnCommentCount) || !defined(sentimentCommunity) || !defined(controversyScore))'
    );
  }

  if (args['no-article-sentiment'] === 'true') {
    filters.push('!defined(sentimentArticle)');
  }

  if (args['no-topics'] === 'true') {
    filters.push('(!defined(topics) || count(topics) == 0)');
  } else if (args.topic) {
    const topicId = await resolveTopicId(client, args.topic);
    params.topicId = topicId;
    filters.push('defined(topics) && count(topics[_ref == $topicId]) > 0');
  }

  const query = `*[${filters.join(' && ')}]|order(savedAt desc){
    _id,
    title,
    "currentCategories": categories[]->{ title, "slug": slug.current },
    "currentTopics": topics[]->{ title, "slug": slug.current }
  }`;

  const items = await client.fetch(query, params);

  // Build checklist
  const checklist = items.map((item) => ({
    title: item.title,
    _id: item._id,
    currentCategories: (item.currentCategories || []).map((c) => c.title),
    currentTopics: (item.currentTopics || []).map((t) => t.title),
    status: 'unprocessed',
  }));

  // Build breakdown summary
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

  if (isDryRun) {
    outputJSON({
      success: true,
      dryRun: true,
      resultCount: checklist.length,
      breakdown,
      preview: checklist.slice(0, 5),
    });
  } else {
    const outputPath = path.resolve(args.output);
    fs.writeFileSync(outputPath, JSON.stringify(checklist, null, 2) + '\n');
    outputJSON({
      success: true,
      resultCount: checklist.length,
      outputFile: outputPath,
      breakdown,
    });
  }
}

main().catch((err) => {
  outputError(err);
  process.exit(1);
});
