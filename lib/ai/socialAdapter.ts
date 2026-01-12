/**
 * Social Content Adapter
 *
 * AI-powered service that generates platform-specific social media posts
 * from blog content using templates with platform-native tone and formatting.
 */

import { generateWithClaude } from './claude';
import { createAdminClient } from '@/lib/supabase/server';
import type {
  SocialPlatform,
  PlatformTemplate,
  ContentSource,
  AdaptedContent,
  SocialPostType,
  HashtagStrategy,
  GenerationMetadata,
} from '@/lib/social/types';
import { PLATFORM_CONSTRAINTS } from '@/lib/social/types';

// =====================================================
// TYPES
// =====================================================

export interface AdaptContentOptions {
  source: ContentSource;
  platforms: SocialPlatform[];
  postType?: SocialPostType;
}

export interface AdaptedPlatformContent {
  platform: SocialPlatform;
  template: PlatformTemplate;
  content: string;
  hashtags: string[];
  characterCount: number;
  withinLimit: boolean;
  generationMetadata: GenerationMetadata;
}

export interface AdaptContentResult {
  success: boolean;
  posts: AdaptedPlatformContent[];
  errors: Array<{ platform: SocialPlatform; error: string }>;
}

// =====================================================
// TEMPLATE FETCHING
// =====================================================

/**
 * Get the default template for a platform
 */
async function getDefaultTemplate(
  platform: SocialPlatform
): Promise<PlatformTemplate | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('platform_templates')
    .select('*')
    .eq('platform', platform)
    .eq('is_default', true)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error(`Failed to get default template for ${platform}:`, error);
    return null;
  }

  return data as PlatformTemplate;
}

/**
 * Get a specific template by ID
 */
async function getTemplateById(
  templateId: string
): Promise<PlatformTemplate | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('platform_templates')
    .select('*')
    .eq('id', templateId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error(`Failed to get template ${templateId}:`, error);
    return null;
  }

  return data as PlatformTemplate;
}

/**
 * Get all active templates for a platform
 */
export async function getTemplatesForPlatform(
  platform: SocialPlatform
): Promise<PlatformTemplate[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('platform_templates')
    .select('*')
    .eq('platform', platform)
    .eq('is_active', true)
    .order('is_default', { ascending: false });

  if (error) {
    console.error(`Failed to get templates for ${platform}:`, error);
    return [];
  }

  return (data || []) as PlatformTemplate[];
}

// =====================================================
// CONTENT GENERATION
// =====================================================

/**
 * Build the system prompt based on template tone
 */
function buildSystemPrompt(template: PlatformTemplate): string {
  const toneInstructions: Record<PlatformTemplate['tone'], string> = {
    calm_authority: `You are a thoughtful business consultant writing for LinkedIn. Your tone is:
- Calm and authoritative, never hype-driven
- Focused on genuine insights and business value
- Professional but accessible
- Positioned as a trusted expert helping SMBs navigate AI practically
- No buzzwords or empty promises`,

    sharp_opinionated: `You are a sharp, opinionated voice writing for X/Twitter. Your tone is:
- Direct and punchy - every word counts
- Lead with contrarian or surprising insights
- Opinionated but substantive
- No hashtags (they look spammy on X)
- Challenge conventional thinking`,

    visual_emotional: `You are writing emotionally resonant content for Instagram. Your tone is:
- Lead with emotion and relatability
- Focus on the human problem being solved
- Conversational and warm
- Assume a visual/graphic will accompany this
- Connect with the reader's struggles and aspirations`,
  };

  return `${toneInstructions[template.tone]}

Brand: Novique.AI - AI consulting for small and medium businesses
Voice: Expert but approachable, practical not theoretical

${template.ai_prompt_hints || ''}`;
}

/**
 * Build the user prompt for content generation
 */
