---
name: sanity-cms
description: Read and write to the project's Sanity CMS using GROQ queries and mutations. Use when the user asks to query, create, update, or delete content in Sanity, or when they want to manage blog posts, reading list items, things, categories, or authors. Also use for uploading images or files to Sanity assets. Handles GROQ queries, document mutations (create, patch, delete), and asset uploads.
---

# Sanity CMS

Read and write to the project's Sanity CMS (project: `g1sakegy`, dataset: `production`).

All scripts are in `.claude/skills/sanity-cms/scripts/`. Run from the **project root**.

## Setup

### Prerequisites

- `SANITY_API_TOKEN` — project-level token with Editor permissions (for queries + mutations)
- `SANITY_API_ORG_TOKEN` — organization-level token for media library access (optional, used as fallback for uploads)

Set via shell profile or `.env.local` at project root. The scripts check `process.env` first, then parse `.env.local` as fallback.

### Install Dependencies

```bash
cd .claude/skills/sanity-cms/scripts && pnpm install
```

## Scripts

### query.js — Run GROQ Queries

```bash
# List all categories
node .claude/skills/sanity-cms/scripts/query.js \
  --query '*[_type == "category"]|order(title asc){_id, title, slug}'

# Query with parameters
node .claude/skills/sanity-cms/scripts/query.js \
  --query '*[_type == "post" && slug.current == $slug][0]{_id, title}' \
  --params '{"slug": "my-post"}'

# Query from file (avoids shell escaping issues with !, &&, etc.)
echo '*[_type == "post" && !(_id in path("drafts.**"))]{_id, title}' > /tmp/query.groq
node .claude/skills/sanity-cms/scripts/query.js --file /tmp/query.groq

# Auto-filter draft documents (no need for ! in the query)
node .claude/skills/sanity-cms/scripts/query.js \
  --query '*[_type == "post"]{_id, title}' --no-drafts
```

**Args:** `--query` or `--file` (one required), `--params` (optional JSON), `--no-drafts` (optional, filters out draft documents from array results)

### get.js — Get Document by ID

```bash
node .claude/skills/sanity-cms/scripts/get.js --id "abc123"
node .claude/skills/sanity-cms/scripts/get.js --id "abc123" --fields "title, slug"
```

**Args:** `--id` (required), `--fields` (optional GROQ projection)

### mutate.js — Create, Patch, Delete

```bash
# Create
node .claude/skills/sanity-cms/scripts/mutate.js --action create \
  --data '{"_type": "category", "title": "New", "slug": {"_type": "slug", "current": "new"}}'

# Patch (set fields)
node .claude/skills/sanity-cms/scripts/mutate.js --action patch --id "abc123" \
  --set '{"title": "Updated"}'

# Patch (unset fields)
node .claude/skills/sanity-cms/scripts/mutate.js --action patch --id "abc123" \
  --unset '["subtitle"]'

# Patch (insert into array)
node .claude/skills/sanity-cms/scripts/mutate.js --action patch --id "abc123" \
  --insert '{"after": "categories[-1]", "items": [{"_type": "reference", "_ref": "cat-id"}]}'

# Delete
node .claude/skills/sanity-cms/scripts/mutate.js --action delete --id "abc123"

# Large payload from file
node .claude/skills/sanity-cms/scripts/mutate.js --action create --file /tmp/doc.json

# Dry run
node .claude/skills/sanity-cms/scripts/mutate.js --action create --data '...' --dry-run
```

**Args:** `--action` (create|createOrReplace|patch|delete), `--data` or `--file`, `--id` (patch/delete), `--set`/`--unset`/`--insert` (patch), `--dry-run`

Array items without `_key` get one auto-generated.

### upload.js — Upload Assets

```bash
node .claude/skills/sanity-cms/scripts/upload.js --file /path/to/image.jpg --type image
node .claude/skills/sanity-cms/scripts/upload.js --file /path/to/doc.pdf --type file
```

**Args:** `--file` (required), `--type` (image|file), `--filename`, `--label`

