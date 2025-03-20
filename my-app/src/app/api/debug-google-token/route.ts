import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define interface for external account from Clerk API
interface ClerkExternalAccount {
  id: string;
  provider: string;
  email_address?: string;
  approved_scopes?: string[];
  access_token?: string;
  provider_user_id?: string;
  // Allow for additional properties with more specific types
  [key: string]: string | string[] | number | boolean | undefined;
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
    
    // Get the user from Clerk API directly (avoiding clerkClient for type safety)
    const userResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user data from Clerk' },
        { status: 500 }
      );
    }
    
    const user = await userResponse.json();
    
    // Find the Google OAuth account if connected
    const googleAccount = user.external_accounts?.find(
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
      googleEmail: googleAccount.email_address,
      scopes: googleAccount.approved_scopes,
      hasBusinessManageScope: googleAccount.approved_scopes?.includes('https://www.googleapis.com/auth/business.manage'),
      // We won't expose the actual tokens in the response for security reasons
      hasToken: !!googleAccount.access_token,
      // Add token prefix for debugging (first 10 chars)
      tokenPrefix: googleAccount.access_token ? `${googleAccount.access_token.substring(0, 10)}...` : null,
      tokenLength: googleAccount.access_token ? googleAccount.access_token.length : 0,
      // Add some info about the token format
      tokenFormat: googleAccount.access_token ? {
        startsWithEyJ: googleAccount.access_token.startsWith('eyJ'),
        containsDots: googleAccount.access_token.includes('.'),
        dotCount: googleAccount.access_token.split('.').length - 1,
        isProbablyJwt: googleAccount.access_token.startsWith('eyJ') && googleAccount.access_token.split('.').length === 3,
        isProbablyRawOAuth: !googleAccount.access_token.startsWith('eyJ') && !googleAccount.access_token.includes('.'),
      } : null,
      // Try to extract provider specific info
      providerUserId: googleAccount.provider_user_id,
      publicMetadata: user.public_metadata,
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