function buildUserPrompt(
  source: ContentSource,
  template: PlatformTemplate
): string {
  const constraints = PLATFORM_CONSTRAINTS[template.platform];

  // Build context from source
  const contextParts: string[] = [
    `Blog Post Title: ${source.title}`,
    `Summary: ${source.summary}`,
    `URL: ${source.url}`,
  ];

  if (source.key_insights && source.key_insights.length > 0) {
    contextParts.push(`Key Insights:\n${source.key_insights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}`);
  }

  if (source.core_takeaway) {
    contextParts.push(`Core Takeaway: ${source.core_takeaway}`);
  }

  if (source.tags && source.tags.length > 0) {
    contextParts.push(`Topics: ${source.tags.join(', ')}`);
  }

  // Build the prompt
  return `Generate a ${template.platform} post based on this blog content:

${contextParts.join('\n\n')}

Template Structure to Follow:
${template.template_structure}

Requirements:
- Maximum ${constraints.maxLength} characters
- ${template.platform === 'instagram' ? 'End with "Link in bio." since links don\'t work in captions' : ''}
- ${template.platform === 'twitter' ? 'Be sharp and concise - this is X/Twitter' : ''}
- ${template.platform === 'linkedin' ? 'Professional tone with business insights' : ''}

Generate ONLY the post content. No explanations or meta-commentary.
Replace any {{placeholders}} with appropriate content based on the blog post.
If key_insights are not provided, extract 3 key points from the summary.
If core_takeaway is not provided, create a sharp one-sentence summary.`;
}

/**
 * Generate hashtags based on strategy
 */
function generateHashtags(
  source: ContentSource,
  strategy: HashtagStrategy | null
): string[] {
  if (!strategy || strategy.position === 'none') {
    return [];
  }

  const hashtags: string[] = [...(strategy.always_include || [])];

  // Generate hashtags from tags if we need more
  if (source.tags && hashtags.length < strategy.max_hashtags) {
    const tagHashtags = source.tags
      .slice(0, strategy.max_hashtags - hashtags.length)
      .map((tag) => `#${tag.replace(/\s+/g, '')}`);
    hashtags.push(...tagHashtags);
  }

  return hashtags.slice(0, strategy.max_hashtags);
}

/**
 * Generate content for a single platform
 */
