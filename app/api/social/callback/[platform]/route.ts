import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getClient,
  SocialAPIError,
  AuthenticationError,
  calculateTokenExpiration,
} from '@/lib/social/clients';
import type { SocialPlatform, SocialAccountStatus } from '@/lib/social/types';

/**
 * GET /api/social/callback/[platform]
 *
 * OAuth callback handler for social media platforms.
 * Handles the authorization code exchange and stores tokens.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform: platformParam } = await params;
  const platform = platformParam as SocialPlatform;

  // Validate platform
  if (!['twitter', 'linkedin', 'instagram'].includes(platform)) {
    return NextResponse.redirect(
      new URL(
        `/admin/social/accounts?error=Invalid platform: ${platform}`,
        request.url
      )
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error(`[${platform}] OAuth error:`, error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/admin/social/accounts?error=${encodeURIComponent(errorDescription || error)}`,
        request.url
      )
    );
  }

  // Validate required parameters
  if (!code) {
    return NextResponse.redirect(
      new URL(
        '/admin/social/accounts?error=Missing authorization code',
        request.url
      )
    );
  }

  try {
    // Verify user is authenticated and is admin
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(
        new URL('/login?redirect=/admin/social/accounts', request.url)
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.redirect(
        new URL(
          '/admin/social/accounts?error=Only admins can connect social accounts',
          request.url
        )
      );
    }

    // Get the platform client
    const client = getClient(platform);

    // Build redirect URI (must match what was used in authorization)
    const redirectUri =
      process.env.NEXT_PUBLIC_SOCIAL_OAUTH_CALLBACK_URL ||
      `${new URL(request.url).origin}/api/social/callback/${platform}`;

    // Exchange code for tokens
    const tokens = await client.exchangeCodeForToken(code, redirectUri, state || undefined);

    // Get account info
    const accountInfo = await client.getAccountInfo(tokens.access_token);

    // Calculate token expiration
    const tokenExpiresAt = tokens.expires_in
      ? calculateTokenExpiration(tokens.expires_in)
      : null;

    // Store in database using admin client (bypasses RLS)
    const supabase = createAdminClient();

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('platform', platform)
      .eq('account_id', accountInfo.id)
      .single();

    if (existingAccount) {
      // Update existing account
      const { error: updateError } = await supabase
        .from('social_accounts')
        .update({
          account_name: accountInfo.name,
          account_handle: accountInfo.handle,
          profile_image_url: accountInfo.profile_image_url,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokenExpiresAt?.toISOString() || null,
          token_scope: tokens.scope || null,
          status: 'active' as SocialAccountStatus,
          last_verified_at: new Date().toISOString(),
          error_message: null,
          connected_by: user.id,
        })
        .eq('id', existingAccount.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new account
      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          platform,
          account_name: accountInfo.name,
          account_handle: accountInfo.handle,
          account_id: accountInfo.id,
          profile_image_url: accountInfo.profile_image_url,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokenExpiresAt?.toISOString() || null,
          token_scope: tokens.scope || null,
          status: 'active' as SocialAccountStatus,
          last_verified_at: new Date().toISOString(),
          connected_by: user.id,
        });

      if (insertError) {
        throw insertError;
      }
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(
        `/admin/social/accounts?success=${platform} account connected successfully`,
        request.url
      )
    );
  } catch (err) {
    console.error(`[${platform}] OAuth callback error:`, err);

    let errorMessage = 'Failed to connect account';

    if (err instanceof AuthenticationError) {
      errorMessage = 'Authentication failed. Please try again.';
    } else if (err instanceof SocialAPIError) {
      errorMessage = err.message;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    return NextResponse.redirect(
      new URL(
        `/admin/social/accounts?error=${encodeURIComponent(errorMessage)}`,
        request.url
      )
    );
  }
}
