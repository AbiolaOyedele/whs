import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // src/config/env.ts validates on import, so tests need a valid env.
    env: {
      PUBLIC_SITE_URL: 'https://wildhands.test',
      RESEND_API_KEY: 're_test_key',
      CONTACT_NOTIFICATION_EMAIL: 'test@wildhands.test',
    },
  },
})
