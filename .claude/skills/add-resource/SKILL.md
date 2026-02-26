---
name: add-resource
description: Add creators, organizations, and resources to the markdown-based content system (Resource Hubs). Use when the user asks to add, create, or edit content files in `content/creators/`, `content/organizations/`, or `content/resources/`, or when they want to add a resource, creator, or organization to a hub (creative-coding or agentic-systems).
---

# Add Resource

Add content to the Resource Hubs system. Content lives as markdown files in `content/` and is built by Velite at compile time.

## Research

Before creating files, gather the necessary information.

**For a creator:** name, aliases, bio, location, website, social links (YouTube, Patreon, Instagram, GitHub, Twitter, Discord, LinkedIn).

**For a resource:** URL, source type, pricing model, skill levels, topics, domains, and a brief description. Check [references/taxonomies.md](references/taxonomies.md) for valid enum values.

## File Naming

- Lowercase kebab-case: `simon-david-ryden.md`, `paketa12-youtube.md`
- Slug auto-generates from filename (minus `.md`)
- Slugs must be globally unique across all collections (creators, organizations, resources)

## Hub Defaults

- `hubs` defaults to `['creative-coding']` — set explicitly for other hubs (e.g., `hubs: ['agentic-systems']`)
- `platforms` defaults to `['touchdesigner']` — set explicitly for other platforms
- For agentic-systems content, always set both `hubs` and `platforms` explicitly

## Creator Template

File path: `content/creators/<slug>.md`

```yaml
---
name: Full Name                    # required
aliases:                           # optional
  - Handle
  - Other Name
bio: Short description of work.    # optional
location: City, Country            # optional
hubs:                              # optional, defaults to ['creative-coding']
  - creative-coding
website: https://example.com       # optional
socials:                           # optional
  youtube: '@handle'
  patreon: handle
  instagram: handle
  github: handle
  twitter: handle
  discord: handle
  linkedin: handle
---
Optional extended bio in markdown.
```

## Organization Template

File path: `content/organizations/<slug>.md`

```yaml
---
name: Organization Name            # required
type: company                      # required: company | platform | institution | community
description: What they do.         # optional
hubs:                              # optional, defaults to ['creative-coding']
  - creative-coding
website: https://example.com       # required
location: City, Country            # optional
---
Optional markdown body.
```

## Resource Template

File path: `content/resources/<slug>.md`

```yaml
---
title: Resource Name                # required
url: https://example.com            # required
status: active                      # required: active | inactive | archived
lastVerified: 2026-01-15            # required: ISO date (use today's date)
sourceType: youtube                 # required: youtube | patreon | blog | course | github | website | etc.
pricingModel: free                  # required: free | freemium | paid
hubs:                               # optional, defaults to ['creative-coding']
  - creative-coding
skillLevels:                        # optional
  - beginner
  - intermediate
topics:                             # optional — see references/taxonomies.md
  - particles
  - glsl
domains:                            # optional — see references/taxonomies.md
  - generative-art
platforms:                          # optional, defaults to ['touchdesigner']
  - touchdesigner
creatorSlugs:                       # optional — links to creator files by slug
  - creator-file-name
orgSlug: organization-slug          # optional — links to org file by slug
description: Brief description.     # required
featured: true                      # optional, default false
---
Optional extended notes in markdown.
```

## Workflow

1. Check if the creator/org already exists in `content/creators/` or `content/organizations/`
2. Create creator/org file first if needed (resource references them by slug)
3. Create the resource file with correct frontmatter
4. Velite rebuilds automatically in dev mode — check the hub page to verify

## Taxonomy Reference

For complete lists of valid `topics`, `domains`, `platforms`, and other enum values, see [references/taxonomies.md](references/taxonomies.md).
