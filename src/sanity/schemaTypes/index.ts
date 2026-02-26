import { type SchemaTypeDefinition } from 'sanity'

import { blockContentType } from './blockContentType'
import { categoryType } from './categoryType'
import { postType } from './postType'
import { readingListType } from './readingListType'
import { authorType } from './authorType'
import { calloutType } from './calloutType'
import { fileBlockType } from './fileBlockType'
import { youtubeType } from './youtubeType'
import { thingType } from './thingType'
import { topicType } from './topicType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    postType,
    readingListType,
    categoryType,
    topicType,
    blockContentType,
    authorType,
    calloutType,
    fileBlockType,
    youtubeType,
    thingType,
  ],
}
