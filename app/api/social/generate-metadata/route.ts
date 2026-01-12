/**
 * API Route: Generate Social Metadata
 *
 * POST /api/social/generate-metadata
 * Generates key_insights and core_takeaway from blog content
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrEditor } from '@/lib/auth/session';
import { generateSocialMetadata } from '@/lib/ai/socialAdapter';

export const maxDuration = 30;

interface GenerateMetadataRequest {
  title: string;
  content: string;
  summary: string;
}

export async function POST(request: NextRequest) {
  try {
    // Require admin or editor role
    await requireAdminOrEditor();

    const body: GenerateMetadataRequest = await request.json();
    const { title, content, summary } = body;

    if (!title || !summary) {
      return NextResponse.json(
        { error: 'Title and summary are required' },
        { status: 400 }
      );
    }

    const metadata = await generateSocialMetadata(title, content || '', summary);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Generate metadata error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate metadata' },
      { status: 500 }
    );
  }
}
