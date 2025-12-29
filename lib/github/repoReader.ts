export interface RepoFile {
  name: string
  path: string
  content: string
}

export interface RepoAnalysis {
  owner: string
  repo: string
  description: string
  readme: string | null
  mainTf: string | null
  variablesTf: string | null
  outputsTf: string | null
  otherFiles: RepoFile[]
  defaultBranch: string
}

/**
 * Parse GitHub URL to extract owner and repo
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,
    /github\.com:([^\/]+)\/([^\/]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      }
    }
  }

  return null
}

/**
 * Fetch raw file content from GitHub
 */
async function fetchRawFile(
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<string | null> {
  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
    const response = await fetch(url)

    if (!response.ok) {
      // Try 'master' branch if 'main' fails
      if (branch === 'main') {
        return fetchRawFile(owner, repo, path, 'master')
      }
      return null
    }

    return await response.text()
  } catch (error) {
    console.error(`Error fetching ${path}:`, error)
    return null
  }
}

/**
 * Get repository metadata from GitHub API
 */
async function getRepoMetadata(
  owner: string,
  repo: string
): Promise<{ description: string; defaultBranch: string } | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'novique-ai-labs',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      description: data.description || '',
      defaultBranch: data.default_branch || 'main',
    }
  } catch (error) {
    console.error('Error fetching repo metadata:', error)
    return null
  }
}

/**
 * List files in repository root
 */
async function listRepoFiles(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'novique-ai-labs',
        },
      }
    )

    if (!response.ok) {
      if (branch === 'main') {
        return listRepoFiles(owner, repo, 'master')
      }
      return []
    }

    const data = await response.json()
    return data.filter((item: { type: string }) => item.type === 'file').map((item: { name: string }) => item.name)
  } catch (error) {
    console.error('Error listing repo files:', error)
    return []
  }
}

/**
 * Read a GitHub repository and extract relevant files for lab generation
 */
export async function readGitHubRepo(githubUrl: string): Promise<RepoAnalysis | null> {
  const parsed = parseGitHubUrl(githubUrl)
  if (!parsed) {
    console.error('Invalid GitHub URL:', githubUrl)
    return null
  }

  const { owner, repo } = parsed

  // Get repo metadata
  const metadata = await getRepoMetadata(owner, repo)
  const defaultBranch = metadata?.defaultBranch || 'main'

  // Fetch key files in parallel
  const [readme, mainTf, variablesTf, outputsTf] = await Promise.all([
    fetchRawFile(owner, repo, 'README.md', defaultBranch),
    fetchRawFile(owner, repo, 'main.tf', defaultBranch),
    fetchRawFile(owner, repo, 'variables.tf', defaultBranch),
    fetchRawFile(owner, repo, 'outputs.tf', defaultBranch),
  ])

  // List other files for context
  const files = await listRepoFiles(owner, repo, defaultBranch)
  const otherFiles: RepoFile[] = []

  // Fetch additional terraform files
  const additionalTfFiles = files.filter(
    (f) =>
      f.endsWith('.tf') &&
      !['main.tf', 'variables.tf', 'outputs.tf'].includes(f)
  )

  for (const file of additionalTfFiles.slice(0, 5)) {
    const content = await fetchRawFile(owner, repo, file, defaultBranch)
    if (content) {
      otherFiles.push({ name: file, path: file, content })
    }
  }

  return {
    owner,
    repo,
    description: metadata?.description || '',
    readme,
    mainTf,
    variablesTf,
    outputsTf,
    otherFiles,
    defaultBranch,
  }
}

/**
 * Extract Terraform resources from main.tf content
 */
export function extractTerraformResources(mainTf: string): Array<{
  type: string
  name: string
  provider: string
}> {
  const resources: Array<{ type: string; name: string; provider: string }> = []

  // Match resource blocks
  const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g
  let match

  while ((match = resourceRegex.exec(mainTf)) !== null) {
    const [, type, name] = match
    const provider = type.split('_')[0] // e.g., 'aws' from 'aws_s3_bucket'
    resources.push({ type, name, provider })
  }

  return resources
}

/**
 * Extract providers from Terraform content
 */
export function extractTerraformProviders(content: string): string[] {
  const providers: string[] = []
  const providerRegex = /provider\s+"([^"]+)"\s*\{/g
  let match

  while ((match = providerRegex.exec(content)) !== null) {
    providers.push(match[1])
  }

  return [...new Set(providers)]
}
