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
      // The admin group is validated separately and lazily, but the quote PIN
      // and session helpers read the pepper, so the suite needs one.
      SUPABASE_URL: 'https://project.supabase.test',
      SUPABASE_ANON_KEY: 'anon-test-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-key',
      ADMIN_ALLOWED_EMAILS: 'owner+whs@wildhands.test, second@wildhands.test',
      QUOTE_PIN_PEPPER: 'test-pepper-at-least-sixteen-chars',
      // A fixed fake, so the signature tests do not depend on a real key.
      PAYSTACK_SECRET_KEY: 'sk_test_fixture_key_for_signature_tests',
    },
  },
})
