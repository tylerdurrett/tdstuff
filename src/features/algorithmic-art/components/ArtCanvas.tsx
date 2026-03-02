'use client'

import { useRef } from 'react'
import { useP5Sketch } from '../hooks/use-p5-sketch'
import type { ReadingListArtData, SketchFunction } from '../core/types'

type ArtCanvasProps = {
  sketchFn: SketchFunction
  data: ReadingListArtData
  className?: string
}

/**
 * Renders a p5.js sketch inside a container div.
 * The sketch function receives the p5 instance and reading list data.
 */
export function ArtCanvas({ sketchFn, data, className }: ArtCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useP5Sketch(containerRef, sketchFn, data)

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ lineHeight: 0 }}
    />
  )
}
