-- =====================================================
-- Novique.AI Social Platform Adapters - Migration Update
-- =====================================================
-- This migration adds platform-specific content adaptation
-- to the social media system, enabling blog posts as the
-- source of truth with platform-native formatting.
--
-- Run this AFTER 005_social_media_system.sql
-- =====================================================

-- =====================================================
-- 1. ADD SOCIAL METADATA TO BLOG_POSTS
-- =====================================================
-- Blog posts become the source of truth for social content

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS key_insights TEXT[],
ADD COLUMN IF NOT EXISTS core_takeaway TEXT;

COMMENT ON COLUMN blog_posts.key_insights IS 'Array of 3 key insights/bullet points for social distribution';
COMMENT ON COLUMN blog_posts.core_takeaway IS 'Single sentence summary for sharp/opinionated posts';

-- =====================================================
-- 2. CREATE SOCIAL POST TYPE ENUM
-- =====================================================
-- Distinguish between automated and manual posts

CREATE TYPE social_post_type AS ENUM (
  'auto_distributed',  -- Blog → platforms (automated, 2-3x/week)
  'native_insight',    -- Platform-native thought leadership (1x/week)
  'founder_post'       -- Personal brand content (1x/week)
);

-- =====================================================
-- 3. CREATE PLATFORM TEMPLATES TABLE
-- =====================================================
-- Stores platform-specific adapter configurations

CREATE TABLE IF NOT EXISTS platform_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template identification
  platform social_platform NOT NULL,
  template_name TEXT NOT NULL,
  display_name TEXT, -- Human-readable name

  -- Tone and style configuration
  tone TEXT NOT NULL, -- 'calm_authority', 'sharp_opinionated', 'visual_emotional'
  max_length INTEGER, -- Character limit for platform

  -- Template structure (uses {{variable}} placeholders)
  template_structure TEXT NOT NULL,
  /*
    Available variables:
    - {{title}} - Blog post title
    - {{url}} - Full URL to blog post
    - {{short_url}} - Shortened URL
    - {{insight_1}}, {{insight_2}}, {{insight_3}} - Key insights
    - {{core_takeaway}} - Single sentence summary
    - {{topic}} - Extracted topic/theme
    - {{emotional_hook}} - AI-generated emotional opener
  */

  -- Hashtag configuration
  hashtag_strategy JSONB DEFAULT '{}',
  /*
    Expected structure:
    {
      "max_hashtags": 3,
      "always_include": ["#AI", "#SMB"],
      "position": "end" | "inline" | "none"
    }
  */

  -- AI generation hints
  ai_prompt_hints TEXT, -- Additional instructions for AI adapter

  -- Template status
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique template names per platform
  UNIQUE(platform, template_name)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_platform_templates_platform
  ON platform_templates(platform) WHERE is_active = true;

-- =====================================================
-- 4. UPDATE SOCIAL_POSTS TABLE
-- =====================================================
-- Add post type classification and template reference

ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS post_type social_post_type DEFAULT 'auto_distributed',
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES platform_templates(id);

COMMENT ON COLUMN social_posts.post_type IS 'Classification: auto_distributed (blog→social), native_insight, or founder_post';
COMMENT ON COLUMN social_posts.template_id IS 'Reference to the template used to generate this post';

-- Index for filtering by post type
CREATE INDEX IF NOT EXISTS idx_social_posts_type ON social_posts(post_type);

-- =====================================================
-- 5. INSERT DEFAULT PLATFORM TEMPLATES
-- =====================================================

-- LinkedIn: Calm Authority Template (Default)
INSERT INTO platform_templates (
  platform,
  template_name,
  display_name,
  tone,
  max_length,
  template_structure,
  hashtag_strategy,
  ai_prompt_hints,
  is_default
) VALUES (
  'linkedin',
  'blog_distribution',
  'Blog Distribution (Calm Authority)',
  'calm_authority',
  3000,
  E'{{emotional_hook}}\n\nIn this post, we break down:\n• {{insight_1}}\n• {{insight_2}}\n• {{insight_3}}\n\nRead more: {{url}}',
  '{"max_hashtags": 3, "position": "end", "always_include": []}',
  'Write in a calm, authoritative tone. Focus on business value and insights. Avoid hype. Position Novique as a thoughtful expert helping SMBs navigate AI practically.',
  true
) ON CONFLICT (platform, template_name) DO UPDATE SET
  template_structure = EXCLUDED.template_structure,
  ai_prompt_hints = EXCLUDED.ai_prompt_hints,
  updated_at = NOW();

