#!/usr/bin/env node
/**
 * Upload an image or file asset to Sanity.
 *
 * Usage:
 *   node upload.js --file /path/to/image.jpg --type image
 *   node upload.js --file /path/to/doc.pdf --type file
 *   node upload.js --file /path/to/image.jpg --type image --filename "hero.jpg" --label "Blog hero"
 *
 * Output includes a `ref` object ready to embed in document mutations.
 */
import { getClient, parseArgs, outputJSON, outputError } from './lib/client.js';
import fs from 'fs';
import path from 'path';

const args = parseArgs(process.argv.slice(2));

if (!args.file) {
  outputError(new Error('--file is required. Example: --file /path/to/image.jpg'));
  process.exit(1);
}

if (!args.type || !['image', 'file'].includes(args.type)) {
  outputError(new Error('--type is required. Must be "image" or "file"'));
  process.exit(1);
}

const filePath = path.resolve(args.file);
if (!fs.existsSync(filePath)) {
  outputError(new Error(`File not found: ${filePath}`));
  process.exit(1);
}

try {
  // Use org token for uploads if available, fall back to project token
  const client = getClient({ requireToken: true, useOrgToken: true });
  const fileBuffer = fs.readFileSync(filePath);
  const filename = args.filename || path.basename(filePath);

  const options = { filename };
  if (args.label) options.label = args.label;

  const asset = await client.assets.upload(args.type, fileBuffer, options);

  outputJSON({
    success: true,
    assetType: args.type,
    assetId: asset._id,
    ref: {
      _type: 'reference',
      _ref: asset._id,
    },
    url: asset.url,
    metadata: {
      filename: asset.originalFilename,
      mimeType: asset.mimeType,
      size: asset.size,
    },
  });
} catch (error) {
  outputError(error);
  process.exit(1);
}
