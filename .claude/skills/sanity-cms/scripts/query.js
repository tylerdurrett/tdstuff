#!/usr/bin/env node
/**
 * Run a GROQ query against Sanity.
 *
 * Usage:
 *   node query.js --query '*[_type == "category"]{_id, title}'
 *   node query.js --query '*[_type == "post" && slug.current == $slug][0]' --params '{"slug": "my-post"}'
 *   node query.js --file /tmp/query.groq
 *   node query.js --file /tmp/query.groq --params '{"slug": "my-post"}'
 *   node query.js --query '*[_type == "post"]{_id, title}' --no-drafts
 */
import { getClient, parseArgs, outputJSON, outputError } from './lib/client.js';
import fs from 'fs';

const args = parseArgs(process.argv.slice(2));

// Load query from --file or --query
let query = args.query;
if (args.file) {
  try {
    query = fs.readFileSync(args.file, 'utf-8').trim();
  } catch (err) {
    outputError(new Error(`Failed to read query file: ${err.message}`));
    process.exit(1);
  }
}

if (!query) {
  outputError(new Error('--query or --file is required. Example: --query \'*[_type == "category"]{_id, title}\''));
  process.exit(1);
}

try {
  const client = getClient();
  const params = args.params ? JSON.parse(args.params) : {};
  let result = await client.fetch(query, params);

  // --no-drafts: filter out documents whose _id starts with "drafts."
  if (args['no-drafts'] === 'true' && Array.isArray(result)) {
    result = result.filter(doc => doc && typeof doc._id === 'string' && !doc._id.startsWith('drafts.'));
  }

  outputJSON({
    success: true,
    query,
    resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
    result,
  });
} catch (error) {
  outputError(error);
  process.exit(1);
}
