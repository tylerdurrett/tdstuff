'use client'

import { useEffect, useRef } from 'react'
import type p5 from 'p5'
import type { ReadingListArtData, SketchFunction } from '../core/types'

/**
 * Manages a p5.js instance in instance mode within a container element.
 * Creates the instance on mount and cleans up on unmount or dependency change.
 */
export function useP5Sketch(
  containerRef: React.RefObject<HTMLDivElement | null>,
  sketchFn: SketchFunction,
  data: ReadingListArtData
) {
  const instanceRef = useRef<p5 | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Dynamic import to avoid SSR issues — p5 requires window/document
    let cancelled = false

    import('p5').then((mod) => {
      if (cancelled || !container) return

      const P5 = mod.default
      instanceRef.current = new P5((p: p5) => {
        sketchFn(p, data)
      }, container)
    })

    return () => {
      cancelled = true
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
    // We intentionally use JSON serialization for data comparison.
    // Sketch functions are stable per-slug, and data changes should recreate the instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sketchFn, JSON.stringify(data)])
}
