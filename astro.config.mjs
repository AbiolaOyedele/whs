// @ts-check
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'

// Astro does not load .env into the config context automatically, so hydrate
// process.env here BEFORE importing the validated env module. This file is
// build tooling; every file under src/ imports from src/config/env.ts instead.
Object.assign(process.env, loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), ''))

const { publicEnv } = await import('./src/config/env.ts')

/**
 * Hybrid rendering: every page is prerendered to static HTML by default.
 * API routes under src/pages/api/v1/ opt into SSR with `export const prerender = false`.
 */
export default defineConfig({
  site: publicEnv.PUBLIC_SITE_URL,
  output: 'static',
  adapter: vercel(),
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/tools/ai-ascii-art-generator'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
