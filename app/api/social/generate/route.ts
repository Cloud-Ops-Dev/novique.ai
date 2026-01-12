/**
 * API Route: Generate Social Posts
 *
 * POST /api/social/generate
 * Generates platform-specific social posts from blog content
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrEditor } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/server';
import {
  adaptContentForPlatforms,
  generateSocialMetadata,
} from '@/lib/ai/socialAdapter';
import type { SocialPlatform, ContentSource } from '@/lib/social/types';

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

interface GenerateRequest {
  source_type: 'blog' | 'lab';
  source_id: string;
  platforms: SocialPlatform[];
  save_drafts?: boolean; // If true, save as draft posts
}

export async function POST(request: NextRequest) {
  try {
    // Require admin or editor role
    const user = await requireAdminOrEditor();

    const body: GenerateRequest = await request.json();
    const { source_type, source_id, platforms, save_drafts = false } = body;

    // Validate input
    if (!source_type || !source_id || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: source_type, source_id, platforms' },
        { status: 400 }
      );
    }

    // Fetch the source content
    const supabase = createAdminClient();
    let source: ContentSource | null = null;

    if (source_type === 'blog') {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', source_id)
        .single();

      if (error || !post) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }

      // Check if we need to generate social metadata
      let keyInsights = post.key_insights;
      let coreTakeaway = post.core_takeaway;

      if (!keyInsights || keyInsights.length === 0 || !coreTakeaway) {
        // Generate social metadata from content
        const metadata = await generateSocialMetadata(
          post.title,
          post.content || '',
          post.summary || ''
        );

        keyInsights = metadata.keyInsights;
        coreTakeaway = metadata.coreTakeaway;

        // Optionally save the generated metadata back to the blog post
        await supabase
          .from('blog_posts')
          .update({
            key_insights: keyInsights,
            core_takeaway: coreTakeaway,
          })
          .eq('id', source_id);
      }

      source = {
        type: 'blog',
        title: post.title,
        summary: post.summary || '',
        content: post.content,
        url: `https://novique.ai/blog/${post.slug}`,
        tags: post.tags || [],
        header_image: post.header_image,
        key_insights: keyInsights,
        core_takeaway: coreTakeaway,
      };
    } else if (source_type === 'lab') {
      const { data: lab, error } = await supabase
        .from('labs')
        .select('*')
        .eq('id', source_id)
        .single();

      if (error || !lab) {
        return NextResponse.json(
          { error: 'Lab not found' },
          { status: 404 }
        );
      }

      // Labs don't have social metadata yet, generate it
      const metadata = await generateSocialMetadata(
        lab.title,
        lab.overview || '',
        lab.overview || ''
      );

      source = {
        type: 'lab',
        title: lab.title,
        summary: lab.overview || '',
        url: `https://novique.ai/labs/${lab.slug}`,
        tags: lab.tags || [],
        key_insights: metadata.keyInsights,
        core_takeaway: metadata.coreTakeaway,
      };
    }

    if (!source) {
      return NextResponse.json(
        { error: 'Invalid source type' },
        { status: 400 }
      );
    }

    // Generate content for all platforms
    const result = await adaptContentForPlatforms({
      source,
      platforms,
      postType: 'auto_distributed',
    });

    // If save_drafts is true, create draft social posts
    if (save_drafts && result.posts.length > 0) {
      const drafts = result.posts.map((post) => ({
        source_type,
        source_id,
        source_title: source!.title,
        source_url: source!.url,
        platform: post.platform,
        content: post.content,
        hashtags: post.hashtags,
        status: 'draft',
        post_type: 'auto_distributed',
        template_id: post.template.id,
        generation_metadata: post.generationMetadata,
        created_by: user.id,
      }));

      const { data: savedPosts, error: saveError } = await supabase
        .from('social_posts')
        .insert(drafts)
        .select();

      if (saveError) {
        console.error('Failed to save draft posts:', saveError);
        // Don't fail the whole request, just note the error
        return NextResponse.json({
          success: true,
          posts: result.posts,
          errors: result.errors,
          saved: false,
          saveError: saveError.message,
        });
      }

      return NextResponse.json({
        success: true,
        posts: result.posts,
        errors: result.errors,
        saved: true,
        savedPosts,
      });
    }

    return NextResponse.json({
      success: result.success,
      posts: result.posts,
      errors: result.errors,
      saved: false,
    });
  } catch (error) {
    console.error('Social generation error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate social posts' },
      { status: 500 }
    );
  }
}
