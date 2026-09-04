/**
 * House style checks for copy an operator writes into a client document.
 *
 * The no-dash rule is enforced in source by review, but a quote's prose is
 * data: it is typed into the editor or drafted by a model, and it reaches the
 * client without passing a code review. A live quote shipped with "Thanks for
 * the walkthrough on Tuesday — seeing the spreadsheet in action made the shape
 * of this much clearer" as the first sentence a paying client read.
 *
 * This flags, it does not rewrite. An em dash almost always stands in for a
 * comma, a colon or a full stop, and which one it is depends on the sentence.
 * Silently guessing produces comma splices in a commercial document, so the
 * operator is told and makes the call. See design.md § 12.
 */
export interface HouseStyleIssue {
  /** Field label as the operator sees it, e.g. "Opening note". */
  field: string
  /** The offending text, trimmed to something readable in a notice. */
  excerpt: string
}

const DASH = /[—–]/

/** A short window around the first dash, so the operator can find it. */
function excerpt(value: string): string {
  const at = value.search(DASH)
  const start = Math.max(0, at - 40)
  const end = Math.min(value.length, at + 40)
  return `${start > 0 ? '…' : ''}${value.slice(start, end).trim()}${end < value.length ? '…' : ''}`
}

/**
 * Returns one issue per field whose text carries an em or en dash.
 *
 * `fields` is a label-to-text map so callers name the field the way the form
 * does, rather than by its schema path, which is not what the operator sees.
 */
export function findDashes(fields: Record<string, string | null | undefined>): HouseStyleIssue[] {
  const issues: HouseStyleIssue[] = []
  for (const [field, value] of Object.entries(fields)) {
    if (typeof value === 'string' && DASH.test(value)) {
      issues.push({ field, excerpt: excerpt(value) })
    }
  }
  return issues
}
