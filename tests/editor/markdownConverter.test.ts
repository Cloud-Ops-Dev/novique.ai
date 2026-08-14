import { describe, expect, it } from 'vitest'
import {
  markdownToHtml,
  looksLikeMarkdown,
  clipboardIsRawMarkdown,
} from '@/lib/editor/markdownConverter'

const I1_SNIPPET = `# Hire a team, not a chatbot — introducing Retinue

Commercial hosted agent-team products proved a useful shape.

> **A suite of retainers in your service.** Self-hosted AI teammates.

## Hire with three fields

1. **Name**
2. **One job**
3. **How it should work**

- **Local-first** — the team's computer is your computer.
`

describe('looksLikeMarkdown', () => {
  it('accepts a kit-shaped paste', () => {
    expect(looksLikeMarkdown(I1_SNIPPET)).toBe(true)
  })

  it('rejects a single short line', () => {
    expect(looksLikeMarkdown('hello')).toBe(false)
    expect(looksLikeMarkdown('- x')).toBe(false)
  })
})

describe('clipboardIsRawMarkdown', () => {
  it('converts plain markdown with no HTML', () => {
    expect(clipboardIsRawMarkdown(I1_SNIPPET, '')).toBe(true)
  })

  it('converts markdown wrapped in a trivial HTML shell', () => {
    const html = `<meta charset="utf-8"><div># Hire a team\n\n## Hire with three fields</div>`
    expect(clipboardIsRawMarkdown(I1_SNIPPET, html)).toBe(true)
  })

  it('leaves already-converted rich HTML alone', () => {
    const html = '<h1>Hire a team</h1><p>Commercial hosted</p><h2>Hire with three fields</h2><ol><li>Name</li></ol>'
    expect(clipboardIsRawMarkdown(I1_SNIPPET, html)).toBe(false)
  })
})

describe('markdownToHtml', () => {
  it('turns headings, quotes, lists, and bold into tags', () => {
    const html = markdownToHtml(I1_SNIPPET)
    expect(html).toContain('<h1>')
    expect(html).toContain('<h2>')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('<ol>')
    expect(html).toContain('<ul>')
    expect(html).toContain('<strong>Name</strong>')
    expect(html).not.toContain('## Hire')
  })

  it('renders GFM tables', () => {
    const html = markdownToHtml('| Piece | Status |\n|---|---|\n| **Rooms** | **v1 shipped** |\n')
    expect(html).toContain('<table>')
    expect(html).toContain('<th>')
    expect(html).toContain('<td>')
  })
})
