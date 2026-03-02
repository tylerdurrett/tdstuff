import type p5 from 'p5'

/**
 * Reading list item data relevant to algorithmic art generation.
 * Each field can drive visual parameters in a sketch.
 */
export type ReadingListArtData = {
  title: string
  slug: string
  gist: string | null
  shortSummary: string | null
  /** Number of key points (drives structural complexity) */
  keyPointCount: number
  /** Article tone: -100 (negative) to 100 (positive) */
  sentimentArticle: number | null
  /** Community reaction: -100 (negative) to 100 (positive) */
  sentimentCommunity: number | null
  /** Divisiveness: 0 (consensus) to 100 (deeply divisive) */
  controversyScore: number | null
  /** Hacker News upvotes */
  hnScore: number | null
  /** Hacker News comment count */
  hnCommentCount: number | null
  /** Category names */
  categories: string[]
  /** Topic names */
  topics: string[]
  /** ISO date string */
  savedAt: string | null
}

/**
 * A sketch function that receives a p5 instance and reading list data.
 * Uses p5's instance mode — the function should set up `p.setup` and `p.draw`.
 */
export type SketchFunction = (p: p5, data: ReadingListArtData) => void
