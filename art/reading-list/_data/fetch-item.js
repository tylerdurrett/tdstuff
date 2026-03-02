/**
 * Fetch a single reading list item from Sanity with all art-relevant fields.
 *
 * Usage:
 *   node art/reading-list/_data/fetch-item.js --slug "the-slug"
 *   node art/reading-list/_data/fetch-item.js --latest
 */
import { getClient, parseArgs, outputJSON, outputError } from '../../../.claude/skills/sanity-cms/scripts/lib/client.js'

const PROJECTION = `{
  title,
  "slug": slug.current,
  gist,
  shortSummary,
  keyPoints,
  sentimentArticle,
  sentimentCommunity,
  controversyScore,
  hnScore,
  hnCommentCount,
  "categories": categories[]->{title, "slug": slug.current},
  "topics": topics[]->{title, "slug": slug.current},
  savedAt
}`

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const client = getClient()

  let query
  let params = {}

  if (args.latest === 'true') {
    query = `*[_type == "readingList"]|order(savedAt desc)[0]${PROJECTION}`
  } else if (args.slug) {
    query = `*[_type == "readingList" && slug.current == $slug][0]${PROJECTION}`
    params = { slug: args.slug }
  } else {
    outputError(new Error('Provide --slug "the-slug" or --latest'))
    process.exit(1)
  }

  try {
    const result = await client.fetch(query, params)
    if (!result) {
      outputError(new Error('No reading list item found'))
      process.exit(1)
    }
    outputJSON({ success: true, result })
  } catch (err) {
    outputError(err)
    process.exit(1)
  }
}

main()