async function generateForPlatform(
  source: ContentSource,
  template: PlatformTemplate
): Promise<AdaptedPlatformContent> {
  const constraints = PLATFORM_CONSTRAINTS[template.platform];

  const systemPrompt = buildSystemPrompt(template);
  const userPrompt = buildUserPrompt(source, template);

  // Generate content with Claude
  const generatedContent = await generateWithClaude({
    prompt: userPrompt,
    systemPrompt,
    maxTokens: 1024,
    temperature: 0.7,
    model: 'claude-3-haiku-20240307', // Fast and cost-effective for social posts
  });

  // Clean up the generated content
  let content = generatedContent.trim();

  // Generate hashtags
  const hashtags = generateHashtags(source, template.hashtag_strategy);

  // Append hashtags if strategy says to put them at the end
  if (
    template.hashtag_strategy?.position === 'end' &&
    hashtags.length > 0
  ) {
    content = `${content}\n\n${hashtags.join(' ')}`;
  }

  // Calculate character count (accounting for URL shortening on Twitter)
  const characterCount =
    template.platform === 'twitter'
      ? countTwitterCharacters(content)
      : content.length;

  const withinLimit = characterCount <= constraints.maxLength;

  // If over limit, truncate intelligently
  if (!withinLimit && template.platform === 'twitter') {
    content = truncateForTwitter(content, constraints.maxLength);
  }

  return {
    platform: template.platform,
    template,
    content,
    hashtags,
    characterCount,
    withinLimit,
    generationMetadata: {
      model: 'claude-3-haiku-20240307',
      prompt: userPrompt.substring(0, 500), // Store truncated prompt
      tokens_used: undefined, // Could be populated from API response
      source_content_length: source.content?.length || source.summary.length,
      generated_at: new Date().toISOString(),
      platform_constraints: {
        max_length: constraints.maxLength,
        allowed_media_types: ['image/jpeg', 'image/png', 'image/gif'],
      },
    },
  };
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Count characters for Twitter (URLs count as 23 chars)
 */
function countTwitterCharacters(text: string): number {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  const textWithoutUrls = text.replace(urlRegex, '');

  // Twitter counts URLs as 23 characters
  return textWithoutUrls.length + urls.length * 23;
}

/**
 * Truncate text for Twitter while preserving URL
 */
function truncateForTwitter(text: string, maxLength: number): string {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  const url = urls[0] || '';

  // Calculate available space for text
  const urlSpace = url ? 23 + 2 : 0; // 23 for URL + space + newline
  const availableSpace = maxLength - urlSpace - 3; // -3 for "..."

  // Get text without URL
  let textWithoutUrl = text.replace(urlRegex, '').trim();

  if (textWithoutUrl.length <= availableSpace) {
    return text;
  }

  // Truncate at word boundary
  textWithoutUrl = textWithoutUrl.substring(0, availableSpace);
  const lastSpace = textWithoutUrl.lastIndexOf(' ');
  if (lastSpace > availableSpace * 0.8) {
    textWithoutUrl = textWithoutUrl.substring(0, lastSpace);
  }

  return url
    ? `${textWithoutUrl}...\n\n${url}`
    : `${textWithoutUrl}...`;
}

// =====================================================
// MAIN EXPORT FUNCTIONS
// =====================================================

/**
 * Generate social posts for multiple platforms from a content source
 */
export async function adaptContentForPlatforms(
  options: AdaptContentOptions
): Promise<AdaptContentResult> {
  const { source, platforms, postType = 'auto_distributed' } = options;

  const posts: AdaptedPlatformContent[] = [];
  const errors: Array<{ platform: SocialPlatform; error: string }> = [];

  // Process each platform
  for (const platform of platforms) {
    try {
      // Get the default template for this platform
      const template = await getDefaultTemplate(platform);

      if (!template) {
        errors.push({
          platform,
          error: `No active template found for ${platform}`,
        });
        continue;
      }

      // Generate content
      const adaptedContent = await generateForPlatform(source, template);
      posts.push(adaptedContent);
    } catch (error) {
      console.error(`Error generating content for ${platform}:`, error);
      errors.push({
        platform,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    success: posts.length > 0,
    posts,
    errors,
  };
}

/**
 * Generate a single platform post with a specific template
 */
export async function adaptContentWithTemplate(
  source: ContentSource,
  templateId: string
): Promise<AdaptedPlatformContent | null> {
  const template = await getTemplateById(templateId);

  if (!template) {
    console.error(`Template not found: ${templateId}`);
    return null;
  }

  return generateForPlatform(source, template);
}

/**
 * Preview content generation without saving
 * Useful for the UI to show previews before committing
 */
export async function previewSocialPosts(
  source: ContentSource,
  platforms: SocialPlatform[]
): Promise<AdaptContentResult> {
  return adaptContentForPlatforms({
    source,
    platforms,
    postType: 'auto_distributed',
  });
}

/**
 * Generate social metadata (key_insights, core_takeaway) from blog content
 * Use this when publishing a blog post that doesn't have social metadata
 */
export async function generateSocialMetadata(
  title: string,
  content: string,
  summary: string
): Promise<{ keyInsights: string[]; coreTakeaway: string }> {
  const prompt = `Analyze this blog post and extract social media metadata:

Title: ${title}
Summary: ${summary}
Content (first 2000 chars): ${content.substring(0, 2000)}...

Generate:
1. key_insights: Exactly 3 bullet points that capture the main insights (each under 100 characters)
2. core_takeaway: A single sharp, opinionated sentence that captures the essence (under 150 characters)

Format as JSON:
{
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "coreTakeaway": "The single most important point..."
}`;

  const response = await generateWithClaude({
    prompt,
    systemPrompt:
      'You are an expert content strategist. Extract the most compelling, shareable insights from content. Always respond with valid JSON.',
    maxTokens: 512,
    temperature: 0.5,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      keyInsights: parsed.keyInsights || [],
      coreTakeaway: parsed.coreTakeaway || '',
    };
  } catch (error) {
    console.error('Failed to parse social metadata:', error);
    return {
      keyInsights: [],
      coreTakeaway: '',
    };
  }
}
