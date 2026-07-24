# The Reset

A personal, phone-first habit app. Three daily taps; a dozen systems react.

See `PROJECT_BRIEF.md` for the feature spec and `.windsurfrules` for stack conventions.

## Stack

Vite 8 · React 19 · TypeScript (strict) · Tailwind CSS v4 (`@tailwindcss/vite`) · Zustand · `motion` · lucide-react · canvas-confetti · Vitest

## Local development

```bash
npm install
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest in watch mode |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages.

Live at **https://aaronkhah92.github.io/the-reset/**

One-time repo setting: **Settings → Pages → Source → GitHub Actions**.

`vite.config.ts` sets `base: '/the-reset/'`. If the repo is ever renamed, that value must change to match or every asset 404s.
