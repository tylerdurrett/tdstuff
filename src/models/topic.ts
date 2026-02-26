import { defineQuery } from 'next-sanity'
import { client } from '@/sanity/client'
import type { Slug } from '../../sanity.types'

const options = { next: { revalidate: 30 } }

/**
 * ------------------------------------------------------------------
 * Get a single topic by slug
 */
export async function getTopicBySlug(slug: string) {
  const topicBySlugQuery = defineQuery(`*[
    _type == "topic"
    && slug.current == $slug
  ][0]{
    _id,
    title,
    slug
  }`)

  const topic = await client.fetch(topicBySlugQuery, { slug }, options)

  return topic
}

/**
 * ------------------------------------------------------------------
 * Get all topics with their reading list item counts
 */
interface TopicWithCount {
  _id: string
  title: string
  slug: Slug
  count: number
}

export async function getTopicsWithCounts(): Promise<TopicWithCount[]> {
  const topicsWithCountsQuery = defineQuery(`*[_type == "topic"]{
    _id,
    title,
    slug,
    "count": count(*[_type == "readingList" && references(^._id)])
  } | order(count desc)`)

  const topics = (await client.fetch(
    topicsWithCountsQuery,
    {},
    options
  )) as TopicWithCount[]

  return topics.filter((t) => t.count > 0)
}
