# Resource Hubs

A markdown-based system for curating learning resources, organized into topic-specific hubs. Each hub is a filterable, browsable collection of resources, creators, and organizations.

## Current Hubs

| Hub | URL | Focus |
| --- | --- | --- |
| **Creative Coding** | `/creative-coding/resources` | TouchDesigner, generative visuals, shaders, audio-reactive art, projection mapping |
| **Agentic Systems** | `/agentic-systems/resources` | AI agents, LLM integration, prompt engineering, developer tools |

Each hub has its own tabs, topics, domains, and platforms — defined in `src/lib/hubs/config.ts`.

## How It Works

All content lives as markdown files in the `content/` directory. [Velite](https://velite.js.org/) validates and builds them at compile time, producing typed data that the site consumes.

```
content/
├── creators/          # People who create content
├── organizations/     # Companies, communities, platforms, institutions
└── resources/         # The learning resources themselves

velite.config.ts       # Schema definitions & validation rules
.velite/               # Generated output (gitignored, rebuilt automatically)
```

## Content Types

### Resources

The core content. Each resource is a markdown file describing a learning resource — a YouTube channel, a course, a Patreon, a Discord community, etc.

```yaml
# content/resources/elekktronaut-youtube.md
---
title: Elekktronaut YouTube Channel
url: https://www.youtube.com/@elekktronaut
status: active           # active | inactive | archived
lastVerified: 2026-01-15 # date you last checked this resource
sourceType: youtube      # youtube | patreon | blog | course | github | aggregator | forum | discord | reddit | website | social
pricingModel: freemium   # free | freemium | paid
skillLevels:
  - beginner
  - intermediate
topics:
  - audio-reactive
  - feedback-loops
domains:
  - generative-art
platforms:               # defaults to [touchdesigner] — set explicitly for other platforms
  - touchdesigner
creatorSlugs:
  - bileam-tschepe
description: Design-focused TouchDesigner tutorials.
featured: true
---
Optional markdown body with additional notes.
```

**Defaults:** `hubs` defaults to `['creative-coding']` and `platforms` defaults to `['touchdesigner']`. Set these explicitly when adding resources for other hubs or platforms (e.g., `hubs: ['agentic-systems']`, `platforms: ['langchain']`).

### Creators

People who produce content. Linked to resources via `creatorSlugs`.

```yaml
# content/creators/bileam-tschepe.md
---
name: Bileam Tschepe
aliases:
  - Elekktronaut
bio: Berlin-based artist and educator.
location: Berlin, Germany
website: https://elekktronaut.com
socials:
  youtube: '@elekktronaut'
  patreon: elekktronaut
---
Optional extended bio.
```

### Organizations

Companies, platforms, institutions, or communities.

```yaml
# content/organizations/derivative.md
---
name: Derivative
type: company            # company | platform | institution | community
description: Creator of TouchDesigner software.
website: https://derivative.ca
location: Toronto, Canada
---
Optional markdown body.
```

## Relationships

Resources reference creators and organizations by slug:

- `creatorSlugs: string[]` — links to creator files (many-to-many)
- `orgSlug: string` — links to an organization file (many-to-one)

These are resolved at runtime by the data access layer using fast O(1) lookups.

## Hubs

Each resource can belong to one or more hubs via the `hubs` field. Hubs control what's visible on each hub page and scope the available filters (topics, domains, platforms) to what's relevant.

Hub configuration lives in `src/lib/hubs/config.ts` and defines:

- **Tabs** — the navigation tabs for each hub (e.g., All, Creators, YouTube, Patreon, Websites)
- **Topics, Domains, Platforms** — which taxonomy values are relevant for this hub's filters
- **Base path** — the URL prefix for the hub

## Taxonomies

All taxonomy values are predefined enums, validated at build time:

| Field | Values |
| --- | --- |
| `skillLevels` | beginner, intermediate, advanced |
| `sourceType` | youtube, patreon, blog, course, github, aggregator, forum, discord, reddit, website, social |
| `pricingModel` | free, freemium, paid |
| `status` | active, inactive, archived |
| `topics` | 28 values — fundamentals, python, glsl, audio-reactive, llm-integration, prompt-engineering, etc. |
| `domains` | 15 values — generative-art, vj-performance, ai-ml, developer-tools, automation, etc. |
| `platforms` | 14 values — touchdesigner, processing, p5js, langchain, claude-code, cursor, etc. |

Full lists in `src/lib/td-resources/schemas.ts`.

## Filtering

The UI supports multi-select filtering:

- **Search** — matches title and description (case-insensitive)
- **Source type, Pricing, Status** — OR within each category
- **Skill levels, Topics, Domains** — OR within each (resource must have any selected value)
- Categories combine with **AND** logic (e.g., "YouTube" + "beginner" = YouTube resources at beginner level)

Default filter: `status: ['active']` (hides inactive and archived resources).

## Slugs

- Auto-generated from the filename (e.g., `bileam-tschepe.md` → `bileam-tschepe`)
- Can be overridden with an explicit `slug` field
- Must be globally unique across all collections (build fails on duplicates)

## Adding Content

1. Create a markdown file in the appropriate `content/` subdirectory
2. Fill in the required frontmatter fields (see examples above)
3. Save — Velite rebuilds automatically in dev mode
4. Check the resource hub page to verify it shows up

**Adding a new resource with a new creator:**

```bash
# 1. Create the creator file
# content/creators/jane-doe.md

# 2. Create the resource file
# content/resources/jane-doe-youtube.md
# (reference the creator with creatorSlugs: [jane-doe])
```

## Build & Export

```bash
pnpm dev              # Velite watches content/ and rebuilds on changes
pnpm build            # Full production build (includes Velite)
pnpm content:build    # Manual Velite build
pnpm content:watch    # Manual Velite watch mode
```

Export content to stdout:

```bash
pnpm export creators                              # Names, one per line
pnpm export creators -- --json                    # JSON array
pnpm export resources -- --full --resolve --json  # Full objects with resolved relationships
pnpm export creators > creators.txt               # Save to file
```

Run `pnpm export` for all options.

## Architecture (for developers)

```
src/lib/td-resources/             # Data access layer
├── types.ts                      # TypeScript types
├── schemas.ts                    # Taxonomy constants & labels
├── data.ts                       # Query and filter functions
├── hooks.ts                      # useResourceFilters hook
└── index.ts                      # Barrel export

src/lib/hubs/                     # Hub configuration
├── config.ts                     # Hub definitions (tabs, topics, platforms)
└── index.ts                      # Exports

src/app/(with-nav)/[hub]/resources/
├── (tabs)/                       # Tab-based navigation
│   ├── page.tsx                  # Hub resources index (filterable table)
│   ├── creators/                 # Creators list and detail pages
│   ├── youtube/                  # YouTube resources
│   ├── patreon/                  # Patreon resources
│   ├── websites/                 # Blogs, courses, aggregators
│   ├── discords/                 # Discord servers
│   └── reddits/                  # Reddit communities
└── [slug]/page.tsx               # Resource detail page

src/components/td-resources/      # UI components
├── ResourcesFilteredView.tsx     # Filter state management
├── ResourcesFilters.tsx          # Filter controls
├── ResourcesTable.tsx            # TanStack Table
├── ResourcesTabNav.tsx           # Tab navigation
├── columns.tsx                   # Column definitions
├── MultiSelect.tsx               # Reusable filter dropdown
├── ResourceDetail.tsx            # Resource detail page layout
├── CreatorDetail.tsx             # Creator detail page
├── CreatorCard.tsx               # Creator card component
└── CreatorsGrid.tsx              # Creator grid view
```

## Related Files

- Velite config: [velite.config.ts](../velite.config.ts)
- Hub config: [src/lib/hubs/config.ts](../src/lib/hubs/config.ts)
- Data layer: [src/lib/td-resources/](../src/lib/td-resources/)
- Components: [src/components/td-resources/](../src/components/td-resources/)
