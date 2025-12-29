export interface Lab {
  slug: string
  title: string
  overview: string
  architecture: string | null
  setupDeployment: string | null
  troubleshooting: string | null
  businessUse: string | null
  workflowSvg: string | null
  githubUrl: string | null
  author: string
  date: string
  featured: boolean
  tags: string[]
  status?: string
  aiGenerated?: boolean
}

/**
 * Get all published labs from database
 */
export async function getAllLabs(): Promise<Lab[]> {
  try {
    const supabase = (await import('@/lib/supabase/server')).createAdminClient()

    const { data, error } = await supabase
      .from('labs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Labs fetch error:', error)
      return []
    }

    return (data || []).map((lab) => ({
      slug: lab.slug,
      title: lab.title,
      overview: lab.overview,
      architecture: lab.architecture,
      setupDeployment: lab.setup_deployment,
      troubleshooting: lab.troubleshooting,
      businessUse: lab.business_use,
      workflowSvg: lab.workflow_svg,
      githubUrl: lab.github_url,
      author: 'Novique.AI',
      date: lab.published_at || lab.created_at,
      featured: lab.featured,
      tags: lab.tags || [],
      status: lab.status,
      aiGenerated: lab.ai_generated,
    }))
  } catch (error) {
    console.error('Error fetching labs:', error)
    return []
  }
}

/**
 * Get featured labs (up to 3)
 */
export async function getFeaturedLabs(): Promise<Lab[]> {
  const allLabs = await getAllLabs()
  return allLabs.filter((lab) => lab.featured).slice(0, 3)
}

/**
 * Get single lab by slug
 */
export async function getLabBySlug(slug: string): Promise<Lab | undefined> {
  try {
    const supabase = (await import('@/lib/supabase/server')).createAdminClient()

    const { data, error } = await supabase
      .from('labs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      return undefined
    }

    return {
      slug: data.slug,
      title: data.title,
      overview: data.overview,
      architecture: data.architecture,
      setupDeployment: data.setup_deployment,
      troubleshooting: data.troubleshooting,
      businessUse: data.business_use,
      workflowSvg: data.workflow_svg,
      githubUrl: data.github_url,
      author: 'Novique.AI',
      date: data.published_at || data.created_at,
      featured: data.featured,
      tags: data.tags || [],
      status: data.status,
      aiGenerated: data.ai_generated,
    }
  } catch (error) {
    console.error(`Error fetching lab ${slug}:`, error)
    return undefined
  }
}

/**
 * Get labs by tag
 */
export async function getLabsByTag(tag: string): Promise<Lab[]> {
  const allLabs = await getAllLabs()
  return allLabs.filter((lab) => lab.tags.includes(tag))
}

/**
 * Get all unique tags from all labs
 */
export async function getAllLabTags(): Promise<string[]> {
  const allLabs = await getAllLabs()
  const tagSet = new Set<string>()

  allLabs.forEach((lab) => {
    lab.tags.forEach((tag) => tagSet.add(tag))
  })

  return Array.from(tagSet).sort()
}

/**
 * Search labs by title, overview, or tags
 */
export async function searchLabs(query: string): Promise<Lab[]> {
  const allLabs = await getAllLabs()
  const lowerQuery = query.toLowerCase()

  return allLabs.filter(
    (lab) =>
      lab.title.toLowerCase().includes(lowerQuery) ||
      lab.overview.toLowerCase().includes(lowerQuery) ||
      lab.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}
