import { TopicWordCloud } from '@/components/blog/TopicWordCloud'
import { getTopicsWithCounts } from '@/models/topic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Browse reading list topics',
}

export default async function TopicsPage() {
  const topics = await getTopicsWithCounts()

  const cloudTopics = topics.map((t) => ({
    title: t.title,
    slug: t.slug.current,
    count: t.count,
  }))

  return (
    <div className="h-[calc(100dvh-3rem)] md:h-[calc(100dvh-2.5rem)] lg:h-[calc(100dvh-3rem)] min-[1200px]:h-[calc(100dvh-4rem)] xl:h-[calc(100dvh-5rem)]">
      <TopicWordCloud topics={cloudTopics} />
    </div>
  )
}
