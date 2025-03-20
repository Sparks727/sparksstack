import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';

interface ClerkExternalAccount {
  id: string;
  provider: string;
  emailAddress?: string;
  approvedScopes: string[] | string;
  accessToken?: string;
  providerUserId?: string;
  [key: string]: unknown;
}

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
    
    // Get the user from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    // Find the Google OAuth account if connected
    const googleAccount = user.externalAccounts.find(
      (account: ClerkExternalAccount) => account.provider === 'google'
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
      hasBusinessManageScope: typeof googleAccount.approvedScopes === 'string' 
        ? googleAccount.approvedScopes.includes('https://www.googleapis.com/auth/business.manage')
        : googleAccount.approvedScopes.includes('https://www.googleapis.com/auth/business.manage'),
      // We won't expose the actual tokens in the response for security reasons
      hasToken: !!googleAccount.accessToken,
      // Add token prefix for debugging (first 10 chars)
      tokenPrefix: googleAccount.accessToken ? `${googleAccount.accessToken.substring(0, 10)}...` : null,
      tokenLength: googleAccount.accessToken ? googleAccount.accessToken.length : 0,
      // Add some info about the token format
      tokenFormat: googleAccount.accessToken ? {
        startsWithEyJ: googleAccount.accessToken.startsWith('eyJ'),
        containsDots: googleAccount.accessToken.includes('.'),
        dotCount: googleAccount.accessToken.split('.').length - 1,
        isProbablyJwt: googleAccount.accessToken.startsWith('eyJ') && googleAccount.accessToken.split('.').length === 3,
        isProbablyRawOAuth: !googleAccount.accessToken.startsWith('eyJ') && !googleAccount.accessToken.includes('.'),
      } : null,
      // Try to extract provider specific info
      providerUserId: googleAccount.providerUserId,
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