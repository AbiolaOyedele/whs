/**
 * Keeps the last word of a heading or paragraph from sitting alone on its
 * line, by joining it to the word before with a non-breaking space.
 *
 * The base styles already ask for `text-wrap: balance` on headings and
 * `text-wrap: pretty` on body copy, but browsers treat both as hints: a
 * balanced heading in a narrow column, or a paragraph past the lines `pretty`
 * looks at, can still end on one word. This makes the rule hold everywhere.
 *
 * It only ever swaps one ordinary space for a non-breaking one, so the text
 * reads the same to screen readers and search engines.
 */

const SELECTOR = 'h1, h2, h3, h4, h5, h6, p, li, dd, dt, blockquote, figcaption, [class*="text-heading-"]'
/** Never touched: code, form controls and anything the visitor types into. */
const SKIP = 'pre, code, textarea, input, select, [contenteditable="true"]'
/** Fewer words than this is a label or a short title, and has no orphan to fix. */
const MIN_WORDS = 4
/**
 * Two long words glued together can be wider than a phone screen. Past this
 * many characters the pair is left to break normally.
 */
const MAX_PAIR_LENGTH = 22
const NBSP = ' '

function textNodesOf(element: Element): Text[] {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text)
  return nodes
}

/** Joins the last two words of one element, when it is safe to. */
function glueLastWords(element: Element): void {
  const text = element.textContent?.trim() ?? ''
  const words = text.split(/\s+/)
  if (words.length < MIN_WORDS) return
  const pair = words.slice(-2).join(' ')
  if (pair.length > MAX_PAIR_LENGTH) return

  // Walk backwards to the last breaking space that has a word after it.
  const nodes = textNodesOf(element)
  let seenWord = false
  for (let n = nodes.length - 1; n >= 0; n--) {
    const node = nodes[n]
    if (!node) continue
    const value = node.data
    for (let i = value.length - 1; i >= 0; i--) {
      const char = value[i] ?? ''
      if (char === NBSP) return
      if (/\s/.test(char)) {
        if (!seenWord) continue
        node.data = value.slice(0, i) + NBSP + value.slice(i + 1)
        return
      }
      seenWord = true
    }
  }
}

/**
 * The same rule for a title split into one box per word (SplitTitle). A
 * non-breaking space does not help there: the browser may break between
 * the boxes whatever sits between them. The last two boxes are wrapped in a
 * span that does not wrap instead.
 */
export function keepLastWordsTogether(words: readonly Element[]): void {
  if (words.length < MIN_WORDS) return
  const before = words[words.length - 2]
  const last = words[words.length - 1]
  if (!before || !last || before.parentNode !== last.parentNode) return
  if (`${before.textContent} ${last.textContent}`.length > MAX_PAIR_LENGTH) return

  const pair = document.createElement('span')
  pair.style.whiteSpace = 'nowrap'
  before.before(pair)
  // Everything from the first word to the last moves in, the space between them included.
  let node: ChildNode | null = before
  while (node) {
    const next: ChildNode | null = node === last ? null : node.nextSibling
    pair.append(node)
    node = next
  }
}

/** Applies the rule to every heading and block of body copy inside `root`. */
export function preventOrphans(root: ParentNode = document): void {
  root.querySelectorAll(SELECTOR).forEach((element) => {
    // Only the innermost text blocks: a list item holding paragraphs is
    // handled through its paragraphs.
    if (element.closest(SKIP) || element.querySelector('p, li, h1, h2, h3, h4, h5, h6, div')) return
    glueLastWords(element)
  })
}
