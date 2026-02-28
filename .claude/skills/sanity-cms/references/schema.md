# Sanity Schema Reference

Project: `g1sakegy` | Dataset: `production`

## Document Types

### post

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | |
| slug | slug | Yes | Source: title |
| subtitle | string | No | |
| intro | text | No | |
| excerpt | text | Yes | |
| author | reference → author | No | |
| category | reference → category | No | |
| mainImage | image (hotspot) | Yes | Sub-fields: alt (string), caption (string) |
| hideMainImageOnPost | boolean | No | Default: false |
| mainVideo | mux.video | No | |
| publishedAt | datetime | Yes | |
| editedAt | datetime | No | |
| body | blockContent | Yes | See Block Content section |

### readingList

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | |
| originalTitle | string | No | Original article title |
| slug | slug | Yes | Source: title |
| originalUrl | url | Yes | |
| discussionUrl | url | No | e.g., HN comments |
| category | reference → category | No | **Deprecated, hidden** — use categories |
| categories | array of reference → category | No | Replaces single category |
| featuredImage | image (hotspot) | No | Sub-fields: alt, caption |
| savedAt | datetime | No | |
| detailedSummary | text | No | Full summary |
| keyPoints | array of string | No | 3-5 key points |
| conclusion | text | No | |
| shortSummary | text | No | 3 sentences |
| gist | string | No | One-liner |
| newTitle | string | No | Rewritten headline |
| discussionDetailedSummary | text | No | |
| keyAgreeingViewpoints | array of string | No | |
| keyOpposingViewpoints | array of string | No | |
| sentiment | text | No | |
| discussionShortSummary | text | No | |
| discussionGist | string | No | |
| discussionTitle | string | No | |
| topics | array of reference → topic | No | 2-5 topic tags |
| hnScore | number | No | HN upvote count at processing time |
| hnCommentCount | number | No | HN comment count at processing time |
| sentimentArticle | number | No | Article tone: -100 (negative) to 100 (positive) |
| sentimentCommunity | number | No | Community reaction: -100 (negative) to 100 (positive) |
| controversyScore | number | No | How polarizing: 0 (consensus) to 100 (deeply divisive) |
| body | blockContent | No | Notes about the article |

### category

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | |
| slug | slug | Yes | Source: title |
| description | text | No | |
| parent | reference → category | No | Self-referencing, excludes own _id |

### thing

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | |
| slug | slug | Yes | Source: title |
| description | text | No | |
| featuredImage | image (hotspot) | Yes | Sub-fields: alt, caption |
| featuredVideo | mux.video | No | |
| featuredVideoThumb | mux.video | No | |
| images | array of image | No | Each has: alt, caption. Grid layout |
| videos | array of videoItem | No | See below |
| isAiGenerated | boolean | No | Default: false |
| body | blockContent | No | |

**videoItem** (object in videos array):

| Field | Type | Required |
|-------|------|----------|
| file | mux.video | Yes |
| title | string | No |
| alt | string | No |
| caption | string | No |
| poster | image (hotspot, alt) | No |
| autoplay | boolean | No (default: false) |
| loop | boolean | No (default: false) |
| muted | boolean | No (default: false) |

### author

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | |
| slug | slug | Yes | Source: name |
| image | image (hotspot) | No | |
| bio | array of block | No | Normal style only, no lists |

---

## Block Content (Portable Text)

The `blockContent` type is an array that can contain:

1. **block** — Rich text with styles, lists, marks
2. **youtube** — YouTube embed (url field)
3. **image** — Image with alt text
4. **callout** — Callout box (tone + content)
5. **mux.video** — Mux video
6. **fileBlock** — Downloadable file (file + caption)
7. **table** — Table with rows/cells

### Block styles
`normal`, `h1`, `h2`, `h3`, `h4`, `blockquote`

### List types
`bullet`, `number`

### Marks
- Decorators: `strong`, `em`
- Annotations: `link` (with `href` url field)

### Callout tones
`neutral`, `info`, `success`, `warning`, `destructive`

### Constructing Block Content for Mutations

**Simple paragraph:**
```json
[
  {
    "_type": "block",
    "_key": "unique-key-1",
    "style": "normal",
    "markDefs": [],
    "children": [
      {
        "_type": "span",
        "_key": "span-1",
        "text": "This is a paragraph.",
        "marks": []
      }
    ]
  }
]
```

**Paragraph with bold and italic:**
```json
[
  {
    "_type": "block",
    "_key": "unique-key-1",
    "style": "normal",
    "markDefs": [],
    "children": [
      { "_type": "span", "_key": "s1", "text": "This is ", "marks": [] },
      { "_type": "span", "_key": "s2", "text": "bold", "marks": ["strong"] },
      { "_type": "span", "_key": "s3", "text": " and ", "marks": [] },
      { "_type": "span", "_key": "s4", "text": "italic", "marks": ["em"] },
      { "_type": "span", "_key": "s5", "text": " text.", "marks": [] }
    ]
  }
]
```

