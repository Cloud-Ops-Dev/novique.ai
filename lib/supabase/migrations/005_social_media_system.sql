-- =====================================================
-- Novique.AI Social Media System - Database Migration
-- =====================================================
-- This migration creates the social media management system
-- for posting to X, LinkedIn, and Instagram with AI-powered
-- content adaptation and comment moderation.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- Social media platforms supported
CREATE TYPE social_platform AS ENUM (
  'twitter',
  'linkedin',
  'instagram'
);

-- Social account connection status
CREATE TYPE social_account_status AS ENUM (
  'active',
  'expired',
  'revoked',
  'pending'
);

-- Social post status workflow
CREATE TYPE social_post_status AS ENUM (
  'draft',
  'queued',
  'scheduled',
  'publishing',
  'published',
  'failed'
);

-- Source type for social posts
CREATE TYPE social_source_type AS ENUM (
  'blog',
  'lab',
  'manual'
);

-- Comment moderation status
CREATE TYPE moderation_status AS ENUM (
  'pending',
  'approved',
  'hidden',
  'flagged',
  'spam'
);

-- =====================================================
-- 2. CREATE SOCIAL_ACCOUNTS TABLE
-- =====================================================
-- Stores connected social media platform accounts with OAuth tokens

CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Platform identification
  platform social_platform NOT NULL,
  account_name TEXT NOT NULL,
  account_handle TEXT, -- @username or page name
  account_id TEXT NOT NULL, -- Platform's unique account ID
  profile_image_url TEXT,

  -- OAuth tokens (should be encrypted at rest)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  token_scope TEXT, -- OAuth scopes granted

  -- Account status
  status social_account_status DEFAULT 'active',
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT, -- Last error if status is expired/revoked

  -- Rate limiting tracking
  rate_limit_remaining INTEGER,
  rate_limit_reset_at TIMESTAMPTZ,

  -- Metadata
  connected_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one account per platform
  UNIQUE(platform, account_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON social_accounts(status);

-- =====================================================
-- 3. CREATE SOCIAL_POSTS TABLE
-- =====================================================
-- Stores generated/scheduled social media posts

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source reference (blog post, lab, or manual)
  source_type social_source_type NOT NULL,
  source_id UUID, -- FK to blog_posts or labs (null for manual)
  source_title TEXT, -- Cached title for display
  source_url TEXT, -- Full URL to the source content

  -- Target platform and account
  platform social_platform NOT NULL,
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,

  -- Post content
  content TEXT NOT NULL,
  media_urls TEXT[], -- Array of image/video URLs
  hashtags TEXT[], -- Extracted/generated hashtags

  -- Scheduling and status
  status social_post_status DEFAULT 'draft',
  auto_publish BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMPTZ, -- When to publish (null = immediate on approval)
  published_at TIMESTAMPTZ,

  -- Platform response after publishing
  platform_post_id TEXT, -- ID returned by platform
  platform_post_url TEXT, -- Direct link to published post

  -- Error handling
  error_details JSONB,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,

  -- AI generation metadata
  generation_metadata JSONB, -- Stores prompt, model, tokens used, etc.

  -- Engagement metrics (updated periodically)
  metrics JSONB, -- likes, retweets, comments, impressions, etc.
  metrics_updated_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_posts_source ON social_posts(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_queued ON social_posts(created_at DESC)
  WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_social_posts_published ON social_posts(published_at DESC)
  WHERE status = 'published';

-- =====================================================
-- 4. CREATE SOCIAL_COMMENTS TABLE
-- =====================================================
-- Stores comments from social platforms for moderation

CREATE TABLE IF NOT EXISTS social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to our post
  social_post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,

  -- Platform identifiers
  platform_comment_id TEXT NOT NULL,
  platform_parent_id TEXT, -- For threaded replies

  -- Comment author
  author_name TEXT,
  author_handle TEXT, -- @username
  author_id TEXT, -- Platform's user ID
  author_profile_url TEXT,
  author_avatar_url TEXT,

  -- Comment content
  content TEXT NOT NULL,
  comment_url TEXT, -- Direct link to comment
  commented_at TIMESTAMPTZ, -- When comment was posted on platform

  -- Moderation
  moderation_status moderation_status DEFAULT 'pending',

  -- AI analysis results
  ai_analysis JSONB, -- toxicity_score, spam_score, sentiment, etc.
  /*
    Expected structure:
    {
      "toxicity_score": 0.0-1.0,
      "spam_score": 0.0-1.0,
      "sentiment": "positive" | "neutral" | "negative",
      "categories": ["spam", "toxic", "off-topic", etc.],
      "recommendation": "approve" | "hide" | "flag" | "respond",
      "suggested_response": "...",
      "analysis_model": "claude-3-haiku",
      "analyzed_at": "2024-01-01T00:00:00Z"
    }
  */

  -- Moderation action tracking
  moderated_by UUID REFERENCES profiles(id), -- null if auto-moderated
  moderated_at TIMESTAMPTZ,
  moderation_notes TEXT,
  auto_moderated BOOLEAN DEFAULT false,

  -- Response tracking
  response_content TEXT, -- Our reply if we responded
  response_posted_at TIMESTAMPTZ,
  response_platform_id TEXT,

  -- Metadata
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate comments
  UNIQUE(platform, platform_comment_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_comments(social_post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_status ON social_comments(moderation_status);
CREATE INDEX IF NOT EXISTS idx_social_comments_pending ON social_comments(created_at DESC)
  WHERE moderation_status IN ('pending', 'flagged');
CREATE INDEX IF NOT EXISTS idx_social_comments_platform ON social_comments(platform, platform_comment_id);

-- =====================================================
-- 5. CREATE SOCIAL_SETTINGS TABLE
-- =====================================================
-- Stores global and per-content-type configuration

CREATE TABLE IF NOT EXISTS social_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT, -- Human-readable description

  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO social_settings (setting_key, setting_value, description) VALUES
  ('default_platforms', '["twitter", "linkedin", "instagram"]',
   'Platforms to post to by default when publishing content'),
  ('auto_publish_blog', 'false',
   'Automatically publish to social when blog posts are published'),
  ('auto_publish_lab', 'false',
   'Automatically publish to social when labs are published'),
  ('moderation_auto_approve', 'false',
   'Automatically approve comments below toxicity/spam thresholds'),
  ('moderation_toxicity_threshold', '0.5',
   'Toxicity score threshold for flagging (0-1)'),
  ('moderation_spam_threshold', '0.5',
   'Spam score threshold for flagging (0-1)'),
  ('moderation_auto_hide_threshold', '0.8',
   'Score threshold for auto-hiding (0-1)')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 6. CREATE SOCIAL_POST_QUEUE TABLE
-- =====================================================
-- Tracks publishing queue and scheduled posts for cron processing

CREATE TABLE IF NOT EXISTS social_post_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  social_post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,

  -- Queue processing
  priority INTEGER DEFAULT 0, -- Higher = process first
  process_after TIMESTAMPTZ DEFAULT NOW(),
  locked_at TIMESTAMPTZ, -- Prevents concurrent processing
  locked_by TEXT, -- Worker identifier

  -- Attempt tracking
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(social_post_id)
);

-- Index for queue processing
CREATE INDEX IF NOT EXISTS idx_social_queue_pending ON social_post_queue(process_after, priority DESC)
  WHERE locked_at IS NULL AND attempts < max_attempts;

-- =====================================================
-- 7. UPDATE TIMESTAMPS TRIGGER
-- =====================================================

-- Generic function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_social_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all social tables
DROP TRIGGER IF EXISTS trigger_social_accounts_updated ON social_accounts;
CREATE TRIGGER trigger_social_accounts_updated
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_social_updated_at();

DROP TRIGGER IF EXISTS trigger_social_posts_updated ON social_posts;
CREATE TRIGGER trigger_social_posts_updated
  BEFORE UPDATE ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_social_updated_at();

DROP TRIGGER IF EXISTS trigger_social_comments_updated ON social_comments;
CREATE TRIGGER trigger_social_comments_updated
  BEFORE UPDATE ON social_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_social_updated_at();

DROP TRIGGER IF EXISTS trigger_social_settings_updated ON social_settings;
CREATE TRIGGER trigger_social_settings_updated
  BEFORE UPDATE ON social_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_social_updated_at();

-- =====================================================
-- 8. ROW-LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all social tables
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Admins can manage social posts" ON social_posts;
DROP POLICY IF EXISTS "Admins can manage social comments" ON social_comments;
DROP POLICY IF EXISTS "Admins can manage social settings" ON social_settings;
DROP POLICY IF EXISTS "Admins can manage social queue" ON social_post_queue;

-- Social Accounts: Admin only
CREATE POLICY "Admins can manage social accounts"
  ON social_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Social Posts: Admins have full access, editors can create/view
CREATE POLICY "Admins can manage social posts"
  ON social_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Editors can view social posts"
  ON social_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Editors can create social posts"
  ON social_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Social Comments: Admins have full access
CREATE POLICY "Admins can manage social comments"
  ON social_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Social Settings: Admin only
CREATE POLICY "Admins can manage social settings"
  ON social_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Social Queue: Admin only (system use)
CREATE POLICY "Admins can manage social queue"
  ON social_post_queue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Get social dashboard metrics
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
    'active_accounts', (SELECT COUNT(*) FROM social_accounts WHERE status = 'active')
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Get posts pending approval for a source
CREATE OR REPLACE FUNCTION get_pending_social_posts(p_source_type social_source_type, p_source_id UUID)
RETURNS SETOF social_posts AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM social_posts
  WHERE source_type = p_source_type
    AND source_id = p_source_id
    AND status IN ('draft', 'queued')
  ORDER BY platform, created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
--
-- Tables created:
-- - social_accounts: Connected platform accounts with OAuth tokens
-- - social_posts: Generated/scheduled posts for each platform
-- - social_comments: Comments fetched for moderation
-- - social_settings: Configuration settings
-- - social_post_queue: Publishing queue for cron processing
--
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify all tables and functions created
-- 3. Create TypeScript types matching this schema
-- 4. Add environment variables for platform API keys
--
-- =====================================================
