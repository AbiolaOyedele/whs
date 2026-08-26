/**
 * The agent-inquiry block format.
 *
 * An AI agent following `/agent/prompt.md` drafts a project brief with the
 * visitor, then hands them a markdown block. Pasting that block anywhere on
 * the contact page fills the form in. This module owns both halves of that
 * contract — the marker and the parser — so the instructions we publish and
 * the code that reads them cannot drift apart.
 *
 * SECURITY: parsed values are only ever assigned to form field values, never
 * inserted as markup, and the server revalidates every field on submit. This
 * parser is a convenience, not a trust boundary.
 */

/** Present on the block's first line. Cheap test before parsing. */
export const INQUIRY_MARKER = 'wildhands-inquiry'

export interface ParsedInquiry {
  name?: string
  email?: string
  phone?: string
  projectDetails?: string
  referralSource?: string
}

/** Caps mirror `contactSchema`, so a huge paste cannot fill the form with junk. */
const LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  projectDetails: 5_000,
  referralSource: 200,
} as const

const field = (text: string, label: string): string | undefined => {
  const match = new RegExp(`^\\*\\*${label}:\\*\\*[ \\t]*(.+)$`, 'im').exec(text)
  return match?.[1]?.trim() || undefined
}

/**
 * Parses an agent inquiry block. Returns `null` when the text is not one of
 * our blocks, so an ordinary paste falls through untouched.
 *
 * Fields the contact form has no home for — company, website, the agent's own
 * name — are appended to the brief rather than dropped, so nothing the visitor
 * approved is silently lost.
 */
export function parseInquiryBlock(text: string): ParsedInquiry | null {
  if (!text.includes(INQUIRY_MARKER)) return null

  const name = field(text, 'Name')
  const email = field(text, 'Email')
  const briefMatch = /^##\s+Brief\s*$([\s\S]*)/im.exec(text)
  const brief = briefMatch?.[1]?.trim()

  // A block with none of the three load-bearing parts is not worth acting on.
  if (!name && !email && !brief) return null

  const extras = (['Company', 'Website'] as const)
    .map((label) => {
      const value = field(text, label)
      return value ? `${label}: ${value}` : null
    })
    .filter((line): line is string => line !== null)

  const projectDetails = [brief, extras.join('\n')].filter(Boolean).join('\n\n')

  const clamp = (value: string | undefined, max: number) => value?.slice(0, max)

  const parsed: ParsedInquiry = {}
  const assign = <K extends keyof ParsedInquiry>(key: K, value: string | undefined) => {
    if (value) parsed[key] = value
  }
  assign('name', clamp(name, LIMITS.name))
  assign('email', clamp(email, LIMITS.email))
  assign('phone', clamp(field(text, 'Phone'), LIMITS.phone))
  assign('projectDetails', clamp(projectDetails || undefined, LIMITS.projectDetails))
  assign('referralSource', clamp(field(text, 'Heard about'), LIMITS.referralSource))

  return parsed
}
