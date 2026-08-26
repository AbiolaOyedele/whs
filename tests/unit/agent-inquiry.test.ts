import { describe, expect, it } from 'vitest'
import { INQUIRY_MARKER, parseInquiryBlock } from '@/lib/agent-inquiry'

const block = `<!-- ${INQUIRY_MARKER} v1 -->

**Name:** Ada Iwu
**Email:** ada@company.com
**Company:** Northsight
**Phone:** +234 800 000 0000
**Website:** https://company.com
**Heard about:** A recommendation

## Brief

We rebuild the same weekly report by hand every Monday. We want it to build itself.`

describe('parseInquiryBlock', () => {
  it('pulls every field out of a complete block', () => {
    const parsed = parseInquiryBlock(block)
    expect(parsed).not.toBeNull()
    expect(parsed?.name).toBe('Ada Iwu')
    expect(parsed?.email).toBe('ada@company.com')
    expect(parsed?.phone).toBe('+234 800 000 0000')
    expect(parsed?.referralSource).toBe('A recommendation')
    expect(parsed?.projectDetails).toContain('rebuild the same weekly report')
  })

  it('keeps fields the form has no home for, rather than dropping them', () => {
    const parsed = parseInquiryBlock(block)
    expect(parsed?.projectDetails).toContain('Company: Northsight')
    expect(parsed?.projectDetails).toContain('Website: https://company.com')
  })

  it('ignores ordinary pasted text', () => {
    expect(parseInquiryBlock('just some copied prose')).toBeNull()
    expect(parseInquiryBlock('')).toBeNull()
  })

  it('ignores a marker with none of the load-bearing parts', () => {
    expect(parseInquiryBlock(`<!-- ${INQUIRY_MARKER} v1 -->\n\n**Phone:** 123`)).toBeNull()
  })

  it('works when the optional lines are absent', () => {
    const minimal = `<!-- ${INQUIRY_MARKER} v1 -->

**Name:** Sam Doe
**Email:** sam@example.com

## Brief

Short brief.`
    const parsed = parseInquiryBlock(minimal)
    expect(parsed?.phone).toBeUndefined()
    expect(parsed?.referralSource).toBeUndefined()
    expect(parsed?.projectDetails).toBe('Short brief.')
  })

  it('clamps oversized values to the contact schema limits', () => {
    const long = `<!-- ${INQUIRY_MARKER} v1 -->

**Name:** ${'a'.repeat(500)}
**Email:** sam@example.com

## Brief

ok`
    expect(parseInquiryBlock(long)?.name?.length).toBe(120)
  })

  it('does not treat a lookalike heading as the brief', () => {
    const parsed = parseInquiryBlock(`<!-- ${INQUIRY_MARKER} v1 -->

**Name:** Sam Doe
**Email:** sam@example.com

### Briefing

not the brief`)
    expect(parsed?.projectDetails).toBeUndefined()
  })
})
