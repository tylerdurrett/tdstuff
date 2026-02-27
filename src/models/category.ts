import { defineQuery } from 'next-sanity'
import { CategoriesQueryResult } from '../../sanity.types'
import { client } from '@/sanity/client'

const options = { next: { revalidate: 30 } }

/**
 * ------------------------------------------------------------------
 * Get all categories
 */
export async function getCategories() {
  const categoriesQuery = defineQuery(`*[
    _type == "category"
    && count(*[_type == "readingList" && defined(slug.current) && references(^._id)]) >= 5
  ]|order(title asc){
    _id,
    title,
    slug,
    description
  }`)

  const categories = await client.fetch(categoriesQuery, {}, options)

  return categories
}

export type Category = CategoriesQueryResult[number]
