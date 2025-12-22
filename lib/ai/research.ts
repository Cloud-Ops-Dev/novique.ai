import Parser from 'rss-parser'

// RSS Feed URLs for tech news sources
const RSS_FEEDS = {
  mitTechReview: 'https://www.technologyreview.com/feed/',
  ventureBeat: 'https://venturebeat.com/feed/',
  techCrunch: 'https://techcrunch.com/feed/',
  forbesSmallBusiness: 'https://www.forbes.com/small-business/feed/',
}

const rssParser = new Parser()

export interface ResearchArticle {
  title: string
  link: string
  pubDate?: string
  content?: string
  snippet?: string
  source: string
}

export interface ResearchData {
  topic: string
  articles: ResearchArticle[]
  summary: string
  keywords: string[]
}

/**
 * Search the web using Brave Search API
 */
export async function searchWeb(query: string, count: number = 10): Promise<ResearchArticle[]> {
  if (!process.env.BRAVE_API_KEY) {
    console.warn('BRAVE_API_KEY not set, skipping web search')
    return []
  }

  try {
    const url = new URL('https://api.search.brave.com/res/v1/web/search')
    url.searchParams.set('q', query)
    url.searchParams.set('count', count.toString())

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': process.env.BRAVE_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status}`)
    }

    const data = await response.json()

    return (data.web?.results || []).map((result: any) => ({
      title: result.title,
      link: result.url,
      snippet: result.description,
      source: 'Brave Search',
    }))
  } catch (error) {
    console.error('Web search error:', error)
    return []
  }
}

/**
 * Fetch and parse RSS feed
 */
async function fetchRSSFeed(feedUrl: string, sourceName: string): Promise<ResearchArticle[]> {
  try {
    const feed = await rssParser.parseURL(feedUrl)

    return (feed.items || []).slice(0, 5).map((item) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate,
      content: item.contentSnippet || item.content || '',
      source: sourceName,
    }))
  } catch (error) {
    console.error(`RSS feed error for ${sourceName}:`, error)
    return []
  }
}

/**
 * Aggregate RSS feeds from multiple sources
 */
export async function aggregateRSSFeeds(): Promise<ResearchArticle[]> {
  const results = await Promise.allSettled([
    fetchRSSFeed(RSS_FEEDS.mitTechReview, 'MIT Technology Review'),
    fetchRSSFeed(RSS_FEEDS.ventureBeat, 'VentureBeat'),
    fetchRSSFeed(RSS_FEEDS.techCrunch, 'TechCrunch'),
    fetchRSSFeed(RSS_FEEDS.forbesSmallBusiness, 'Forbes Small Business'),
  ])

  const articles = results
    .filter((result): result is PromiseFulfilledResult<ResearchArticle[]> => result.status === 'fulfilled')
    .flatMap((result) => result.value)

  // Sort by date (most recent first)
  articles.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0
    return dateB - dateA
  })

  return articles
}

/**
 * Research a topic using both web search and RSS feeds
 */
export async function researchTopic(
  topic: string,
  keywords: string[] = []
): Promise<ResearchData> {
  console.log(`Researching topic: ${topic}`)

  // Perform web search
  const searchQuery = keywords.length > 0 ? `${topic} ${keywords.join(' ')}` : topic
  const webResults = await searchWeb(searchQuery, 10)

  // Aggregate RSS feeds
  const rssResults = await aggregateRSSFeeds()

  // Filter RSS results by topic relevance
  const relevantRSS = rssResults.filter((article) => {
    const lowerTitle = article.title.toLowerCase()
    const lowerContent = (article.content || '').toLowerCase()
    const lowerTopic = topic.toLowerCase()

    return (
      lowerTitle.includes(lowerTopic) ||
      lowerContent.includes(lowerTopic) ||
      keywords.some((keyword) => lowerTitle.includes(keyword.toLowerCase()))
    )
  })

  // Combine all articles
  const allArticles = [...webResults, ...relevantRSS]

  // Extract keywords from articles
  const extractedKeywords = extractKeywords(allArticles)

  // Create summary
  const summary = createSummary(allArticles, topic)

  console.log(`Research complete: ${allArticles.length} articles found`)

  return {
    topic,
    articles: allArticles.slice(0, 15), // Limit to top 15 articles
    summary,
    keywords: [...new Set([...keywords, ...extractedKeywords])].slice(0, 10),
  }
}

/**
 * Extract keywords from research articles
 */
function extractKeywords(articles: ResearchArticle[]): string[] {
  const wordFrequency: Record<string, number> = {}

  articles.forEach((article) => {
    const text = `${article.title} ${article.snippet || article.content || ''}`.toLowerCase()

    // Remove common words and extract potential keywords
    const words = text
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .filter((word) => !commonWords.includes(word))

    words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1
    })
  })

  // Sort by frequency and return top keywords
  return Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}

/**
 * Create a summary from research articles
 */
function createSummary(articles: ResearchArticle[], topic: string): string {
  const summaryParts: string[] = []

  summaryParts.push(`Research on "${topic}" includes ${articles.length} articles from:`)

  const sources = [...new Set(articles.map((a) => a.source))]
  summaryParts.push(`- ${sources.join(', ')}`)

  if (articles.length > 0) {
    summaryParts.push(`\nRecent articles:`)
    articles.slice(0, 5).forEach((article) => {
      summaryParts.push(`- "${article.title}" (${article.source})`)
    })
  }

  return summaryParts.join('\n')
}

// Common words to filter out when extracting keywords
const commonWords = [
  'the',
  'and',
  'for',
  'with',
  'this',
  'that',
  'from',
  'have',
  'been',
  'will',
  'their',
  'about',
  'would',
  'there',
  'which',
  'these',
  'other',
  'some',
  'what',
  'than',
  'more',
  'into',
  'through',
  'during',
  'before',
  'after',
]
