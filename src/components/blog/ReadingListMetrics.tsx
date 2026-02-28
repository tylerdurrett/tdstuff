'use client'

import {
  calculateHotness,
  calculateEngagementRatio,
  getSentimentLabel,
  getControversyLabel,
  sentimentToColor,
} from '@/lib/reading-list/metrics'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
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
          tooltip="Hacker News upvotes"
        />
      )}
      {hnCommentCount != null && (
        <MetricPill
          icon={<MessageCircleIcon className="h-3.5 w-3.5" />}
          label={`${hnCommentCount}`}
          tooltip="Hacker News comments"
        />
      )}
      {hotness != null && (
        <MetricPill
          icon={<FlameIcon className="h-3.5 w-3.5" />}
          label={hotness.toFixed(1)}
          tooltip="Trending score — higher means more recent popularity"
        />
      )}
      {engagementRatio != null && (
        <MetricPill
          icon={<TrendingUpIcon className="h-3.5 w-3.5" />}
          label={engagementRatio.toFixed(2)}
          tooltip="Comments per upvote — higher means more discussion"
        />
      )}
      {sentimentArticle != null && (
        <MetricPill
          icon={<SentimentDot score={sentimentArticle} />}
          label={`Article: ${getSentimentLabel(sentimentArticle)}`}
          tooltip={`Tone of the article: ${sentimentArticle} (−100 to 100)`}
        />
      )}
      {sentimentCommunity != null && (
        <MetricPill
          icon={<SentimentDot score={sentimentCommunity} />}
          label={`Community: ${getSentimentLabel(sentimentCommunity)}`}
          tooltip={`Tone of community discussion: ${sentimentCommunity} (−100 to 100)`}
        />
      )}
      {controversyScore != null && (
        <MetricPill
          icon={<ScaleIcon className="h-3.5 w-3.5" />}
          label={getControversyLabel(controversyScore) ?? ''}
          tooltip="How divided the community response is (0–100)"
        />
      )}
    </div>
  )
}

function MetricPill({
  icon,
  label,
  tooltip,
}: {
  icon: React.ReactNode
  label: string
  tooltip: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-default items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
          {icon}
          <span>{label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function SentimentDot({ score }: { score: number }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: sentimentToColor(score) }}
    />
  )
}
