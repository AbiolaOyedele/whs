import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const client = createClient(url, key, {
  db: { schema: 'rayo' },
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data, error } = await client.from('quote_payments').select('status')
if (error) console.log('ERROR', error.message)
else console.log('distinct statuses:', [...new Set(data.map((r) => r.status))])

const { data: d2, error: e2 } = await client.from('credit_entries').select('delta').limit(5)
if (e2) console.log('credit_entries ERROR', e2.message)
else console.log('credit_entries.delta sample types ok, count:', d2.length)