Returns a `ref` object ready to embed in mutations.

### checklist.js — Generate Processable Checklists

Generates a JSON checklist of readingList items matching filter criteria. Useful for batch processing tasks like recategorization, topic assignment, or auditing.

```bash
# Items NOT in specific categories (by slug)
node .claude/skills/sanity-cms/scripts/checklist.js \
  --exclude-categories "damage-control,programming,creative-code" \
  --output /path/to/checklist.json

# Items IN specific categories only
node .claude/skills/sanity-cms/scripts/checklist.js \
  --categories "research-and-understanding,market-forces" \
  --output /path/to/checklist.json

# Items with a specific topic
node .claude/skills/sanity-cms/scripts/checklist.js \
  --topic "ai-coding-agents" \
  --output /path/to/checklist.json

# Items with NO categories assigned
node .claude/skills/sanity-cms/scripts/checklist.js \
  --uncategorized \
  --output /path/to/checklist.json

# Items with NO topics assigned
node .claude/skills/sanity-cms/scripts/checklist.js \
  --no-topics \
  --output /path/to/checklist.json

# Items missing any metric fields (hnScore, hnCommentCount, sentimentArticle, sentimentCommunity, controversyScore)
node .claude/skills/sanity-cms/scripts/checklist.js \
  --no-metrics \
  --output /path/to/checklist.json

# Items missing article sentiment specifically
node .claude/skills/sanity-cms/scripts/checklist.js \
  --no-article-sentiment \
  --output /path/to/checklist.json

# All published items (no filter)
node .claude/skills/sanity-cms/scripts/checklist.js \
  --output /path/to/checklist.json

# Preview without writing
node .claude/skills/sanity-cms/scripts/checklist.js \
  --exclude-categories "damage-control" --output checklist.json --dry-run
```

**Args:** `--output` (required), `--exclude-categories` (optional, comma-separated slugs), `--categories` (optional, comma-separated slugs), `--topic` (optional, single slug), `--uncategorized` (optional flag), `--no-topics` (optional flag), `--no-metrics` (optional flag), `--no-article-sentiment` (optional flag), `--dry-run`

`--categories` and `--exclude-categories` are mutually exclusive. `--topic` can be combined with either.

Output file format:
```json
[
  {
    "title": "Article Title",
    "_id": "readingList-slug-timestamp",
    "currentCategories": ["Category Name"],
    "currentTopics": ["Topic Name"],
    "status": "unprocessed"
  }
]
```

### slugify.js (lib) — Generate Slugs

A utility in `scripts/lib/` for generating Sanity-compatible slugs. **Always use this utility when creating or updating slug values** — never hand-write slug strings.

#### CLI Usage

```bash
# Generate a slug string
node .claude/skills/sanity-cms/scripts/lib/slugify.js "My Blog Post Title"
# Output: my-blog-post-title

# Generate a full Sanity slug object (JSON)
node .claude/skills/sanity-cms/scripts/lib/slugify.js "Node.js & TypeScript: A Guide" --json
# Output: {"_type": "slug", "current": "node-js-typescript-a-guide"}
```

#### In-Script Usage

```javascript
import { slugify, toSlugObject } from './lib/slugify.js';

const slug = slugify('My Blog Post Title');       // "my-blog-post-title"
const slugField = toSlugObject('My Blog Post Title'); // {"_type": "slug", "current": "my-blog-post-title"}
```

#### Slugify Rules

1. Lowercase
2. Spaces → hyphens
3. Periods → hyphens (periods are reserved in Sanity IDs for draft status)
4. Remove all characters except `a-z`, `0-9`, `-`
5. Collapse consecutive hyphens
6. Trim leading/trailing hyphens
7. Max length: 200 characters

## Output Format

All scripts output JSON. Success to stdout, errors to stderr:

```json
{ "success": true, ... }
{ "success": false, "error": "message" }
```

## Common Workflows

### Create a Blog Post

