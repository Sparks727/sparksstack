import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Test endpoint specifically for the Google Business Profile API
 * Tests multiple business profile endpoints to help troubleshoot issues
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
    
    // First test People API to verify basic token functionality
    try {
      console.log('Testing People API first to ensure token works');
      const peopleResponse = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', {
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!peopleResponse.ok) {
        const errorData = await peopleResponse.json();
        return NextResponse.json({
          success: false,
          stage: 'people-api',
          error: 'Failed to authenticate with People API - must fix this before proceeding',
          details: errorData,
          status: peopleResponse.status,
          nextSteps: [
            "Enable the People API at https://console.cloud.google.com/apis/library/people.googleapis.com",
            "Wait 5-10 minutes for changes to propagate before testing again"
          ]
        }, { status: 500 });
      }
      
      console.log('People API test successful, proceeding to Business Profile APIs');
      
      // Test multiple Business Profile API endpoints to find what works
      const endpoints = [
        {
          name: 'Account Management API',
          url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
          apiEnableUrl: 'https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com'
        },
        {
          name: 'Business Information API',
          url: 'https://mybusinessbusinessinformation.googleapis.com/v1/chains',
          apiEnableUrl: 'https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com'
        },
        {
          name: 'Business Performance API',
          url: 'https://businessprofileperformance.googleapis.com/v1/locations',
          apiEnableUrl: 'https://console.cloud.google.com/apis/library/businessprofileperformance.googleapis.com'
        }
      ];
      
      const results = [];
      
      // Test each endpoint
      for (const endpoint of endpoints) {
        try {
          console.log(`Testing ${endpoint.name} at ${endpoint.url}`);
          
          const apiResponse = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${oauthToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          const apiData = await apiResponse.json();
          
          results.push({
            endpoint: endpoint.name,
            url: endpoint.url,
            success: apiResponse.ok,
            status: apiResponse.status,
            data: apiResponse.ok ? apiData : null,
            error: !apiResponse.ok ? apiData : null,
            enableUrl: !apiResponse.ok ? endpoint.apiEnableUrl : null
          });
          
        } catch (endpointError) {
          results.push({
            endpoint: endpoint.name,
            url: endpoint.url,
            success: false,
            error: endpointError instanceof Error ? endpointError.message : 'Unknown error',
            enableUrl: endpoint.apiEnableUrl
          });
        }
      }
      
      // Check overall result
      const anySuccessful = results.some(r => r.success);
      
      return NextResponse.json({
        success: anySuccessful,
        message: anySuccessful 
          ? 'Successfully connected to at least one Business Profile API endpoint' 
          : 'Failed to connect to any Business Profile API endpoint',
        results,
        nextSteps: !anySuccessful ? [
          "Enable all required APIs in Google Cloud Console (see enableUrl for each endpoint)",
          "Wait 5-10 minutes for API activation to propagate",
          "Ensure your OAuth scope includes https://www.googleapis.com/auth/business.manage",
          "Verify your account has access to Google Business Profiles at business.google.com"
        ] : []
      });
      
    } catch (apiError) {
      return NextResponse.json({
        success: false,
        error: 'Error accessing Google APIs',
        message: apiError instanceof Error ? apiError.message : 'Unknown API error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in Business Profile API test:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 