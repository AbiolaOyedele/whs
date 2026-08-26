// TODO (Step 6): Zod-validated schemas for the five content collections
// (services, work, stack, insights, industries).
//
// NOTE — DEVIATION FROM SPEC, FLAGGED IN docs/PROGRESS.md:
// The brief specifies `src/content/config.ts`. Astro 7 treats that path as the
// LEGACY collections location and errors on it. `src/content.config.ts` is the
// required modern location. Content files still live under src/content/<collection>/.
import { defineCollection } from 'astro:content'

export const collections: Record<string, ReturnType<typeof defineCollection>> = {}
