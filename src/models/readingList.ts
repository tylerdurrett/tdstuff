import { defineQuery } from 'next-sanity'
import {
  ReadingListItemQueryResult,
  ReadingListItemsQueryResult,
} from '../../sanity.types'
import { client } from '@/sanity/client'

const options = { next: { revalidate: 30 } }

/**
 * ------------------------------------------------------------------
 * Get reading list items with pagination support
 */
export async function getReadingListItems(
  options: {
    page?: number
    limit?: number
    category?: string
  } = {}
) {
  const { page = 1, limit = 100, category = '' } = options
  const start = (page - 1) * limit
  const end = start + limit - 1

  const readingListItemsQuery = defineQuery(`*[
    _type == "readingList"
    && defined(slug.current)
    && ($category == "" || $category in categories[]->slug.current)
  ]|order(savedAt desc)[$start...$end]{
    _id,
    title,
    slug,
    originalUrl,
    savedAt,
    gist,
    shortSummary,
    keyPoints,
    sentiment,
    keyAgreeingViewpoints,
    keyOpposingViewpoints,
    categories[]->{title, slug},
    featuredImage
  }`)

  const readingListItems = await client.fetch(
    readingListItemsQuery,
    { start, end, category },
    { next: { revalidate: 30 } }
  )

  return readingListItems
}

/**
 * ------------------------------------------------------------------
 * Get total count of reading list items
 */
export async function getReadingListItemsCount(category: string = '') {
  const countQuery = defineQuery(`count(*[
    _type == "readingList"
    && defined(slug.current)
    && ($category == "" || $category in categories[]->slug.current)
  ])`)

  const count = await client.fetch(
    countQuery,
    { category },
    { next: { revalidate: 30 } }
  )

  return count
}

/* A single reading list item meta data entry */
export type ReadingListItemMeta = ReadingListItemsQueryResult[number]

/**
 * ------------------------------------------------------------------
 * Get a single reading list item by slug
 */
export async function getReadingListItemBySlug(slug: string) {
  const readingListItemQuery = defineQuery(
    `*[_type == "readingList" && slug.current == $slug][0]{
      _id, 
      title, 
      originalTitle,
      slug, 
      originalUrl,
      discussionUrl,
      categories[]->{title, slug},
      topics[]->{_id, title, slug},
      savedAt, 
      featuredImage{..., "caption": caption},
      detailedSummary,
      keyPoints,
      conclusion,
      shortSummary,
      gist,
      newTitle,
      discussionDetailedSummary,
      keyAgreeingViewpoints,
      keyOpposingViewpoints,
      sentiment,
      discussionShortSummary,
      discussionGist,
      discussionTitle,
      body[]{
        ...,
        _type == "mux.video" => {
          asset->
        }
      }
    }`
  )

  const readingListItem = await client.fetch(
    readingListItemQuery,
    { slug },
    options
  )

  return readingListItem
}

export type ReadingListItem = ReadingListItemQueryResult
