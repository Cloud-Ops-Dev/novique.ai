import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

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
