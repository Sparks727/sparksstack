import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define more specific types for API bodies
interface ApiTimeRange {
  startTime: string;
  endTime: string;
}

interface ApiMetricsBody {
  locationNames: string[];
  metrics: string[];
  timeRange: ApiTimeRange;
}

interface ApiTest {
  name: string;
  endpoint: string;
  apiService: string;
  method: string;
  body?: ApiMetricsBody | Record<string, unknown>;
}

// List of APIs to test with their endpoints
const API_TESTS: ApiTest[] = [
  {
    name: 'Account Management API',
    endpoint: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts?pageSize=1',
    apiService: 'mybusinessaccountmanagement.googleapis.com',
    method: 'GET',
  },
  {
    name: 'Legacy My Business API',
    endpoint: 'https://mybusiness.googleapis.com/v4/accounts?pageSize=1',
    apiService: 'mybusiness.googleapis.com',
    method: 'GET',
  },
  /* Disabled APIs - kept for reference
  {
    name: 'Business Information API',
    endpoint: 'https://mybusinessbusinessinformation.googleapis.com/v1/chains?pageSize=1',
    apiService: 'mybusinessbusinessinformation.googleapis.com',
    method: 'GET',
  },
  {
    name: 'Business Reviews API',
    endpoint: 'https://mybusinessreviews.googleapis.com/v1/accounts',
    apiService: 'mybusinessreviews.googleapis.com',
    method: 'GET',
  },
  {
    name: 'Business Performance API',
    endpoint: 'https://businessprofileperformance.googleapis.com/v1/locations:fetchMultipleMetricTimeSeries',
    apiService: 'businessprofileperformance.googleapis.com',
    method: 'POST',
    body: {
      locationNames: [],
      metrics: ["WEBSITE_CLICKS"],
      timeRange: {
        startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString()
      }
    }
  },
  {
    name: 'Verifications API',
    endpoint: 'https://mybusinessverifications.googleapis.com/v1/locations',
    apiService: 'mybusinessverifications.googleapis.com',
    method: 'GET',
  }
  */
];

interface ApiTestResult {
  name: string;
  success: boolean;
  statusCode: number;
  statusText: string;
  errorMessage: string | null;
  errorDetails: unknown;
  responseBody: unknown;
  requestDetails: {
    endpoint: string;
    method: string;
    apiService: string;
  };
  recommendations: string[];
}

/**
 * API endpoint to directly test each Google Business API individually
 * Currently focusing on Legacy My Business API and Account Management API only
 * Other specialized APIs have been disabled in Google Cloud Console
 */
