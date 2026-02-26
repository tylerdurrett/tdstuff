#!/usr/bin/env node
/**
 * Get a single Sanity document by ID.
 *
 * Usage:
 *   node get.js --id "abc123"
 *   node get.js --id "abc123" --fields "title, slug, category->{title}"
 */
import { getClient, parseArgs, outputJSON, outputError } from './lib/client.js';

const args = parseArgs(process.argv.slice(2));

if (!args.id) {
  outputError(new Error('--id is required. Example: --id "abc123"'));
  process.exit(1);
}

try {
  const client = getClient();
  const projection = args.fields ? `{${args.fields}}` : '';
  const query = `*[_id == $id][0]${projection}`;
  const result = await client.fetch(query, { id: args.id });

  if (!result) {
    outputJSON({
      success: false,
      documentId: args.id,
      error: `Document not found: ${args.id}`,
    });
    process.exit(1);
  }

  outputJSON({
    success: true,
    documentId: args.id,
    result,
  });
} catch (error) {
  outputError(error);
  process.exit(1);
}
