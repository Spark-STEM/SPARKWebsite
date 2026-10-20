# SPARK Website

> A fully student-led and run volunteering organization with the mission to bring STEM education to everyone. We are a group of passionate and dedicated high school students who cooperate with local elementary schools to start afterschool clubs and teach STEM-related topics.

This repository is the official repository for the SPARK Website, built with **SvelteKit**, **Svelte 5**, **TypeScript**, and **Firebase Hosting**.

[Website (Firebase Live Deploy)](https://spark-stem.web.app)

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

## Cloudflare Pages CI/CD

The `.github/workflows/cloudflare-pages.yml` workflow runs `npm ci`,
`npm run check`, and `npm run build` for pull requests targeting `main` and
pushes to `main`. After successful checks, pushes to the official
`Spark-STEM/SPARKWebsite` repository's `main` branch deploy the `build/`
directory to the Cloudflare Pages project `spark-stem`.

Configure these repository secrets in GitHub under **Settings → Secrets and
variables → Actions**:

- `CLOUDFLARE_ACCOUNT_ID`: the account hosting `spark-stem`.
- `CLOUDFLARE_API_TOKEN`: a token with **Account → Cloudflare Pages → Edit**
  permission for that account.

To deploy manually, open **Actions → Cloudflare Pages → Run workflow** and
select `main`. Pull requests run checks and builds without deploying.
Production is available at https://spark-stem.pages.dev.

The existing Firebase workflows remain active and deploy independently.

## Contribution

Contributions are welcome! Please follow our [Contribution Guidelines](CONTRIBUTION.md).
