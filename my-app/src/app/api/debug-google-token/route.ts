import { auth } from '@clerk/nextjs/server';
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
    
    // Make direct request to Clerk API
    const response = await fetch(
      `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/google`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to retrieve Google OAuth token', 
          status: response.status,
          statusText: response.statusText 
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Don't expose the actual token for security
    let tokenInfo = null;
    
    if (data && data.length > 0 && data[0].token) {
      const token = data[0].token;
      tokenInfo = {
        tokenAvailable: true,
        tokenPrefix: token.substring(0, 10) + '...',
        tokenLength: token.length,
        format: {
          startsWithEyJ: token.startsWith('eyJ'),
          containsDots: token.includes('.'),
          dotCount: token.split('.').length - 1,
          isProbablyJwt: token.startsWith('eyJ') && token.split('.').length === 3,
          isProbablyRawOAuth: !token.startsWith('eyJ') && !token.includes('.'),
        }
      };
    } else {
      tokenInfo = {
        tokenAvailable: false,
        message: 'No token found in response',
        responseData: typeof data === 'object' ? Object.keys(data) : typeof data
      };
    }
    
    return NextResponse.json({
      message: 'Google OAuth debug information',
      userId,
      tokenInfo,
      hasConnectedAccount: data && data.length > 0
    });
    
  } catch (error) {
    console.error('Error in debug token endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 