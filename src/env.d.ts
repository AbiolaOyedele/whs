/// <reference types="astro/client" />

import type { AdminSession } from '@/lib/admin/auth'

declare global {
  namespace App {
    interface Locals {
      /** Set by src/middleware.ts for every /admin request. */
      adminSession: AdminSession | null
    }
  }
}

export {}
