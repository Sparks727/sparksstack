import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/google/business
 * Return the status of the Google Business Profile connection
 */
export async function GET() {
  try {
    const authObj = await auth();
    const userId = authObj.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use Clerk's server-side auth() instead of currentUser()
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to get user data' }, { status: 500 });
    }
    
    const userData = await res.json();
    
    // Check if user has connected a Google account
    const googleAccount = userData.external_accounts?.find(
      (account: { provider: string }) => account.provider === 'google'
    );
    
    if (!googleAccount) {
      return NextResponse.json({ 
        connected: false,
        message: 'Google account not connected'
      });
    }
    
    // Check if we have the right scopes
    const hasBusinessManageScope = googleAccount.approved_scopes?.includes(
      'https://www.googleapis.com/auth/business.manage'
    );
    
    return NextResponse.json({
      connected: !!googleAccount,
      hasRequiredScopes: !!hasBusinessManageScope,
      account: {
        provider: googleAccount.provider,
        email: googleAccount.email_address
      }
    });
  } catch (error) {
    console.error('Error checking Google connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/google/business/accounts
 * Get the user's Google Business Profile accounts
 */
export async function POST() {
  try {
    const authObj = await auth();
    const userId = authObj.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use Clerk's server-side auth() instead of currentUser()
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to get user data' }, { status: 500 });
    }
    
    const userData = await res.json();
    
    // Get the access token from the user's Google account
    const googleAccount = userData.external_accounts?.find(
      (account: { provider: string }) => account.provider === 'google'
    );
    
    if (!googleAccount || !googleAccount.access_token) {
      return NextResponse.json({ error: 'Google account not connected' }, { status: 400 });
    }
    
    // Make a call to the Google Business Profile API
    const response = await fetch('https://mybusinessbusinessinformation.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${googleAccount.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Google API error', details: errorData }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Google accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 