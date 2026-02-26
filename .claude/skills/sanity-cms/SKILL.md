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
cd .claude/skills/sanity-cms/scripts && npm install
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
```

**Args:** `--query` (required), `--params` (optional JSON)

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
# 1. Find or create category IDs
node .claude/skills/sanity-cms/scripts/query.js \
  --query '*[_type == "category" && title in ["Programming", "Research & Understanding"]]{_id, title}'

# 2. Create the reading list item
node .claude/skills/sanity-cms/scripts/mutate.js --action create --data '{
  "_type": "readingList",
  "title": "Article Title",
  "slug": {"_type": "slug", "current": "article-title"},
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

- **Slugs**: `{"_type": "slug", "current": "kebab-case-value"}`
- **References**: `{"_type": "reference", "_ref": "document-id"}`
- **Array items**: Must have `_key` (auto-generated by mutate.js if missing)
- **Images**: Upload first with upload.js, then use the returned `ref` in the image field's `asset` property
- **Block content**: Portable Text format — see schema reference for JSON structure

## Limitations

- **Mux videos** cannot be uploaded via this skill. They go through the Sanity Studio Mux plugin.
- **Transactions** are not supported. For multi-document atomic operations, compose mutations manually using the Sanity client API directly.
