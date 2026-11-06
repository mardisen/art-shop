# Frontend

Next.js 16 application for browsing, creating, and managing art workshops and institutes. It uses the App Router, React 19, Tailwind CSS 4, and Leaflet for maps.

## Prerequisites

- Node.js 24+ and npm (the Docker image uses Node `24.14.0`)
- The API Gateway (or another backend endpoint) running and reachable

## Installation

```bash
npm ci
```

This installs the exact dependency versions from `package-lock.json`.

## Configuration

Create or edit `.env` and set the backend URL:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The variable is read at build time. If it is not set, the code falls back to `http://localhost:8000`. Rebuild the application after changing it.

## Run in development

```bash
npm run dev
```

Open http://localhost:3000. The dev server reloads automatically when files change.

The frontend expects the gateway to be available at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

## Build and run in production

```bash
npm run build
npm run start
```

The production server also listens on port `3000`.

## Linting

```bash
npm run lint
```

## Run with Docker

From this directory:

```bash
docker build -t artshop/frontend .
docker run --rm -p 3000:3000 artshop/frontend
```

Then open http://localhost:3000. The image runs the Next.js standalone server on port `3000` as the non-root `node` user.

The Docker build ignores local `.env` files; the image uses the default API URL unless `NEXT_PUBLIC_API_URL` is added to the build in the `Dockerfile`.

## Main routes

| Route | Page |
| --- | --- |
| `/` | Workshop search and map |
| `/login`, `/register` | Authentication |
| `/workshops` | Workshop list |
| `/workshops/create` | Create a workshop |
| `/workshops/[id]` | Workshop details |
| `/workshops/[id]/edit` | Edit a workshop |
| `/workshops/mine` | Workshops created by the current user |
| `/institutes/[id]` | Institute details |
| `/institutes/create` | Create an institute |
| `/institutes/[id]/edit` | Edit an institute |
| `/bookmarks` | Current user's bookmarks |
| `/profile/edit` | Edit the current profile |

## Project layout

- `app/` — routes, layouts, and pages
- `components/` — shared UI components
- `lib/auth.ts` — token handling and API fetch helpers
- `lib/models.ts` — shared TypeScript models
- `lib/providers.tsx` — token and user contexts
- `public/` — static assets
