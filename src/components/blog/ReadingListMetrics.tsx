import {
  calculateHotness,
  calculateEngagementRatio,
  getSentimentLabel,
  getControversyLabel,
  sentimentToHue,
} from '@/lib/reading-list/metrics'
import {
  FlameIcon,
  MessageCircleIcon,
  ArrowUpIcon,
  TrendingUpIcon,
  ScaleIcon,
} from 'lucide-react'

interface ReadingListMetricsProps {
  hnScore: number | null
  hnCommentCount: number | null
  sentimentArticle: number | null
  sentimentCommunity: number | null
  controversyScore: number | null
  savedAt: string | null
}

export function ReadingListMetrics({
  hnScore,
  hnCommentCount,
  sentimentArticle,
  sentimentCommunity,
  controversyScore,
  savedAt,
}: ReadingListMetricsProps) {
  const hotness = calculateHotness(hnScore, savedAt)
  const engagementRatio = calculateEngagementRatio(hnCommentCount, hnScore)
  const hasAnyMetric = hnScore != null || sentimentArticle != null

  if (!hasAnyMetric) return null

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {hnScore != null && (
        <MetricPill
          icon={<ArrowUpIcon className="h-3.5 w-3.5" />}
          label={`${hnScore}`}
          title={`HN Score: ${hnScore}`}
        />
      )}
      {hnCommentCount != null && (
        <MetricPill
          icon={<MessageCircleIcon className="h-3.5 w-3.5" />}
          label={`${hnCommentCount}`}
          title={`Comments: ${hnCommentCount}`}
        />
      )}
      {hotness != null && (
        <MetricPill
          icon={<FlameIcon className="h-3.5 w-3.5" />}
          label={hotness.toFixed(1)}
          title={`Hotness: ${hotness.toFixed(2)}`}
        />
      )}
      {engagementRatio != null && (
        <MetricPill
          icon={<TrendingUpIcon className="h-3.5 w-3.5" />}
          label={engagementRatio.toFixed(2)}
          title={`Engagement Ratio: ${engagementRatio.toFixed(3)}`}
        />
      )}
      {sentimentArticle != null && (
        <MetricPill
          icon={<SentimentDot score={sentimentArticle} />}
          label={`Article: ${getSentimentLabel(sentimentArticle)}`}
          title={`Article Sentiment: ${sentimentArticle}`}
        />
      )}
      {sentimentCommunity != null && (
        <MetricPill
          icon={<SentimentDot score={sentimentCommunity} />}
          label={`Community: ${getSentimentLabel(sentimentCommunity)}`}
          title={`Community Sentiment: ${sentimentCommunity}`}
        />
      )}
      {controversyScore != null && (
        <MetricPill
          icon={<ScaleIcon className="h-3.5 w-3.5" />}
          label={getControversyLabel(controversyScore) ?? ''}
          title={`Controversy: ${controversyScore}/100`}
        />
      )}
    </div>
  )
}

function MetricPill({
  icon,
  label,
  title,
}: {
  icon: React.ReactNode
  label: string
  title: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground"
      title={title}
    >
      {icon}
      <span>{label}</span>
    </span>
  )
}

function SentimentDot({ score }: { score: number }) {
  const hue = sentimentToHue(score)
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: `oklch(0.65 0.15 ${hue})` }}
    />
  )
}