-- LinkedIn: Native Insight Template
INSERT INTO platform_templates (
  platform,
  template_name,
  display_name,
  tone,
  max_length,
  template_structure,
  hashtag_strategy,
  ai_prompt_hints,
  is_default
) VALUES (
  'linkedin',
  'native_insight',
  'Native Insight Post',
  'calm_authority',
  3000,
  E'{{core_takeaway}}\n\n{{expanded_insight}}\n\nWhat''s your experience with this?',
  '{"max_hashtags": 2, "position": "end", "always_include": []}',
  'Write a standalone thought leadership post. No link required. Focus on sharing genuine insight that starts conversation. Ask an engaging question at the end.',
  false
) ON CONFLICT (platform, template_name) DO UPDATE SET
  template_structure = EXCLUDED.template_structure,
  ai_prompt_hints = EXCLUDED.ai_prompt_hints,
  updated_at = NOW();

-- X (Twitter): Sharp/Opinionated Template (Default)
INSERT INTO platform_templates (
  platform,
  template_name,
  display_name,
  tone,
  max_length,
  template_structure,
  hashtag_strategy,
  ai_prompt_hints,
  is_default
) VALUES (
  'twitter',
  'blog_distribution',
  'Blog Distribution (Sharp)',
  'sharp_opinionated',
  280,
  E'{{core_takeaway}}\n\nNew post: {{short_url}}',
  '{"max_hashtags": 0, "position": "none", "always_include": []}',
  'Be sharp and opinionated. Lead with the contrarian or surprising insight. No hashtags - they look spammy on X. Keep it punchy.',
  true
) ON CONFLICT (platform, template_name) DO UPDATE SET
  template_structure = EXCLUDED.template_structure,
  ai_prompt_hints = EXCLUDED.ai_prompt_hints,
  updated_at = NOW();

-- X (Twitter): Thread Starter Template
INSERT INTO platform_templates (
  platform,
  template_name,
  display_name,
  tone,
  max_length,
  template_structure,
  hashtag_strategy,
  ai_prompt_hints,
  is_default
) VALUES (
  'twitter',
  'thread_starter',
  'Thread Starter',
  'sharp_opinionated',
  280,
  E'{{hook}}\n\nA thread 🧵',
  '{"max_hashtags": 0, "position": "none", "always_include": []}',
  'Create a compelling hook that makes people want to read the thread. Be provocative but substantive.',
  false
) ON CONFLICT (platform, template_name) DO UPDATE SET
  template_structure = EXCLUDED.template_structure,
  ai_prompt_hints = EXCLUDED.ai_prompt_hints,
  updated_at = NOW();

-- Instagram: Visual/Emotional Template (Default)
INSERT INTO platform_templates (
  platform,
  template_name,
  display_name,
  tone,
  max_length,
  template_structure,
  hashtag_strategy,
  ai_prompt_hints,
  is_default
) VALUES (
  'instagram',
  'blog_distribution',
  'Blog Distribution (Emotional)',
  'visual_emotional',
  2200,
  E'{{emotional_hook}}\n\nNew post on {{topic}}.\nLink in bio.',
  '{"max_hashtags": 5, "position": "end", "always_include": ["#AI", "#SmallBusiness"]}',
  'Lead with emotion and relatability. Focus on the human problem being solved. Keep it conversational. Assume a visual/graphic will accompany this.',
  true
) ON CONFLICT (platform, template_name) DO UPDATE SET
  template_structure = EXCLUDED.template_structure,
  ai_prompt_hints = EXCLUDED.ai_prompt_hints,
  updated_at = NOW();

-- Instagram: Quote Card Template
INSERT INTO platform_templates (
  platform,
  template_name,
  display_name,
  tone,
  max_length,
  template_structure,
  hashtag_strategy,
  ai_prompt_hints,
  is_default
) VALUES (
  'instagram',
  'quote_card',
  'Quote Card Post',
  'visual_emotional',
  2200,
  E'{{quote}}\n\n{{context}}\n\nDouble tap if you agree 👆',
  '{"max_hashtags": 8, "position": "end", "always_include": ["#AI", "#SmallBusiness", "#Entrepreneurship"]}',
  'Extract the most quotable, shareable insight from the content. Make it work as a standalone quote that could be overlaid on an image.',
  false
) ON CONFLICT (platform, template_name) DO UPDATE SET
  template_structure = EXCLUDED.template_structure,
  ai_prompt_hints = EXCLUDED.ai_prompt_hints,
  updated_at = NOW();

-- =====================================================
-- 6. ADD CONTENT CALENDAR VIEW
-- =====================================================
-- Helper view for planning weekly content mix

