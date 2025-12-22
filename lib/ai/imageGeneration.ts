export interface UnsplashImage {
  id: string
  url: string
  downloadUrl: string
  photographer: string
  photographerUrl: string
  description: string | null
  altDescription: string | null
}

/**
 * Search Unsplash for images related to a topic
 */
export async function searchUnsplashImages(
  query: string,
  count: number = 5
): Promise<UnsplashImage[]> {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.warn('UNSPLASH_ACCESS_KEY not set, skipping image search')
    return []
  }

  try {
    const url = new URL('https://api.unsplash.com/search/photos')
    url.searchParams.set('query', query)
    url.searchParams.set('per_page', count.toString())
    url.searchParams.set('orientation', 'landscape')
    url.searchParams.set('content_filter', 'high') // Filter out sensitive content

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()

    return (data.results || []).map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      downloadUrl: photo.links.download_location,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      description: photo.description,
      altDescription: photo.alt_description,
    }))
  } catch (error) {
    console.error('Unsplash search error:', error)
    return []
  }
}

/**
 * Track download to comply with Unsplash API guidelines
 */
export async function trackUnsplashDownload(downloadUrl: string): Promise<void> {
  if (!process.env.UNSPLASH_ACCESS_KEY || !downloadUrl) {
    return
  }

  try {
    await fetch(downloadUrl, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    })
  } catch (error) {
    console.error('Error tracking Unsplash download:', error)
  }
}

/**
 * Get a header image for a blog post based on topic and keywords
 */
export async function getBlogHeaderImage(
  topic: string,
  keywords: string[]
): Promise<UnsplashImage | null> {
  // Combine topic and keywords for better search results
  const searchQuery = keywords.length > 0 ? `${topic} ${keywords.slice(0, 2).join(' ')}` : topic

  const images = await searchUnsplashImages(searchQuery, 5)

  if (images.length === 0) {
    console.warn(`No images found for query: ${searchQuery}`)
    return null
  }

  // Select the first (most relevant) image
  const selectedImage = images[0]

  // Track download as required by Unsplash API
  if (selectedImage.downloadUrl) {
    await trackUnsplashDownload(selectedImage.downloadUrl)
  }

  return selectedImage
}

/**
 * Generate AI-powered image description for accessibility
 */
export function generateImageAltText(
  image: UnsplashImage,
  blogTopic: string
): string {
  // Use existing alt text if available
  if (image.altDescription) {
    return image.altDescription
  }

  // Use description if available
  if (image.description) {
    return image.description
  }

  // Fallback to generic alt text
  return `Header image for blog post about ${blogTopic}`
}

/**
 * Format image attribution as required by Unsplash
 */
export function formatUnsplashAttribution(image: UnsplashImage): string {
  return `Photo by [${image.photographer}](${image.photographerUrl}) on [Unsplash](https://unsplash.com)`
}
