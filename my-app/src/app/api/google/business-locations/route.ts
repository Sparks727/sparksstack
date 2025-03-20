import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * API endpoint to fetch business locations for a specific account
 * This uses the Account Management API to get locations
 */
export async function GET(request: Request) {
  try {
    // Get account ID from query parameter
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const pageSize = searchParams.get('pageSize') || '50'; // Default to 50 results
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing accountId query parameter' },
        { status: 400 }
      );
    }
    
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
    
    // Construct the full account resource name
    const accountResource = `accounts/${accountId}`;
    
    // First attempt: Try to get locations using Business Information API
    const locationsResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountResource}/locations?pageSize=${pageSize}`,
      {
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    // Handle response based on status
    if (locationsResponse.ok) {
      const locationsData = await locationsResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'Successfully retrieved business locations',
        accountId,
        totalLocations: locationsData.locations?.length || 0,
        locations: locationsData.locations || [],
      });
    } else {
      // If first attempt fails, try alternative approach using the accounts/locations endpoint
      try {
        const alternativeResponse = await fetch(
          `https://mybusinessaccountmanagement.googleapis.com/v1/${accountResource}/locations?pageSize=${pageSize}`,
          {
            headers: {
              'Authorization': `Bearer ${oauthToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (alternativeResponse.ok) {
          const alternativeData = await alternativeResponse.json();
          
          return NextResponse.json({
            success: true,
            message: 'Successfully retrieved business locations using alternative API',
            accountId,
            totalLocations: alternativeData.locations?.length || 0,
            locations: alternativeData.locations || [],
            source: 'account-management-api'
          });
        } else {
          // Both attempts failed, return error with details
          const errorData = await alternativeResponse.json().catch(() => ({}));
          
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch business locations',
            accountId,
            details: errorData,
            status: alternativeResponse.status,
            message: 'Both location API endpoints failed. Make sure all APIs are enabled and you have proper permissions.'
          }, { status: alternativeResponse.status });
        }
      } catch (fallbackError) {
        // Capture initial error response
        const errorData = await locationsResponse.json().catch(() => ({}));
        
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch business locations',
          accountId,
          details: errorData,
          originalError: fallbackError instanceof Error ? fallbackError.message : 'Unknown error in fallback',
          status: locationsResponse.status,
          message: 'Location API endpoint failed. Make sure the API is enabled and you have proper permissions.'
        }, { status: locationsResponse.status });
      }
    }
  } catch (error) {
    console.error('Error fetching business locations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}