CREATE OR REPLACE VIEW social_content_calendar AS
SELECT
  date_trunc('week', COALESCE(scheduled_at, created_at)) as week_of,
  platform,
  post_type,
  COUNT(*) as post_count,
  COUNT(*) FILTER (WHERE status = 'published') as published_count,
  COUNT(*) FILTER (WHERE status IN ('draft', 'queued', 'scheduled')) as pending_count
FROM social_posts
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 2, 3;

-- =====================================================
-- 7. HELPER FUNCTION: GET BLOG SOCIAL METADATA
-- =====================================================
-- Returns blog post data formatted for social adapters

CREATE OR REPLACE FUNCTION get_blog_social_data(p_blog_slug TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'slug', bp.slug,
    'title', bp.title,
    'summary', bp.summary,
    'url', 'https://novique.ai/blog/' || bp.slug,
    'key_insights', bp.key_insights,
    'core_takeaway', bp.core_takeaway,
    'tags', bp.tags,
    'published_at', bp.published_at
  ) INTO result
  FROM blog_posts bp
  WHERE bp.slug = p_blog_slug
    AND bp.status = 'published';

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. HELPER FUNCTION: GET DEFAULT TEMPLATE
-- =====================================================

CREATE OR REPLACE FUNCTION get_default_template(p_platform social_platform)
RETURNS platform_templates AS $$
DECLARE
  template platform_templates;
BEGIN
  SELECT * INTO template
  FROM platform_templates
  WHERE platform = p_platform
    AND is_default = true
    AND is_active = true
  LIMIT 1;

  RETURN template;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. UPDATE TIMESTAMPS TRIGGER FOR NEW TABLE
-- =====================================================

DROP TRIGGER IF EXISTS trigger_platform_templates_updated ON platform_templates;
CREATE TRIGGER trigger_platform_templates_updated
  BEFORE UPDATE ON platform_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_social_updated_at();

-- =====================================================
-- 10. ROW-LEVEL SECURITY FOR PLATFORM_TEMPLATES
-- =====================================================

ALTER TABLE platform_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage templates
CREATE POLICY "Admins can manage platform templates"
  ON platform_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Editors can view templates
CREATE POLICY "Editors can view platform templates"
  ON platform_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- =====================================================
-- 11. UPDATE SOCIAL METRICS FUNCTION
-- =====================================================
-- Add post type breakdown to metrics

CREATE OR REPLACE FUNCTION get_social_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_posts', (SELECT COUNT(*) FROM social_posts WHERE status = 'published'),
    'posts_this_week', (SELECT COUNT(*) FROM social_posts
      WHERE status = 'published'
      AND published_at >= NOW() - INTERVAL '7 days'),
    'queued_posts', (SELECT COUNT(*) FROM social_posts WHERE status = 'queued'),
    'scheduled_posts', (SELECT COUNT(*) FROM social_posts WHERE status = 'scheduled'),
    'pending_comments', (SELECT COUNT(*) FROM social_comments
      WHERE moderation_status IN ('pending', 'flagged')),
    'posts_by_platform', (
      SELECT json_object_agg(platform, cnt)
      FROM (
        SELECT platform, COUNT(*) as cnt
        FROM social_posts
        WHERE status = 'published'
        GROUP BY platform
      ) p
    ),
    'posts_by_type', (
      SELECT json_object_agg(post_type, cnt)
      FROM (
        SELECT post_type, COUNT(*) as cnt
        FROM social_posts
        WHERE status = 'published'
        GROUP BY post_type
      ) t
    ),
    'active_accounts', (SELECT COUNT(*) FROM social_accounts WHERE status = 'active'),
    'active_templates', (SELECT COUNT(*) FROM platform_templates WHERE is_active = true)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
--
-- Changes made:
-- - Added key_insights and core_takeaway to blog_posts
-- - Created social_post_type enum
-- - Created platform_templates table with default templates
-- - Added post_type and template_id to social_posts
-- - Created content calendar view
-- - Added helper functions for social data retrieval
--
-- Default templates created:
-- - LinkedIn: blog_distribution (calm authority) [DEFAULT]
-- - LinkedIn: native_insight (thought leadership)
-- - X/Twitter: blog_distribution (sharp) [DEFAULT]
-- - X/Twitter: thread_starter
-- - Instagram: blog_distribution (emotional) [DEFAULT]
-- - Instagram: quote_card
--
-- Weekly posting rhythm supported:
-- - auto_distributed: 2-3x/week (blog → all platforms)
-- - native_insight: 1x/week (platform-native content)
-- - founder_post: 1x/week (personal brand)
--
-- =====================================================
