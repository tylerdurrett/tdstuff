#!/usr/bin/env node
/**
 * Create, patch, or delete Sanity documents.
 *
 * Usage:
 *   # Create
 *   node mutate.js --action create --data '{"_type": "category", "title": "New", "slug": {"_type": "slug", "current": "new"}}'
 *
 *   # Create from file (for large payloads)
 *   node mutate.js --action create --file /tmp/doc.json
 *
 *   # Create or replace (upsert with full document)
 *   node mutate.js --action createOrReplace --data '{"_id": "abc", "_type": "category", ...}'
 *
 *   # Patch (set fields)
 *   node mutate.js --action patch --id "abc123" --set '{"title": "Updated"}'
 *
 *   # Patch (unset fields)
 *   node mutate.js --action patch --id "abc123" --unset '["subtitle", "intro"]'
 *
 *   # Patch (insert into array)
 *   node mutate.js --action patch --id "abc123" --insert '{"after": "categories[-1]", "items": [{"_type": "reference", "_ref": "cat-id", "_key": "unique-key"}]}'
 *
 *   # Delete
 *   node mutate.js --action delete --id "abc123"
 *
 *   # Dry run (validate only, no mutation)
 *   node mutate.js --action create --data '...' --dry-run
 */
import { getClient, parseArgs, outputJSON, outputError } from './lib/client.js';
import fs from 'fs';
import crypto from 'crypto';

const args = parseArgs(process.argv.slice(2));

const VALID_ACTIONS = ['create', 'createOrReplace', 'patch', 'delete'];

if (!args.action || !VALID_ACTIONS.includes(args.action)) {
  outputError(new Error(`--action is required. Must be one of: ${VALID_ACTIONS.join(', ')}`));
  process.exit(1);
}

/**
 * Recursively add _key to array items that are objects without one.
 */
function addMissingKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        if (!item._key) {
          item._key = crypto.randomUUID().slice(0, 12);
        }
        return addMissingKeys(item);
      }
      return item;
    });
  }
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        obj[key] = addMissingKeys(value);
      } else if (value && typeof value === 'object') {
        obj[key] = addMissingKeys(value);
      }
    }
  }
  return obj;
}

/**
 * Load document data from --data (inline JSON) or --file (path to JSON file).
 */
function loadData() {
  if (args.file) {
    const content = fs.readFileSync(args.file, 'utf-8');
    return JSON.parse(content);
  }
  if (args.data) {
    return JSON.parse(args.data);
  }
  return null;
}

try {
  const client = getClient({ requireToken: true });
  const isDryRun = args['dry-run'] === 'true';

  if (args.action === 'create' || args.action === 'createOrReplace') {
    const data = loadData();
    if (!data) {
      outputError(new Error('--data or --file is required for create/createOrReplace'));
      process.exit(1);
    }
    if (!data._type) {
      outputError(new Error('Document must have a _type field'));
      process.exit(1);
    }

    addMissingKeys(data);

    if (isDryRun) {
      outputJSON({ success: true, action: args.action, dryRun: true, document: data });
      process.exit(0);
    }

    const result = args.action === 'create'
      ? await client.create(data)
      : await client.createOrReplace(data);

    outputJSON({
      success: true,
      action: args.action,
      documentId: result._id,
      result,
    });

  } else if (args.action === 'patch') {
    if (!args.id) {
      outputError(new Error('--id is required for patch'));
      process.exit(1);
    }

    let patch = client.patch(args.id);

    if (args.set) {
      const setData = JSON.parse(args.set);
      addMissingKeys(setData);
      patch = patch.set(setData);
    }

    if (args.unset) {
      const unsetFields = JSON.parse(args.unset);
      patch = patch.unset(unsetFields);
    }

    if (args.insert) {
      const insertData = JSON.parse(args.insert);
      const { after, before, replace, items } = insertData;
      if (items) addMissingKeys(items);

      if (after) {
        patch = patch.insert('after', after, items);
      } else if (before) {
        patch = patch.insert('before', before, items);
      } else if (replace) {
        patch = patch.insert('replace', replace, items);
      }
    }

    // Also support --data for patch as a full set operation
    if (args.data && !args.set) {
      const data = JSON.parse(args.data);
      addMissingKeys(data);
      patch = patch.set(data);
    }

    if (isDryRun) {
      outputJSON({
        success: true,
        action: 'patch',
        dryRun: true,
        documentId: args.id,
        operations: {
          set: args.set ? JSON.parse(args.set) : undefined,
          unset: args.unset ? JSON.parse(args.unset) : undefined,
          insert: args.insert ? JSON.parse(args.insert) : undefined,
        },
      });
      process.exit(0);
    }

    const result = await patch.commit();

    outputJSON({
      success: true,
      action: 'patch',
      documentId: result._id,
      result,
    });

  } else if (args.action === 'delete') {
    if (!args.id) {
      outputError(new Error('--id is required for delete'));
      process.exit(1);
    }

    if (isDryRun) {
      outputJSON({ success: true, action: 'delete', dryRun: true, documentId: args.id });
      process.exit(0);
    }

    const result = await client.delete(args.id);

    outputJSON({
      success: true,
      action: 'delete',
      documentId: args.id,
      result,
    });
  }
} catch (error) {
  outputError(error);
  process.exit(1);
}
