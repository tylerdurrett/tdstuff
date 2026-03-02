'use client'

import { useEffect, useState } from 'react'
import { ArtCanvas } from './ArtCanvas'
import { getSketchForSlug } from '../sketches'
import type { ReadingListArtData, SketchFunction } from '../core/types'

type ReadingListArtProps = {
  data: ReadingListArtData
  className?: string
}

/**
 * Loads and renders the algorithmic art sketch for a given reading list item.
 * Returns null if no sketch exists for the slug.
 */
export function ReadingListArt({ data, className }: ReadingListArtProps) {
  const [sketchFn, setSketchFn] = useState<SketchFunction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getSketchForSlug(data.slug).then((fn) => {
      if (!cancelled) {
        setSketchFn(() => fn)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [data.slug])

  if (loading || !sketchFn) return null

  return (
    <ArtCanvas
      sketchFn={sketchFn}
      data={data}
      className={className}
    />
  )
}
