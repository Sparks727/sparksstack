import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Test endpoint specifically for the Google People API
 * This is a simpler API to test before moving to the Business Profile API
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
          error: 'Failed to retrieve Google OAuth token', 
          status: response.status,
          statusText: response.statusText 
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0 || !data[0].token) {
      return NextResponse.json(
        { error: 'No Google OAuth token found' },
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
    
    // Test the Google People API
    try {
      const peopleResponse = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos', {
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!peopleResponse.ok) {
        const errorData = await peopleResponse.json();
        return NextResponse.json({
          success: false,
          error: 'Failed to access Google People API',
          details: errorData,
          status: peopleResponse.status,
          nextSteps: [
            "Enable the People API at https://console.cloud.google.com/apis/library/people.googleapis.com",
            "Wait 5-10 minutes for changes to propagate",
            "Ensure your OAuth consent screen includes the needed scopes"
          ]
        }, { status: 500 });
      }
      
      const peopleData = await peopleResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'Successfully connected to Google People API',
        userData: peopleData
      });
      
    } catch (apiError) {
      return NextResponse.json({
        success: false,
        error: 'Error accessing Google People API',
        message: apiError instanceof Error ? apiError.message : 'Unknown API error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in People API test:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 