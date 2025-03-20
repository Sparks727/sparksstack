import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Debug endpoint for troubleshooting Google OAuth tokens
 * This endpoint attempts multiple methods to retrieve the raw Google OAuth token
 */
export async function GET() {
  try {
    // Get the current user session from Clerk
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - No user session found' },
        { status: 401 }
      );
    }
    
    // Get the full user to access OAuth tokens - use currentUser instead of clerkClient
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find the Google OAuth account if connected
    const googleAccount = user.externalAccounts?.find(
      account => account.provider === 'google'
    );
    
    if (!googleAccount) {
      return NextResponse.json(
        { error: 'No Google account connected to this user' },
        { status: 400 }
      );
    }
    
    // Gather debug information
    const debugInfo = {
      userId,
      googleAccountId: googleAccount.id,
      googleEmail: googleAccount.emailAddress,
      scopes: googleAccount.approvedScopes,
      hasBusinessManageScope: googleAccount.approvedScopes?.includes(
        'https://www.googleapis.com/auth/business.manage'
      ),
      // Try to access the OAuth token - this may or may not be available
      // @ts-expect-error - Property might not be exposed in type definitions
      hasToken: !!googleAccount.provider_access_token,
      // Add token prefix for debugging (first 10 chars)
      // @ts-expect-error - Property might not be exposed in type definitions
      tokenPrefix: googleAccount.provider_access_token ? 
        // @ts-expect-error - Property might not be exposed in type definitions
        `${googleAccount.provider_access_token.substring(0, 10)}...` : null,
      // @ts-expect-error - Property might not be exposed in type definitions
      tokenLength: googleAccount.provider_access_token ? 
        // @ts-expect-error - Property might not be exposed in type definitions
        googleAccount.provider_access_token.length : 0,
      // Add some info about the token format
      // @ts-expect-error - Property might not be exposed in type definitions
      tokenFormat: googleAccount.provider_access_token ? {
        // @ts-expect-error - Property might not be exposed in type definitions
        startsWithEyJ: googleAccount.provider_access_token.startsWith('eyJ'),
        // @ts-expect-error - Property might not be exposed in type definitions
        containsDots: googleAccount.provider_access_token.includes('.'),
        // @ts-expect-error - Property might not be exposed in type definitions
        dotCount: googleAccount.provider_access_token.split('.').length - 1,
        // @ts-expect-error - Property might not be exposed in type definitions
        isProbablyJwt: googleAccount.provider_access_token.startsWith('eyJ') && 
          // @ts-expect-error - Property might not be exposed in type definitions
          googleAccount.provider_access_token.split('.').length === 3,
        // @ts-expect-error - Property might not be exposed in type definitions
        isProbablyRawOAuth: !googleAccount.provider_access_token.startsWith('eyJ') && 
          // @ts-expect-error - Property might not be exposed in type definitions
          !googleAccount.provider_access_token.includes('.'),
      } : null,
      // Provider user ID
      // @ts-expect-error - Property might not be exposed in type definitions
      providerUserId: googleAccount.provider_user_id || googleAccount.providerUserId,
      publicMetadata: user.publicMetadata,
    };
    
    // Return debug info
    return NextResponse.json({
      message: 'Google OAuth debug information',
      debugInfo
    });
    
  } catch (error) {
    console.error('Error in debug token endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 