**Paragraph with a link:**
```json
[
  {
    "_type": "block",
    "_key": "unique-key-1",
    "style": "normal",
    "markDefs": [
      { "_type": "link", "_key": "link-1", "href": "https://example.com" }
    ],
    "children": [
      { "_type": "span", "_key": "s1", "text": "Visit ", "marks": [] },
      { "_type": "span", "_key": "s2", "text": "this site", "marks": ["link-1"] },
      { "_type": "span", "_key": "s3", "text": " for more.", "marks": [] }
    ]
  }
]
```

**Heading:**
```json
{
  "_type": "block",
  "_key": "unique-key-1",
  "style": "h2",
  "markDefs": [],
  "children": [
    { "_type": "span", "_key": "s1", "text": "Section Title", "marks": [] }
  ]
}
```

**Bullet list:**
```json
[
  {
    "_type": "block",
    "_key": "li-1",
    "style": "normal",
    "listItem": "bullet",
    "level": 1,
    "markDefs": [],
    "children": [
      { "_type": "span", "_key": "s1", "text": "First item", "marks": [] }
    ]
  },
  {
    "_type": "block",
    "_key": "li-2",
    "style": "normal",
    "listItem": "bullet",
    "level": 1,
    "markDefs": [],
    "children": [
      { "_type": "span", "_key": "s1", "text": "Second item", "marks": [] }
    ]
  }
]
```

**Image in body (after uploading via upload.js):**
```json
{
  "_type": "image",
  "_key": "img-1",
  "asset": {
    "_type": "reference",
    "_ref": "image-abc123-1920x1080-jpg"
  },
  "alt": "Description of the image"
}
```

**YouTube embed in body:**
```json
{
  "_type": "youtube",
  "_key": "yt-1",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Callout in body:**
```json
{
  "_type": "callout",
  "_key": "callout-1",
  "tone": "info",
  "content": [
    {
      "_type": "block",
      "_key": "cb-1",
      "style": "normal",
      "markDefs": [],
      "children": [
        { "_type": "span", "_key": "s1", "text": "This is an info callout.", "marks": [] }
      ]
    }
  ]
}
```

---

## Working with References

**Single reference (e.g., post.category):**
```json
{
  "category": {
    "_type": "reference",
    "_ref": "category-document-id"
  }
}
```

**Array of references (e.g., readingList.categories):**
```json
{
  "categories": [
    { "_type": "reference", "_ref": "cat-id-1", "_key": "key-1" },
    { "_type": "reference", "_ref": "cat-id-2", "_key": "key-2" }
  ]
}
```

Array items require `_key`. The mutate.js script auto-generates `_key` values when not provided.

## Working with Slugs

```json
{
  "slug": {
    "_type": "slug",
    "current": "my-slug-value"
  }
}
```

## Working with Images

**After uploading with upload.js, use the returned ref:**
```json
{
  "mainImage": {
    "_type": "image",
    "asset": {
      "_type": "reference",
      "_ref": "image-abc123-1920x1080-jpg"
    },
    "alt": "Alt text",
    "caption": "Caption text"
  }
}
```

---

## Common GROQ Query Patterns

These patterns are extracted from the existing `src/models/` query functions.

### List documents with ordering and limit
```groq
*[_type == "post" && defined(slug.current)]|order(publishedAt desc)[0...$limit]{
  _id, title, slug, publishedAt, excerpt
}
```

### Get single document by slug
```groq
*[_type == "post" && slug.current == $slug][0]{
  _id, title, slug, body
}
```

### Dereference related documents
```groq
// Single reference
category->{title, slug}

// Array of references
categories[]->{title, slug}

// Nested: post with author and category
*[_type == "post"][0]{
  title,
  category->{title, slug},
  author->{name, image}
}
```

### Filter by reference
```groq
// Posts in a specific category
*[_type == "post" && category->slug.current == $categorySlug]

// Reading list items with optional category filter
*[_type == "readingList" && ($category == "" || $category in categories[]->slug.current)]
```

### Count documents
```groq
count(*[_type == "readingList" && defined(slug.current)])
```

### Count references (used for category filtering)
```groq
*[_type == "category" && count(*[_type == "readingList" && references(^._id)]) >= 5]
```

### Expand Mux video assets in body
```groq
body[]{
  ...,
  _type == "mux.video" => {
    asset->
  }
}
```

### Pagination with slice
```groq
*[_type == "readingList"]|order(savedAt desc)[$start...$end]{
  _id, title, slug
}
```

---

## Mux Video

Mux videos are managed through the Sanity Studio Mux plugin. They cannot be uploaded via this skill's upload.js script. To reference an existing Mux video asset in a mutation, you need its asset ID from a query:

```groq
// Find Mux video assets
*[_type == "mux.videoAsset"]{_id, playbackId, filename}
```
