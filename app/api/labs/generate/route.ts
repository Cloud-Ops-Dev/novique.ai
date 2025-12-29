import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { generateLab, regenerateLabSvg } from '@/lib/ai/labGenerator'
import { generateCustomWorkflowSvg, sanitizeSvg } from '@/lib/ai/svgGenerator'

/**
 * POST /api/labs/generate
 * Generate lab content from GitHub repository
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role (admin or editor)
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Check if this is a custom workflow SVG request
    if (body.customNodes && Array.isArray(body.customNodes)) {
      const svg = generateCustomWorkflowSvg(body.customNodes, body.title || 'Infrastructure Workflow')
      return NextResponse.json({
        success: true,
        svg: sanitizeSvg(svg),
      })
    }

    // Validate GitHub URL for other operations
    if (!body.githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    if (!body.githubUrl.includes('github.com')) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL' },
        { status: 400 }
      )
    }

    // Check if this is a regenerate SVG request
    if (body.regenerateSvgOnly) {
      const svg = await regenerateLabSvg(body.githubUrl)
      if (!svg) {
        return NextResponse.json(
          { error: 'Failed to regenerate SVG' },
          { status: 500 }
        )
      }
      return NextResponse.json({
        success: true,
        svg,
      })
    }

    // Generate full lab
    const result = await generateLab(
      {
        githubUrl: body.githubUrl,
        generateSvg: body.generateSvg !== false,
      },
      user.id
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Lab generation failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      labId: result.labId,
      slug: result.slug,
      generationData: result.generationData,
    })
  } catch (error) {
    console.error('Lab generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate lab' },
      { status: 500 }
    )
  }
}
