'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import TextFillBlock from './TextFillBlock'

interface BlockConfig {
  text: string
  label: string
  href: string
  videoPlaybackIds: string[]
  /** Preferred break point indices for word-boundary-aware breaking (mobile only) */
  breakHints?: number[]
}

const BLOCKS: BlockConfig[] = [
  {
    text: 'READINGLIST',
    label: 'Reading List',
    href: '/reading',
    videoPlaybackIds: ['penMkr9zNyYGXc5GjcJnHTqtMUBn8N901l3SfO8Rp01Os'],
    breakHints: [7], // READING|LIST
  },
  {
    text: 'TOPICS',
    label: 'Topics',
    href: '/reading/topics',
    videoPlaybackIds: ['LuwmQgGmPIcLLTc01tTgUX65Miefb5SPhtUVEYibZblk'],
  },
]

let hasLoadedOnce = false

export default function HomeClient() {
  const [selectedIds] = useState(() =>
    BLOCKS.map(
      (b) =>
        b.videoPlaybackIds[
          Math.floor(Math.random() * b.videoPlaybackIds.length)
        ]
    )
  )
  const [, setReadyCount] = useState(0)
  const [displayPercent, setDisplayPercent] = useState(hasLoadedOnce ? 100 : 0)
  const [fadeOut, setFadeOut] = useState(hasLoadedOnce)
  const readyCountRef = useRef(0)
  const currentPercentRef = useRef(0)
  const startTimeRef = useRef(0)
  const rafRef = useRef<number>(0)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleBlockReady = useCallback(() => {
    setReadyCount((c) => {
      const next = c + 1
      readyCountRef.current = next
      return next
    })
  }, [])

  // Smooth percentage counter animation (skipped on return visits)
  useEffect(() => {
    if (hasLoadedOnce) return

    startTimeRef.current = performance.now()

    const TOTAL_BLOCKS = BLOCKS.length
    const LERP_FACTOR = 0.12
    const TIME_CONSTANT = 2000
    const MAX_SIMULATED = 90
    const HOLD_DURATION = 150

    function tick() {
      const elapsed = performance.now() - startTimeRef.current

      // Time-based target: asymptotically approaches 90%
      const timeTarget =
        MAX_SIMULATED * (1 - Math.exp(-elapsed / TIME_CONSTANT))

      // Real progress target: reaches 100 when all blocks ready
      const realTarget = (readyCountRef.current / TOTAL_BLOCKS) * 100

      // Display target is the higher of the two
      const target = Math.max(timeTarget, realTarget)

      // Lerp toward target
      const current = currentPercentRef.current
      const next = current + (target - current) * LERP_FACTOR

      // Snap to 100 when very close
      const snapped = target >= 100 && next > 99.5 ? 100 : next
      currentPercentRef.current = snapped

      // Only update React state when the displayed integer changes
      const displayInt = Math.min(Math.round(snapped), 100)
      setDisplayPercent((prev) => (prev === displayInt ? prev : displayInt))

      if (displayInt < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Hold at 100% briefly, then trigger fade-out
        hasLoadedOnce = true
        holdTimerRef.current = setTimeout(() => {
          setFadeOut(true)
        }, HOLD_DURATION)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  return (
    <div className="h-dvh w-dvw flex landscape:flex-row portrait:flex-col overflow-hidden">
      {/* Percentage counter loader */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center bg-background transition-opacity duration-300 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <span className="font-league-gothic text-[25vw] leading-none select-none">
          {displayPercent}%
        </span>
      </div>

      {BLOCKS.map((block, i) => (
        <TextFillBlock
          key={block.text}
          text={block.text}
          label={block.label}
          href={block.href}
          videoPlaybackId={selectedIds[i]}
          onReady={handleBlockReady}
          className="landscape:w-1/2 landscape:h-full portrait:w-full portrait:h-1/2"
          breakHints={block.breakHints}
        />
      ))}
    </div>
  )
}
