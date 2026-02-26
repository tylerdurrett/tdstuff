# Working With This Repo

## Project Overview

This is a Next.js 16 application using the App Router pattern with TypeScript and Tailwind CSS v4.

## Architecture

### Tech Stack

- **Next.js 16** with App Router and Turbopack
- **React 19**
- **TypeScript 5** with strict mode enabled
- **Tailwind CSS v4** with PostCSS
- **Sanity CMS** for content management
- **Velite** for markdown-based content (TD Resources)
- **Shadcn/ui** for component library
- **ESLint 9** with Next.js configuration and Prettier integration
- **Prettier** for code formatting (auto-format on save in VS Code)

### Project Structure

- `/src/app/` - App Router pages and layouts
- `/content/` - Markdown content for TD Resources (creators, organizations, resources)
- TypeScript path aliases: `@/*` maps to `./src/*`, `#content` maps to `./.velite`
- Tailwind CSS uses the new v4 inline theme approach with CSS custom properties

### UI Components

- Use Shadcn components for standard UI components, located in src/components/ui
- Common UI components live in `/src/components/ui/` and you import them with `@/components/ui/...`
- This site may be in light or dark mode, so always use semantic coloring that is compatible with both color modes.
- To add a component, use `pnpm add <component-name>` to add the component
- It's preferred to use Tailwind classes over inline styles or external CSS. If you do need to create custom external CSS rules, add them to a file co-located with the component or page and import it.

## Sanity CMS

- The site uses Sanity CMS to bring in some of the content.
- Sanity settings are in `sanity.config.ts` and `src/sanity/`
- Sanity types are generated with `pnpm gen` and land in `sanity.types.ts`
- Fetch functions are in `src/models/*`

## Resource Hubs (Velite)

A markdown-based content system for curating learning resources, organized into hubs.

- Content lives in `/content/` directory (creators, organizations, resources)
- Schema defined in `velite.config.ts`
- Hub configuration in `src/lib/hubs/config.ts`
- Data access layer in `src/lib/td-resources/`
- UI components in `src/components/td-resources/`
- Pages at `/[hub]/resources` (e.g., `/creative-coding/resources`, `/agentic-systems/resources`)

See [\_docs/td-resources-system.md](_docs/td-resources-system.md) for full documentation.

## Video (Mux)

- Videos are hosted on **Mux** and played with `@mux/mux-player-react`
- Video components live in `src/components/video/`
- The `src/features/video-feed/` module maps Sanity video data to a consistent format

## Animations (GSAP)

- Uses a custom `data-animate` attribute system (e.g., `data-animate="fadeUp"`)
- Animation definitions live in `src/lib/gsap/animations/`
- Server components use `AnimationsInit`; client components use the `useAnimations` hook

## Important Reminders

- Don't run the dev server - it's already running.
- Don't use `any` types. They'll get flagged by the linter and you'll have to fix them.
- Always ask the user before making changes to which packages are installed.
- You have outdated knowledge of the libraries used in this project. Always reference the current documenation before making changes.
- You must always look up the correct types before implementing code. Your knowledge is incomplete and outdated. Look up the correct types. Solve the root of the problem, do NOT create workarounds or bypass the error.
- Before you're done, make sure there aren't any type errors. If there are, fix the root cause.
