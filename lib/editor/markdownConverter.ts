import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { marked } from 'marked'

/**
 * Convert Markdown to HTML for TipTap / blog storage.
 * Does not mutate marked's global defaults (public blog pages use breaks: true).
 */
export function markdownToHtml(markdown: string): string {
  return String(
    marked.parse(markdown || '', {
      async: false,
      gfm: true,
      breaks: false,
    })
  )
}

/**
 * True when plain text is authored markdown (headings, fences, tables, quotes),
 * not a single bullet or a stray hash.
 */
export function looksLikeMarkdown(text: string): boolean {
  if (!text || text.trim().length < 8) return false
  return (
    /^(#{1,6})\s+\S/m.test(text) ||
    /^>\s+\S/m.test(text) ||
    /^```/m.test(text) ||
    /^\|.+\|/m.test(text) ||
    (/\*\*[^*]+\*\*/.test(text) && /^[-*+]\s+\S/m.test(text))
  )
}

/**
 * Clipboard is raw markdown wrapped in a trivial HTML shell (VS Code, chat,
 * a .md file) rather than already-converted rich HTML (Docs, a web page).
 */
export function clipboardIsRawMarkdown(text: string, html: string): boolean {
  if (!looksLikeMarkdown(text)) return false
  if (!html) return true
  const untagged = html.replace(/<[^>]+>/g, ' ')
  if (/^#{1,6}\s/m.test(untagged) || /^\|.+\|/m.test(untagged) || /^```/m.test(untagged)) {
    return true
  }
  if (/<(h[1-6]|ul|ol|blockquote|table)\b/i.test(html)) return false
  return true
}

/**
 * Convert HTML to Markdown
 */
export function htmlToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
  })

  // Add GitHub Flavored Markdown support (tables, strikethrough, task lists)
  turndownService.use(gfm)

  // Custom rule for images with better alt text handling
  turndownService.addRule('images', {
    filter: 'img',
    replacement: (content, node) => {
      const element = node as HTMLImageElement
      const alt = element.alt || ''
      const src = element.src || ''
      const title = element.title || ''

      return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
    },
  })

  return turndownService.turndown(html)
}

/**
 * Clean HTML content (remove script tags, sanitize)
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers for security
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  cleaned = cleaned.replace(/on\w+="[^"]*"/g, '')
  cleaned = cleaned.replace(/on\w+='[^']*'/g, '')

  return cleaned
}

/**
 * Extract plain text from HTML (for previews, search indexing)
 */
export function htmlToPlainText(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  // Collapse multiple spaces/newlines
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

/**
 * Generate excerpt from HTML content
 */
export function generateExcerpt(html: string, maxLength: number = 160): string {
  const plainText = htmlToPlainText(html)

  if (plainText.length <= maxLength) {
    return plainText
  }

  // Cut at word boundary
  const truncated = plainText.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return truncated.substring(0, lastSpace) + '...'
}
