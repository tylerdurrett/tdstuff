#!/usr/bin/env node
/**
 * Run a GROQ query against Sanity.
 *
 * Usage:
 *   node query.js --query '*[_type == "category"]{_id, title}'
 *   node query.js --query '*[_type == "post" && slug.current == $slug][0]' --params '{"slug": "my-post"}'
 */
import { getClient, parseArgs, outputJSON, outputError } from './lib/client.js';

const args = parseArgs(process.argv.slice(2));

if (!args.query) {
  outputError(new Error('--query is required. Example: --query \'*[_type == "category"]{_id, title}\''));
  process.exit(1);
}

try {
  const client = getClient();
  const params = args.params ? JSON.parse(args.params) : {};
  const result = await client.fetch(args.query, params);

  outputJSON({
    success: true,
    query: args.query,
    resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
    result,
  });
} catch (error) {
  outputError(error);
  process.exit(1);
}
