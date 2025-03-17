import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';

/**
 * GET /api/google/business
 * Return the status of the Google Business Profile connection
 */
export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has connected a Google account
    const googleAccount = user.externalAccounts.find(
      account => account.provider === 'google'
    );
    
    if (!googleAccount) {
      return NextResponse.json({ 
        connected: false,
        message: 'Google account not connected'
      });
    }
    
    // Check if we have the right scopes
    const hasBusinessManageScope = googleAccount.approvedScopes?.includes(
      'https://www.googleapis.com/auth/business.manage'
    );
    
    return NextResponse.json({
      connected: !!googleAccount,
      hasRequiredScopes: !!hasBusinessManageScope,
      account: {
        provider: googleAccount.provider,
        email: googleAccount.emailAddress
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
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the access token from the user's Google account
    const googleAccount = user.externalAccounts.find(
      account => account.provider === 'google'
    );
    
    if (!googleAccount || !googleAccount.accessToken) {
      return NextResponse.json({ error: 'Google account not connected' }, { status: 400 });
    }
    
    // Make a call to the Google Business Profile API
    const response = await fetch('https://mybusinessbusinessinformation.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${googleAccount.accessToken}`,
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