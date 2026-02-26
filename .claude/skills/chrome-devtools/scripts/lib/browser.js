/**
 * Shared browser utilities for chrome-devtools scripts.
 * Handles browser launch/connect, page management, CLI arg parsing, and JSON output.
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENDPOINT_FILE = path.join(__dirname, '..', '.browser-endpoint');

let _browser = null;
let _isPersistent = false;

/**
 * Parse CLI arguments into a key-value object.
 * Supports --key value and --key=value formats.
 * Keys are kept as-is (kebab-case).
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
 * Get or launch a browser instance.
 * Connects to persistent browser if .browser-endpoint exists, otherwise launches new.
 */
export async function getBrowser(options = {}) {
  if (_browser) return _browser;

  // Check for persistent browser
  if (fs.existsSync(ENDPOINT_FILE)) {
    try {
      const wsEndpoint = fs.readFileSync(ENDPOINT_FILE, 'utf-8').trim();
      _browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
      _isPersistent = true;
      return _browser;
    } catch {
      // Stale endpoint file — clean up and launch fresh
      try { fs.unlinkSync(ENDPOINT_FILE); } catch {}
    }
  }

  const headless = options.headless !== false;
  _browser = await puppeteer.launch({
    headless: headless ? 'new' : false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  _isPersistent = false;
  return _browser;
}

/**
 * Get a page from the browser. Reuses existing pages or creates a new one.
 */
export async function getPage(browser) {
  const pages = await browser.pages();
  if (pages.length > 0) {
    return pages[0];
  }
  return browser.newPage();
}

/**
 * Close the browser (only if not persistent).
 */
export async function closeBrowser() {
  if (_browser && !_isPersistent) {
    await _browser.close();
    _browser = null;
  }
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
