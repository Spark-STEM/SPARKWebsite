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

Run `npm run dev` and open `http://127.0.0.1:5173` for Vite HMR. The command
builds the static site once, then starts Vite and `wrangler pages dev` together.
Contact-form requests are proxied to the local Pages Functions runtime at
`http://127.0.0.1:8788`. The `DB` binding is remote, so local Functions use the
existing Cloudflare D1 database; avoid adding or invoking writes while testing.

The contact form calls the same-origin Pages Function, which validates
Turnstile before forwarding a ticket request to the Worker. Its public site key,
Worker URL, opener ID, and production hostname are configured in
`wrangler.jsonc`; never put either secret there. For local `npm run dev`,
`.dev.vars` must contain `TURNSTILE_SECRET_KEY`, `TICKET_API_SECRET`, and
`TURNSTILE_HOSTNAMES=localhost,127.0.0.1`. The Turnstile widget must allow the
local hostname, and its hostname/action checks are enforced server-side.

Cloudflare Pages secrets are set for project `spark-stem`. The matching
`TICKET_API_SECRET` must also be set on the ticket Worker. The Worker enforces
its own rate limits; the Pages-side challenge is not a replacement for them.

## Contribution

Contributions are welcome! Please follow our [Contribution Guidelines](CONTRIBUTION.md).
