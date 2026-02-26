import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('post').title('Blog Posts'),
      S.documentTypeListItem('readingList').title('Reading List'),
      S.documentTypeListItem('thing').title('Things'),
      S.divider(),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('topic').title('Topics'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      S.documentTypeListItem('mux.videoAsset').title('Video Assets'),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          ![
            'post',
            'readingList',
            'thing',
            'category',
            'topic',
            'author',
            'mux.videoAsset',
          ].includes(item.getId()!)
      ),
    ])
