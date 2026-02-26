/**
 * Selector parsing, validation, and element interaction utilities.
 * Supports both CSS and XPath selectors with security checks.
 */

const INJECTION_PATTERNS = [
  /javascript:/i,
  /<script/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /onclick\s*=/i,
  /eval\s*\(/i,
  /Function\s*\(/i,
  /constructor\s*\(/i,
];

/**
 * Parse a selector string and determine if it's CSS or XPath.
 * @param {string} selector
 * @returns {{ type: 'css' | 'xpath', selector: string }}
 */
export function parseSelector(selector) {
  if (!selector || typeof selector !== 'string') {
    throw new Error('Selector must be a non-empty string');
  }

  if (selector.length > 1000) {
    throw new Error('Selector exceeds maximum length of 1000 characters');
  }

  // Security validation
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(selector)) {
      throw new Error(`Potentially unsafe selector blocked: ${selector}`);
    }
  }

  // XPath selectors start with / or (
  const isXPath = selector.startsWith('/') || selector.startsWith('(//');
  return {
    type: isXPath ? 'xpath' : 'css',
    selector,
  };
}

/**
 * Wait for an element to appear on the page.
 */
export async function waitForElement(page, parsed, options = {}) {
  const { visible = true, timeout = 5000 } = options;

  if (parsed.type === 'xpath') {
    await page.waitForSelector(`::-p-xpath(${parsed.selector})`, { visible, timeout });
  } else {
    await page.waitForSelector(parsed.selector, { visible, timeout });
  }
}

/**
 * Click an element on the page.
 */
export async function clickElement(page, parsed) {
  if (parsed.type === 'xpath') {
    const [element] = await page.$$(`xpath/${parsed.selector}`);
    if (!element) throw new Error(`Element not found: ${parsed.selector}`);
    await element.click();
  } else {
    await page.click(parsed.selector);
  }
}

/**
 * Type text into an element.
 */
export async function typeIntoElement(page, parsed, value, options = {}) {
  const { clear = false, delay = 0 } = options;

  let element;
  if (parsed.type === 'xpath') {
    const elements = await page.$$(`xpath/${parsed.selector}`);
    element = elements[0];
  } else {
    element = await page.$(parsed.selector);
  }

  if (!element) throw new Error(`Element not found: ${parsed.selector}`);

  if (clear) {
    await element.click({ clickCount: 3 });
    await element.press('Backspace');
  }

  await element.type(value, { delay });
}

/**
 * Get an element handle without waiting.
 * @returns {Promise<ElementHandle|null>}
 */
export async function getElement(page, parsed) {
  if (parsed.type === 'xpath') {
    const elements = await page.$$(`xpath/${parsed.selector}`);
    return elements[0] || null;
  }
  return page.$(parsed.selector);
}

/**
 * Enhance an error with troubleshooting tips for selector issues.
 */
export function enhanceError(error, selector) {
  const tips = [
    `Selector used: "${selector}"`,
    'Tips:',
    '  - Use snapshot.js to discover available selectors',
    '  - Try XPath if CSS selector fails: //button[contains(text(),"Submit")]',
    '  - Verify the element is visible and not hidden',
    '  - Increase timeout with --timeout 30000',
  ];
  error.message = `${error.message}\n\n${tips.join('\n')}`;
  return error;
}