export async function GET() {
  try {
    // Get the auth session
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
    
    // Test each API individually
    const results: ApiTestResult[] = [];
    
    for (const test of API_TESTS) {
      const result: ApiTestResult = {
        name: test.name,
        success: false,
        statusCode: 0,
        statusText: '',
        errorMessage: null,
        errorDetails: null,
        responseBody: null,
        requestDetails: {
          endpoint: test.endpoint,
          method: test.method,
          apiService: test.apiService
        },
        recommendations: []
      };
      
      try {
        console.log(`Testing ${test.name} at ${test.endpoint}`);
        
        const fetchOptions: RequestInit = {
          method: test.method,
          headers: {
            'Authorization': `Bearer ${oauthToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        };
        
        // Add body for POST requests
        if (test.method === 'POST' && test.body) {
          fetchOptions.body = JSON.stringify(test.body);
        }
        
        const apiResponse = await fetch(test.endpoint, fetchOptions);
        
        result.statusCode = apiResponse.status;
        result.statusText = apiResponse.statusText;
        
        // Get response body for both success and error cases
        const responseBody = await apiResponse.text();
        try {
          result.responseBody = responseBody ? JSON.parse(responseBody) : null;
        } catch {
          result.responseBody = responseBody; // Keep as text if not JSON
        }
        
        if (apiResponse.ok) {
          result.success = true;
        } else {
          result.success = false;
          result.errorMessage = `API returned status ${apiResponse.status}: ${apiResponse.statusText}`;
          
          // Add detailed recommendations based on status codes
          if (apiResponse.status === 400) {
            result.recommendations.push('Check the API request format - parameters or body may be incorrect');
            result.recommendations.push(`Ensure the ${test.apiService} API is correctly enabled in Google Cloud Console`);
          } else if (apiResponse.status === 401) {
            result.recommendations.push('OAuth token is invalid or expired. Try reconnecting your Google account');
            result.recommendations.push('Verify that your OAuth scopes include https://www.googleapis.com/auth/business.manage');
          } else if (apiResponse.status === 403) {
            result.recommendations.push(`Your user account does not have permission to access ${test.apiService}`);
            result.recommendations.push('Ensure your Google account has necessary permissions to manage Business Profiles');
            result.recommendations.push(`Verify the ${test.apiService} API is enabled in Google Cloud Console`);
            result.recommendations.push('Check API quotas in Google Cloud Console - they might be set to 0');
            if (test.name === 'Legacy My Business API') {
              result.recommendations.push('For the Legacy API, make sure to request a quota increase specifically for this API');
              result.recommendations.push('You may need to complete the Google My Business API verification process in Google Cloud Console');
            }
          } else if (apiResponse.status === 404) {
            result.recommendations.push('Resource not found. The endpoint might have changed or the resource doesn\'t exist');
          } else if (apiResponse.status === 429) {
            result.recommendations.push('API quota exceeded. Check and increase your quota limits in Google Cloud Console');
          } else if (apiResponse.status >= 500) {
            result.recommendations.push('Server error from Google. This might be temporary - try again later');
            result.recommendations.push('Check Google Cloud Status Dashboard for any ongoing service disruptions');
          }
        }
      } catch (error) {
        result.success = false;
        result.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errorDetails = error;
        result.recommendations.push('Network error occurred. Check your internet connection');
        result.recommendations.push('The API endpoint may be incorrect or not responding');
      }
      
      results.push(result);
    }
    
    // Analyze results for overall recommendations
    const overallRecommendations: string[] = [];
    const failedApis = results.filter(r => !r.success);
    
    if (failedApis.length > 0) {
      if (failedApis.some(api => api.name === 'Legacy My Business API')) {
        overallRecommendations.push('We are now focusing solely on the Google My Business API (Legacy) for all business profile operations');
        overallRecommendations.push('You need to request a quota increase for the Legacy My Business API in Google Cloud Console');
        overallRecommendations.push('Navigate to: Google Cloud Console > APIs & Services > Quotas & System Limits');
        overallRecommendations.push('Filter for "Google My Business API" and request increases for both read and write operations');
      }
      
      // Check for common patterns in error codes
      const errorCodes = new Set(failedApis.map(r => r.statusCode));
      if (errorCodes.size === 1) {
        const code = [...errorCodes][0];
        if (code === 403) {
          overallRecommendations.push('All failing APIs return 403 Forbidden - this likely indicates your Google Cloud project needs verification or has API restriction policies');
          overallRecommendations.push('Verify your Google Cloud project is properly configured in Testing mode with your account as a test user');
          overallRecommendations.push('Check that all APIs have proper quotas configured (should not be 0)');
        } else if (code === 401) {
          overallRecommendations.push('All failing APIs return 401 Unauthorized - this indicates an OAuth token issue');
          overallRecommendations.push('Try disconnecting and reconnecting your Google account in Clerk settings');
        }
      }
    } else {
      overallRecommendations.push('All APIs are working correctly! You can now use the Legacy Google My Business API for all operations.');
    }
    
    return NextResponse.json({
      success: failedApis.length === 0,
      message: failedApis.length === 0 
        ? 'All APIs tested successfully' 
        : `${failedApis.length} of ${results.length} APIs failed testing`,
      results,
      overallRecommendations,
      tokenInfo: {
        present: true,
        prefix: oauthToken.substring(0, 10) + '...',
        length: oauthToken.length
      }
    });
    
  } catch (error) {
    console.error('API direct test error:', error);
    return NextResponse.json(
      { 
        error: 'Error running API tests', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 