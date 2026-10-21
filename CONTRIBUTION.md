## Setup

The project is built with **SvelteKit** and **Svelte 5** in static generation mode (`@sveltejs/adapter-static`), generating production files into `build/` for Cloudflare Pages.

### Quick Start

```bash
npm install
npm run dev
```

Run type checks and validation:

```bash
npm run check
npm run build
```

## Architecture & Code Guidelines

### Svelte & TypeScript

- Components are located in `src/lib/components/` and use **Svelte 5 runes** (`$state`, `$derived`, `$props`, `$effect`).
- Pages and routes are organized using SvelteKit directory-based routing under `src/routes/`.
- Static data sets such as statistics and testimonials are centralized under `src/lib/data/` and typed in `src/lib/types/`.
- Chapter and school directory data is loaded from Cloudflare D1 through Pages Functions in `functions/`; do not add static directory records.

### Scoped CSS & Styling

- Prefer scoped `<style>` blocks in Svelte components.
- Shared design tokens and global resets live in `src/lib/styles/global.css`.
- **CSS rules should utilize nested structure** whenever applicable for clarity and readability:

```css
.card {
  background: var(--color-surface);

  .title {
    font-size: 1.25rem;
  }
}
```

### Static Assets

- Static assets (images, icons) belong in `static/assets/`.
- Standalone sub-apps such as the Scratch 3.0 GUI (`Xcratch`) reside in `static/Xcratch/`.

## Merging

- Ensure `npm run check` and `npm run build` pass with zero errors.
- Include a screenshot or recording demonstrating visual changes in pull requests when updating frontend interfaces.
