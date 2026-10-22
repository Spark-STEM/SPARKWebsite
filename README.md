# SPARK Website

> A fully student-led and run volunteering organization with the mission to bring STEM education to everyone. We are a group of passionate and dedicated high school students who cooperate with local elementary schools to start afterschool clubs and teach STEM-related topics.

This repository is the official repository for the SPARK Website, built with
**SvelteKit**, **Svelte 5**, **TypeScript**, and **Cloudflare Pages**.

[Website (Cloudflare Pages)](https://spark-stem.pages.dev)

## Development

### Prerequisites

- Node.js (v18+)
- npm

### Quick Start

```bash
# Install dependencies
npm install

# Start local dev server with HMR
npm run dev

# Run TypeScript & Svelte type checking
npm run check

# Build static production site
npm run build

# Preview static build locally
npm run preview
```

## Cloudflare Pages and D1

The Cloudflare Pages project is `spark-stem`. Configure its build command as
`npm run build` and its output directory as `build/`. The D1 binding is declared
in `wrangler.jsonc`.

The tracked D1 schema is in `migrations/0001_initial.sql`. Apply it with
`npx wrangler d1 migrations apply spark_org_data --remote` when preparing the
Cloudflare database. The existing production database already contains the
directory fields and school coordinates.

Cloudflare Pages discovers Functions from the repository-root `functions/`
directory. The `/api/directory` and `/api/directory/:type/:slug` Functions read
chapters, schools, members, roles, programs, schedules, and map coordinates from
D1. They only allow browser requests from the production Pages site and the
configured localhost development ports. This Origin check restricts browser
cross-origin access; it is not authentication for public directory data.

Deploy with the Cloudflare Pages Git integration or run
`npx wrangler pages deploy build` from the repository root after building.
Deploying only the `build/` directory with a tool that omits `functions/` will
not publish the API or dynamic detail routes.

For local UI development, run `npm run dev` and open `http://localhost:5173`.
When a Pages dev server is available at `http://127.0.0.1:8788`, the Vite app
uses its local Functions API; otherwise, it falls back to the deployed API.
To test the Functions locally, run `npm run build`, then
`npx wrangler pages dev build`. The `DB` binding is configured as a remote
binding, so these local Functions query the existing Cloudflare D1 database;
avoid adding or invoking writes while testing.

## Contribution

Contributions are welcome! Please follow our [Contribution Guidelines](CONTRIBUTION.md).
