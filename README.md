# Generative Learning

A personal site for curating learning resources, writing, and showcasing creative work — built around the things I'm most interested in: creative coding, agentic systems, and generative art.

## What's Here

### Resource Hubs

The heart of the site. Curated collections of the best learning resources — YouTube channels, courses, Patreon pages, Discord communities, and more — organized into browsable, filterable hubs.

- **[Creative Coding](/creative-coding/resources)** — TouchDesigner, generative visuals, shaders, audio-reactive art, projection mapping, and more
- **[Agentic Systems](/agentic-systems/resources)** — AI agents, LLM integration, prompt engineering, and developer tools

Each hub has its own set of topics, platforms, and filters. Browse by source type, skill level, pricing, or dive into specific categories like YouTube or Patreon.

Resources, creators, and organizations are all written as simple markdown files — easy to add, easy to maintain. See the [Resource Hubs deep dive](_docs/td-resources-system.md) for details.

### Blog (`/blog`)

Long-form writing with rich text, syntax-highlighted code, and embedded video.

### Reading List (`/reading`)

Articles I've saved and found valuable, with AI-generated summaries, key points, and discussion analysis. Available as an [RSS feed](/reading/feed.xml) too.

### Portfolio (`/oldthings`)

A gallery of past creative projects — images, videos, and write-ups.

### Contact (`/contact`)

A simple contact form with bot protection.

## Running Locally

```bash
pnpm install
pnpm dev
```

The dev server starts at [http://localhost:9600](http://localhost:9600).

## Useful Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server (port 9600, Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | Lint the codebase |
| `pnpm format` | Auto-format with Prettier |
| `pnpm gen` | Generate TypeScript types from Sanity schema |
| `pnpm add <name>` | Add a Shadcn/ui component |
| `pnpm export creators` | Export content data (see `--help` for options) |

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript 5** with strict mode
- **Tailwind CSS v4**
- **Sanity CMS** — blog, reading list, portfolio content
- **Velite** — markdown-based resource hubs
- **Mux** — video hosting and streaming
- **GSAP** — animations
- **Shadcn/ui** — component library

## Project Structure

```
content/                    # Markdown content for resource hubs
├── creators/               # Creator profiles
├── organizations/          # Organization profiles
└── resources/              # Learning resources

src/
├── app/                    # Pages and routes
├── components/             # React components
├── lib/                    # Utilities and data access
├── models/                 # Sanity query functions
└── sanity/                 # Sanity CMS config and schemas
```

## Further Reading

- [Resource Hubs System](_docs/td-resources-system.md) — how the markdown-based resource system works, content schemas, filtering, and how to add new content
