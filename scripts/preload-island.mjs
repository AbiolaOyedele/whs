/**
 * Astro integration: tells the browser about the page's scripts in the HTML.
 *
 * The v2 site is one React island. Astro loads an island with a dynamic
 * import, so the browser only learns the script's address after the page has
 * parsed, then learns about that script's own imports after it arrives, and
 * so on: three round trips one after another before the page can open.
 *
 * After the build this adds a <link rel="modulepreload"> for the island, its
 * renderer and everything they import statically, so all of them download
 * together and alongside the stylesheet. Scripts loaded on demand with
 * import() are left alone.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ISLAND_URL = /\b(?:component-url|renderer-url|before-hydration-url)="([^"]+\.js)"/g
// `import x from "./a.js"` and `import "./a.js"`, never the on-demand `import("./a.js")`.
const STATIC_IMPORT = /(?:^|[;}\s])import\s*(?:[\w$*{},\s]+from\s*)?["'](\.{1,2}\/[^"']+\.js)["']/g

async function htmlFiles(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath, entry.name))
}

/** @returns {import('astro').AstroIntegration} */
export default function preloadIsland() {
  return {
    name: 'preload-island',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir)
        /** @type {Map<string, string[]>} URL of a script to the URLs it imports statically. */
        const importsOf = new Map()

        const imports = async (url) => {
          const known = importsOf.get(url)
          if (known) return known
          let source = ''
          try {
            source = await readFile(path.join(root, url), 'utf8')
          } catch {
            // Not a file in this build (an absolute or external address): nothing to follow.
          }
          const found = [...source.matchAll(STATIC_IMPORT)].map((match) =>
            path.posix.join(path.posix.dirname(url), match[1] ?? '')
          )
          importsOf.set(url, found)
          return found
        }

        /** The script and everything it pulls in, in the order the browser will want them. */
        const closure = async (entries) => {
          const seen = new Set()
          const queue = [...entries]
          while (queue.length > 0) {
            const url = queue.shift()
            if (!url || seen.has(url)) continue
            seen.add(url)
            queue.push(...(await imports(url)))
          }
          return [...seen]
        }

        let pages = 0
        for (const file of await htmlFiles(root)) {
          const html = await readFile(file, 'utf8')
          const entries = [...new Set([...html.matchAll(ISLAND_URL)].map((match) => match[1] ?? ''))]
          if (entries.length === 0 || !html.includes('</head>')) continue

          const links = (await closure(entries))
            .filter((url) => !html.includes(`rel="modulepreload" href="${url}"`))
            .map((url) => `<link rel="modulepreload" href="${url}">`)
            .join('')
          if (!links) continue

          await writeFile(file, html.replace('</head>', `${links}</head>`))
          pages += 1
        }
        logger.info(`script preloads added to ${pages} page(s)`)
      },
    },
  }
}
