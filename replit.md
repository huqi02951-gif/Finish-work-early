# Research Visualization / AI Studio App

## Overview

A business productivity platform for banking professionals (primarily in financial services, Chinese market). It provides a library of "Skills" — automated tools, calculation aids, and AI-assisted workflows — to help professionals finish work faster.

## Architecture

- **Type:** React SPA (Single Page Application), frontend-only
- **Framework:** React 19 + Vite 6 + TypeScript
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **AI:** Google Gemini API (`@google/genai`)
- **3D/Graphics:** Three.js + @react-three/fiber + @react-three/drei
- **Animations:** Framer Motion

## Project Structure

```
/                       # Root - flat component files
├── index.html          # HTML template
├── vite.config.ts      # Vite config (port 5000, host 0.0.0.0, allowedHosts: true)
├── components/         # Core functional views
│   └── tools/          # Tool components (BusinessGuide, AcceptanceCalculator, etc.)
├── constants/          # Static data (skills.ts)
├── data/               # Structured data (checklistData.ts)
├── lib/                # Utility functions (utils.ts)
├── skills/             # Markdown skill definitions
├── src/
│   ├── App.tsx         # Main router
│   ├── main.tsx        # React entry point
│   ├── components/     # Layout components (AppLayout)
│   ├── pages/          # Higher-level pages (Home, Feed, Profile)
│   ├── services/       # API abstraction layer (mock data)
│   ├── styles/         # Global styles
│   ├── mock/           # Mock data for users/posts/notifications
│   └── types/          # TypeScript interfaces
└── types.ts            # Shared type definitions
```

## Running the App

```bash
npm run dev    # Development server on port 5000
npm run build  # Production build to dist/
```

## Environment Variables

- `GEMINI_API_KEY` - Google Gemini API key for AI features (optional, AI features disabled without it)

## Deployment

Configured as a **static site**:
- Build command: `npm run build`
- Public directory: `dist`
- Production base path: `/Finish-work-early/`
- Router mode: `HashRouter` for GitHub Pages compatibility

## Notes

- The `BusinessGuide.tsx` file had corrupted source data (from GitHub import) that was repaired during setup. Three corrupted string literals were fixed to restore syntactic validity.
- The app uses mock data for most features. The `src/services/api.ts` layer is prepared for future backend integration.
- Vite is configured with `allowedHosts: true` for Replit proxy compatibility.
