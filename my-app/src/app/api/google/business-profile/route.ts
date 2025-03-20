import { auth } from '@clerk/nextjs/server';
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
    
    console.log('Authenticated user ID:', userId);
    
    try {
      // Make direct request to Clerk API for the Google OAuth token
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
            error: 'Failed to retrieve Google OAuth token from Clerk', 
            status: response.status,
            statusText: response.statusText 
          },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0 || !data[0].token) {
        return NextResponse.json(
          { error: 'No Google OAuth token found in Clerk response' },
          { status: 400 }
        );
      }
      
      const oauthToken = data[0].token;
      
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
      
    } catch (oauthError) {
      console.error('Error retrieving OAuth token:', oauthError);
      return NextResponse.json(
        { 
          error: 'Error retrieving OAuth token',
          message: oauthError instanceof Error ? oauthError.message : 'Unknown OAuth error',
          suggestion: 'Make sure you have connected your Google account in Clerk settings'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error accessing Google Business Profile API:', error);
    return NextResponse.json(
      { 
        error: 'Server error accessing Google Business Profile API',
        message: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Check server logs for more details'
      },
      { status: 500 }
    );
  }
} 