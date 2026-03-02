import type { SketchFunction } from '../core/types'

/**
 * Registry mapping reading list slugs to their sketch functions.
 * Each sketch is lazily imported to avoid bundling all sketches on every page.
 */
const sketchRegistry: Record<string, () => Promise<{ sketch: SketchFunction }>> = {
  'beyond-shallow-competence-building-engineering-intuition-in-the-ai-era': () =>
    import('./beyond-shallow-competence'),
}

/**
 * Returns the sketch function for a given slug, or null if no art exists.
 */
export async function getSketchForSlug(slug: string): Promise<SketchFunction | null> {
  const loader = sketchRegistry[slug]
  if (!loader) return null
  const mod = await loader()
  return mod.sketch
}

/**
 * Check synchronously whether a slug has art available.
 */
export function hasSketchForSlug(slug: string): boolean {
  return slug in sketchRegistry
}