```bash
# 1. Upload the main image
node .claude/skills/sanity-cms/scripts/upload.js --file /path/to/hero.jpg --type image
# Note the assetId from output

# 2. Find author and category IDs
node .claude/skills/sanity-cms/scripts/query.js --query '*[_type == "author"][0]{_id, name}'
node .claude/skills/sanity-cms/scripts/query.js --query '*[_type == "category" && slug.current == "programming"][0]{_id}'

# 3. Create the post (write large payload to file first)
node .claude/skills/sanity-cms/scripts/mutate.js --action create --file /tmp/new-post.json
```

### Add a Reading List Item

```bash
# 1. Generate slug from title
SLUG=$(node .claude/skills/sanity-cms/scripts/lib/slugify.js "Article Title")

# 2. Find or create category IDs
node .claude/skills/sanity-cms/scripts/query.js \
  --query '*[_type == "category" && title in ["Programming", "Research & Understanding"]]{_id, title}'

# 3. Create the reading list item
node .claude/skills/sanity-cms/scripts/mutate.js --action create --data '{
  "_type": "readingList",
  "title": "Article Title",
  "slug": {"_type": "slug", "current": "'"$SLUG"'"},
  "originalUrl": "https://example.com/article",
  "savedAt": "2026-02-26T00:00:00Z",
  "categories": [
    {"_type": "reference", "_ref": "category-id-1"},
    {"_type": "reference", "_ref": "category-id-2"}
  ],
  "gist": "One sentence summary",
  "shortSummary": "Three sentence summary here."
}'
```

### Update an Existing Document

```bash
# Set fields
node .claude/skills/sanity-cms/scripts/mutate.js --action patch --id "doc-id" \
  --set '{"description": "Updated description"}'

# Remove fields
node .claude/skills/sanity-cms/scripts/mutate.js --action patch --id "doc-id" \
  --unset '["intro"]'
```

## Document Types

Five document types: `post`, `readingList`, `category`, `thing`, `author`.

For full field definitions, Portable Text construction examples, GROQ patterns, and reference/slug/image formats, see [references/schema.md](references/schema.md).

## Key Conventions

- **Slugs**: `{"_type": "slug", "current": "kebab-case-value"}` — always generate with `slugify.js`, never hand-write
- **References**: `{"_type": "reference", "_ref": "document-id"}`
- **Array items**: Must have `_key` (auto-generated by mutate.js if missing)
- **Images**: Upload first with upload.js, then use the returned `ref` in the image field's `asset` property
- **Document IDs**: Limited to 128 characters by Sanity. Auto-generated UUIDs (~36 chars) are always safe. When providing an explicit `_id` (e.g., for `createOrReplace`), keep it under 128 characters. `mutate.js` validates this before sending to the API.
- **Block content**: Portable Text format — see schema reference for JSON structure

## Avoiding `!` in GROQ Queries

Zsh treats `!` as history expansion, which breaks GROQ queries containing negation. **Never use `!` in inline `--query` strings.** Instead:

1. **Filtering drafts**: Use `--no-drafts` flag instead of `!(_id in path("drafts.**"))`
2. **GROQ negation**: Use `defined(x) == false` instead of `!defined(x)`
3. **Complex queries**: Use `--file` to read the query from a file, bypassing shell escaping entirely

```bash
# BAD — will break in zsh
--query '*[_type == "post" && !defined(topics)]'

# GOOD — inline-safe alternative
--query '*[_type == "post" && defined(topics) == false]' --no-drafts

# GOOD — file-based for complex queries with unavoidable !
node .claude/skills/sanity-cms/scripts/query.js --file /tmp/query.groq
```

## Limitations

- **Mux videos** cannot be uploaded via this skill. They go through the Sanity Studio Mux plugin.
- **Document ID length** — Sanity limits `_id` to 128 characters. `mutate.js` rejects IDs that exceed this limit. If you construct IDs from slugs or other dynamic values, ensure the result stays under 128 characters.
- **Transactions** are not supported. For multi-document atomic operations, compose mutations manually using the Sanity client API directly.
