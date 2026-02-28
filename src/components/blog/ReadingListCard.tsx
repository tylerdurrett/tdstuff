import Link from 'next/link'
import { ReadingListItemMeta } from '@/models/readingList'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import { ArrowUpIcon, ExternalLinkIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { sentimentToColor } from '@/lib/reading-list/metrics'

interface ReadingListCardProps {
  item: ReadingListItemMeta
}

export function ReadingListCard({ item }: ReadingListCardProps) {
  const imageUrl = item?.featuredImage
    ? urlFor(item.featuredImage)?.width(120).height(120).url()
    : null

  return (
    <article className="bg-card text-card-foreground rounded-3xl border-4 border-transparent hover:border-accent has-[.external-link:hover]:hover:border-accent/60 transition-colors duration-300 relative">
      <Link
        href={`/reading/${item.slug.current}`}
        className="absolute inset-0 z-0 rounded-3xl"
      >
        <span className="sr-only">{item.title}</span>
      </Link>
      <div className="flex items-start gap-4 p-4 sm:p-6">
        {imageUrl && (
          <div className="flex-shrink-0">
            <Image
              src={imageUrl}
              alt={item.title}
              width={120}
              height={120}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {item.categories && item.categories.filter(Boolean).length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                {item.categories.filter(Boolean).map((cat) => cat.title).join(', ')}
              </span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">
            {item.title}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {item.savedAt && (
              <time
                dateTime={item.savedAt}
                className="text-sm text-muted-foreground"
              >
                {new Date(item.savedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            )}
            {item.sentimentArticle != null && (
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  backgroundColor: sentimentToColor(item.sentimentArticle),
                }}
                title={`Sentiment: ${item.sentimentArticle}`}
              />
            )}
            {item.hnScore != null && item.hnScore >= 100 && (
              <span
                className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"
                title={`HN Score: ${item.hnScore}`}
              >
                <ArrowUpIcon className="h-3 w-3" />
                {item.hnScore}
              </span>
            )}
            {item.topics &&
              item.topics.length > 0 &&
              item.topics.filter(Boolean).map((topic) => (
                <Badge key={topic._id} variant="secondary" asChild>
                  <Link
                    href={`/reading?topic=${topic.slug.current}`}
                    className="relative z-10"
                  >
                    {topic.title}
                  </Link>
                </Badge>
              ))}
          </div>
        </div>
      </div>
      {item.originalUrl && (
        <Link
          href={item.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link absolute top-4 right-4 sm:top-6 sm:right-6 p-1.5 rounded-full bg-background/80 hover:bg-background z-10 hover:scale-110 transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLinkIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </Link>
      )}
    </article>
  )
}
