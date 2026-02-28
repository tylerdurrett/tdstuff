/**
 * Calculate "hotness" using the HN ranking formula.
 * Formula: (score - 1) / (hours + 2)^1.8
 */
export function calculateHotness(
  score: number | null | undefined,
  savedAt: string | null | undefined,
  now: number = Date.now()
): number | null {
  if (score == null || !savedAt) return null

  const savedTime = new Date(savedAt).getTime()
  const hoursElapsed = (now - savedTime) / (1000 * 60 * 60)
  if (hoursElapsed < 0) return null

  return (score - 1) / Math.pow(hoursElapsed + 2, 1.8)
}

/**
 * Calculate engagement ratio: comments per upvote.
 * Higher ratios suggest more discussion-generating content.
 */
export function calculateEngagementRatio(
  commentCount: number | null | undefined,
  score: number | null | undefined
): number | null {
  if (commentCount == null || score == null || score === 0) return null
  return commentCount / score
}

/**
 * Map a sentiment score (-100 to 100) to a human-readable label.
 */
export function getSentimentLabel(
  score: number | null | undefined
): string | null {
  if (score == null) return null
  if (score <= -60) return 'Very Negative'
  if (score <= -20) return 'Negative'
  if (score <= 20) return 'Neutral'
  if (score <= 60) return 'Positive'
  return 'Very Positive'
}

/**
 * Map a controversy score (0 to 100) to a human-readable label.
 */
export function getControversyLabel(
  score: number | null | undefined
): string | null {
  if (score == null) return null
  if (score <= 20) return 'Consensus'
  if (score <= 50) return 'Mixed'
  if (score <= 75) return 'Divisive'
  return 'Deeply Divisive'
}

/**
 * Map a sentiment score (-100 to 100) to an oklch color string.
 * 0 → darkish gray, negative → brighter red, positive → brighter green.
 */
export function sentimentToColor(score: number): string {
  const intensity = Math.abs(score) / 100
  const hue = score >= 0 ? 145 : 25
  const chroma = intensity * 0.2
  const lightness = 0.55 + intensity * 0.1
  return `oklch(${lightness} ${chroma} ${hue})`
}
