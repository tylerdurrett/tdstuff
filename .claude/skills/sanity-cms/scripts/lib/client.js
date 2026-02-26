/**
 * Shared Sanity client utilities for sanity-cms scripts.
 * Handles client creation, env loading, CLI arg parsing, and JSON output.
 */
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Find the project root by walking up from the scripts directory.
 * The skill lives at .claude/skills/sanity-cms/scripts/lib/, so project root is 5 levels up.
 */
function getProjectRoot() {
  return path.resolve(__dirname, '..', '..', '..', '..', '..');
}

/**
 * Load environment variables from .env.local at the project root.
 * Parses KEY=VALUE lines, ignores comments (#) and blank lines.
 * Supports quoted values (single and double quotes are stripped).
 */
export function loadEnv() {
  const envPath = path.join(getProjectRoot(), '.env.local');
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
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch {
    // .env.local doesn't exist or isn't readable — that's fine
  }
  return env;
}

/**
 * Resolve an env variable, checking process.env first, then .env.local fallback.
 */
let _envCache = null;
function resolveEnv(key) {
  if (process.env[key]) return process.env[key];
  if (!_envCache) _envCache = loadEnv();
  return _envCache[key] || undefined;
}

/**
 * Get a configured Sanity client.
 * @param {object} options
 * @param {boolean} [options.requireToken=false] - If true, throws if no token is found.
 * @param {boolean} [options.useOrgToken=false] - If true, prefers SANITY_API_ORG_TOKEN.
 */
export function getClient(options = {}) {
  const { requireToken = false, useOrgToken = false } = options;

  let token;
  if (useOrgToken) {
    token = resolveEnv('SANITY_API_ORG_TOKEN') || resolveEnv('SANITY_API_TOKEN');
  } else {
    token = resolveEnv('SANITY_API_TOKEN');
  }

  if (requireToken && !token) {
    outputError(new Error(
      'SANITY_API_TOKEN is required but not set. ' +
      'Export it in your shell profile or add it to .env.local at the project root.'
    ));
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

/**
 * Parse CLI arguments into a key-value object.
 * Supports --key value and --key=value formats.
 */
export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=');
      if (eqIndex !== -1) {
        const key = arg.slice(2, eqIndex);
        args[key] = arg.slice(eqIndex + 1);
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
          args[key] = next;
          i++;
        } else {
          args[key] = 'true';
        }
      }
    }
  }
  return args;
}

/**
 * Output a JSON result to stdout.
 */
export function outputJSON(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

/**
 * Output an error to stderr as JSON.
 */
export function outputError(error) {
  console.error(JSON.stringify({
    success: false,
    error: error.message || String(error),
  }, null, 2));
}
