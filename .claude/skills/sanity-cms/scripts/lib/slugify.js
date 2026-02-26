/**
 * Slugify utility for Sanity CMS.
 * Generates URL-safe kebab-case slugs following Sanity's conventions.
 *
 * Import:
 *   import { slugify, toSlugObject } from './lib/slugify.js';
 *
 * CLI:
 *   node .claude/skills/sanity-cms/scripts/lib/slugify.js "My Title"
 *   node .claude/skills/sanity-cms/scripts/lib/slugify.js "My Title" --json
 */
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Convert a string to a Sanity-compatible slug.
 *
 * Rules:
 * 1. Lowercase
 * 2. Spaces → hyphens
 * 3. Periods → hyphens (periods are reserved in Sanity IDs for draft status)
 * 4. Remove all characters except a-z, 0-9, -
 * 5. Collapse consecutive hyphens
 * 6. Trim leading/trailing hyphens
 * 7. Truncate to 200 characters
 */
export function slugify(input) {
  if (!input || typeof input !== 'string') return '';

  return input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\./g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

/**
 * Create a full Sanity slug object from a string.
 */
export function toSlugObject(input) {
  return {
    _type: 'slug',
    current: slugify(input),
  };
}

// --- CLI ---
const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMain) {
  const args = process.argv.slice(2);
  const hasJsonFlag = args.includes('--json');
  const input = args.filter(a => !a.startsWith('--')).join(' ');

  if (!input) {
    console.error('Usage: node slugify.js "Input String" [--json]');
    process.exit(1);
  }

  if (hasJsonFlag) {
    console.log(JSON.stringify(toSlugObject(input), null, 2));
  } else {
    console.log(slugify(input));
  }
}
