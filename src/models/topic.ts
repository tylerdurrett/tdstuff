import { defineQuery } from 'next-sanity'
import { client } from '@/sanity/client'

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
