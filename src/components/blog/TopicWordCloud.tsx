'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

interface TopicEntry {
  title: string
  slug: string
  count: number
}

export interface TopicWordCloudProps {
  topics: TopicEntry[]
  /** Smallest word font size in px (default 16) */
  minFontSize?: number
  /** Largest word font size in px (default 72) */
  maxFontSize?: number
  /** Gap between words in rem (default 1.5) */
  gap?: number
  /** Additional class names on the outer container */
  className?: string
}

export function TopicWordCloud({
  topics,
  minFontSize = 16,
  maxFontSize = 72,
  gap = 1.5,
  className,
}: TopicWordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [optimalWidth, setOptimalWidth] = useState<number | undefined>(
    undefined
  )
  const [ready, setReady] = useState(false)

  const counts = topics.map((t) => t.count)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)
  const countRange = maxCount - minCount

  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    const fit = () => {
      const cw = container.clientWidth
      const ch = container.clientHeight
      if (cw === 0 || ch === 0) return

      const targetAspect = cw / ch

      // Binary search for the inner width that produces a content block
      // whose aspect ratio best matches the container's aspect ratio.
      let lo = cw * 0.2
      let hi = cw * 2

      inner.style.transform = 'scale(1)'

      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2
        inner.style.width = `${mid}px`

        const contentW = inner.scrollWidth
        const contentH = inner.scrollHeight
        if (contentH === 0) break

        const contentAspect = contentW / contentH

        if (contentAspect > targetAspect) {
          hi = mid
        } else {
          lo = mid
        }
      }

      const bestWidth = (lo + hi) / 2
      inner.style.width = `${bestWidth}px`

      const finalW = inner.scrollWidth
      const finalH = inner.scrollHeight

      const s = Math.min(cw / finalW, ch / finalH) * 0.95

      setOptimalWidth(bestWidth)
      setScale(s)
      setReady(true)
    }

    document.fonts.ready.then(fit)

    const observer = new ResizeObserver(fit)
    observer.observe(container)
    return () => observer.disconnect()
  }, [topics])

  return (
    <div
      ref={containerRef}
      className={`flex min-h-full w-full items-center justify-center overflow-y-auto ${className ?? ''}`}
    >
      <div
        ref={innerRef}
        className="flex flex-wrap items-center justify-center py-8"
        style={{
          columnGap: `${gap}rem`,
          rowGap: `${gap * 0.35}rem`,
          width: optimalWidth,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          opacity: ready ? 1 : 0,
          transition: 'opacity 400ms ease',
        }}
      >
        {topics.map((topic) => {
          const t = countRange > 0 ? (topic.count - minCount) / countRange : 1
          const fontSize = minFontSize + t * (maxFontSize - minFontSize)
          const opacity = 0.4 + t * 0.6

          return (
            <Link
              key={topic.slug}
              href={`/reading?topic=${topic.slug}`}
              className="whitespace-nowrap text-foreground underline-offset-4 transition-all duration-150 hover:text-purple-light! hover:opacity-[1]!"
              style={{ fontSize, opacity, lineHeight: 1 }}
            >
              {topic.title}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
