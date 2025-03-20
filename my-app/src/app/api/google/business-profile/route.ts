import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * API endpoint to test Google Business Profile API access
 * This performs the API request server-side where we have more control
 */
export async function GET() {
  try {
    // Ensure the user is authenticated
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - No user session found' },
        { status: 401 }
      );
    }
    
    // Get the full user to access OAuth tokens
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find Google OAuth account
    const googleAccount = user.externalAccounts?.find(
      (account) => account.provider === 'google'
    );
    
    if (!googleAccount) {
      return NextResponse.json(
        { error: 'No Google account connected' },
        { status: 400 }
      );
    }
    
    // Check if we have the business.manage scope
    const hasBusinessScope = googleAccount.approvedScopes?.includes(
      'https://www.googleapis.com/auth/business.manage'
    );
    
    if (!hasBusinessScope) {
      return NextResponse.json(
        { 
          error: 'Missing required Google OAuth scope',
          message: 'The business.manage scope is required for Google Business Profile API access',
          currentScopes: googleAccount.approvedScopes 
        },
        { status: 403 }
      );
    }
    
    // Get the OAuth token - server-side we might have direct access
    // @ts-expect-error - Property might not be exposed in type definitions
    const oauthToken = googleAccount.provider_access_token;
    
    if (!oauthToken) {
      return NextResponse.json(
        { error: 'No OAuth token available' },
        { status: 400 }
      );
    }
    
    // Log token format info but not the token itself for security
    console.log('Token format:', {
      length: oauthToken.length,
      startsWithEyJ: oauthToken.startsWith('eyJ'),
      containsDots: oauthToken.includes('.'),
      isProbablyJwt: oauthToken.startsWith('eyJ') && oauthToken.split('.').length === 3,
      isProbablyRawOAuth: !oauthToken.startsWith('eyJ') && !oauthToken.includes('.')
    });
    
    // Try the Google People API first as a simpler test
    const peopleResponse = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', {
      headers: {
        'Authorization': `Bearer ${oauthToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const peopleData = await peopleResponse.json();
    
    if (!peopleResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Failed to authenticate with Google People API',
        details: peopleData,
        status: peopleResponse.status
      }, { status: 500 });
    }
    
    // Now try the Business Profile API
    const businessProfileResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${oauthToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!businessProfileResponse.ok) {
      const errorData = await businessProfileResponse.json();
      
      return NextResponse.json({
        success: false,
        error: 'Failed to access Google Business Profile API',
        peopleApiSuccess: true,
        peopleData,
        businessProfileError: errorData,
        status: businessProfileResponse.status
      }, { status: 500 });
    }
    
    const businessProfileData = await businessProfileResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Google Business Profile API',
      people: peopleData,
      businessProfile: businessProfileData
    });
    
  } catch (error) {
    console.error('Error accessing Google Business Profile API:', error);
    return NextResponse.json(
      { 
        error: 'Server error accessing Google Business Profile API',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 