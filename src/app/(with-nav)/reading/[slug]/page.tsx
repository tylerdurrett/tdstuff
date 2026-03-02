import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/container'
import type { Metadata } from 'next'
import { getReadingListItemBySlug } from '@/models/readingList'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import Link from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ReadingListMetrics } from '@/components/blog/ReadingListMetrics'
import { ReadingListArt, hasSketchForSlug } from '@/features/algorithmic-art'
import type { ReadingListArtData } from '@/features/algorithmic-art'
import '../../blog/prose.css'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getReadingListItemBySlug(slug)

  if (!item) {
    return {
      title: 'Reading List Item Not Found',
    }
  }

  const ogImageUrl = item.featuredImage
    ? urlFor(item.featuredImage).width(1200).height(630).url()
    : '/static/td-logo-wide.jpg'

  return {
    title: item.title,
    description: `Reading list item: ${item.title}`,
    openGraph: {
      title: item.title,
      description: `Reading list item: ${item.title}`,
      type: 'article',
      publishedTime: item.savedAt || undefined,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: `Reading list item: ${item.title}`,
      images: [ogImageUrl],
    },
  }
}

export default async function ReadingListItem({ params }: Props) {
  const { slug } = await params
  const item = await getReadingListItemBySlug(slug)
  const imageUrl = item?.featuredImage
    ? urlFor(item.featuredImage)?.width(1920).height(1080).url()
    : null

  if (!item) {
    notFound()
  }

  const isAnimatedGif = imageUrl?.toLowerCase().includes('.gif') || false
  const formattedDate = item.savedAt
    ? new Date(item.savedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'unknown date'

  return (
    <div className="py-8 md:py-16">
      <article>
        <Container size="xl">
          <header className="mb-8">
            <h1 className="mb-4 text-4xl sm:text-5xl md:text-7xl tracking-tight">
              {item.title}
            </h1>
            <div className="flex items-center gap-3 mt-6 text-muted-foreground">
              <a
                href={item.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:underline"
              >
                Article
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
              {item.discussionUrl && (
                <>
                  <span
                    aria-hidden="true"
                    className="mx-2 text-muted-foreground/60"
                  >
                    |
                  </span>
                  <a
                    href={item.discussionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:underline"
                  >
                    Discussion
                    <ExternalLinkIcon className="w-4 h-4" />
                  </a>
                </>
              )}
              <span
                aria-hidden="true"
                className="mx-2 text-muted-foreground/60 hidden sm:inline"
              >
                |
              </span>
              <span className="tracking-wide">
                added {formattedDate}
              </span>
              {item.topics && item.topics.length > 0 && (
                <>
                  <span
                    aria-hidden="true"
                    className="mx-2 text-muted-foreground/60 hidden sm:inline"
                  >
                    |
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.topics.filter(Boolean).map((topic) => (
                      <Badge key={topic._id} variant="secondary" asChild>
                        <Link href={`/reading?topic=${topic.slug.current}`}>
                          {topic.title}
                        </Link>
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
            <ReadingListMetrics
              hnScore={item.hnScore ?? null}
              hnCommentCount={item.hnCommentCount ?? null}
              sentimentArticle={item.sentimentArticle ?? null}
              sentimentCommunity={item.sentimentCommunity ?? null}
              controversyScore={item.controversyScore ?? null}
              savedAt={item.savedAt ?? null}
            />
          </header>
        </Container>

        {imageUrl && (
          <Container size="xl">
            <div className="mb-6 rounded-2xl overflow-hidden">
              <Image
                src={imageUrl}
                alt={item.title}
                className="aspect-video w-full h-auto object-cover rounded-xl"
                width={1920}
                height={1080}
                unoptimized={isAnimatedGif}
              />
            </div>
            {item.featuredImage?.caption && (
              <p className="mt-2 italic text-sm text-muted-foreground">
                {item.featuredImage.caption}
              </p>
            )}
          </Container>
        )}

        {hasSketchForSlug(slug) && (
          <Container size="xl">
            <div className="mb-8 flex justify-center rounded-2xl overflow-hidden">
              <ReadingListArt
                data={{
                  title: item.title,
                  slug,
                  gist: item.gist ?? null,
                  shortSummary: item.shortSummary ?? null,
                  keyPointCount: item.keyPoints?.length ?? 0,
                  sentimentArticle: item.sentimentArticle ?? null,
                  sentimentCommunity: item.sentimentCommunity ?? null,
                  controversyScore: item.controversyScore ?? null,
                  hnScore: item.hnScore ?? null,
                  hnCommentCount: item.hnCommentCount ?? null,
                  categories: (item.categories ?? [])
                    .filter(Boolean)
                    .map((c) => c.title),
                  topics: (item.topics ?? [])
                    .filter(Boolean)
                    .map((t) => t.title),
                  savedAt: item.savedAt ?? null,
                } satisfies ReadingListArtData}
                className="rounded-2xl overflow-hidden"
              />
            </div>
          </Container>
        )}

        <Container size="xl">
          <div className="prose prose-lg prose-neutral max-w-none dark:prose-invert prose-headings:font-sans prose-headings:font-normal prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-2xl md:prose-h3:text-3xl prose-h4:text-xl md:prose-h4:text-2xl">
            <p>{item.shortSummary}</p>
            {item.keyPoints && item.keyPoints.length > 0 && (
              <>
                <h3>Key Points</h3>
                <ul>
                  {item.keyPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </>
            )}
            {item.sentiment && (
              <>
                <h3>Sentiment</h3>
                <p>{item.sentiment}</p>
              </>
            )}
            {item.keyAgreeingViewpoints &&
              item.keyAgreeingViewpoints.length > 0 && (
                <>
                  <h3>In Agreement</h3>
                  <ul>
                    {item.keyAgreeingViewpoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </>
              )}
            {item.keyOpposingViewpoints &&
              item.keyOpposingViewpoints.length > 0 && (
                <>
                  <h3>Opposed</h3>
                  <ul>
                    {item.keyOpposingViewpoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </>
              )}
          </div>
        </Container>

        {/* {item.body && Array.isArray(item.body) && item.body.length > 0 && (
          <Container size="xl">
            <div className="prose prose-lg prose-neutral max-w-none dark:prose-invert prose-headings:font-sans prose-headings:font-normal prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-2xl md:prose-h3:text-3xl prose-h4:text-xl md:prose-h4:text-2xl">
              <PortableText
                value={item.body}
                components={portableTextComponents}
              />
            </div>
          </Container>
        )} */}
      </article>
    </div>
  )
}
