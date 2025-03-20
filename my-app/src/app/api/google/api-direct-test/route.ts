import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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
  url: string;
  method: string;
  requiresAccountId?: boolean;
}

interface ApiTestResult {
  name: string;
  url: string;
  status: number;
  success: boolean;
  message: string;
  responseBody?: unknown;
  errorDetails?: string;
  executionTime?: number;
}

interface AccountsResponse {
  accounts?: Array<{
    name: string;
    accountName?: string;
    type?: string;
    role?: string;
    state?: {
      status?: string;
    };
  }>;
  nextPageToken?: string;
}

/**
 * API endpoint to directly test each Google Business API individually
 * Currently focusing on Legacy My Business API and Account Management API only
 * Other specialized APIs have been disabled in Google Cloud Console
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized - User not authenticated' }, { status: 401 });
    }
    
    const token = await session.getToken({ template: 'oauth_google' });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No Google OAuth token available' }, { status: 401 });
    }
    
    // Define the API tests to run
    const tests: ApiTest[] = [
      {
        name: 'Account Management API',
        url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
        method: 'GET'
      },
      {
        name: 'Legacy My Business API',
        url: 'https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations',
        method: 'GET',
        requiresAccountId: true
      }
    ];
    
    // Run the tests
    const results: ApiTestResult[] = [];
    let accountId: string | null = null;
    
    for (const test of tests) {
      const startTime = performance.now();
      const result: ApiTestResult = {
        name: test.name,
        url: test.url,
        status: 0,
        success: false,
        message: 'Test not executed'
      };
      
      try {
        // If this test requires an account ID and we don't have one, check if we can get it
        if (test.requiresAccountId) {
          if (!accountId) {
            // Try to find the accountId from previous tests
            const accountsTest = results.find(r => r.name === 'Account Management API' && r.success);
            
            if (!accountsTest) {
              result.message = 'Cannot run test - Account Management API test must succeed first';
              result.status = 400;
              results.push(result);
              continue;
            }
            
            // Extract the account ID from the response
            try {
              const responseBody = accountsTest.responseBody as { accounts?: Array<{ name?: string }> };
              if (responseBody?.accounts && responseBody.accounts.length > 0 && responseBody.accounts[0].name) {
                const accountPath = responseBody.accounts[0].name;
                accountId = accountPath.split('/').pop() || null;
                
                if (!accountId) {
                  result.message = 'Cannot extract account ID from Account Management API response';
                  result.status = 400;
                  results.push(result);
                  continue;
                }
              } else {
                result.message = 'No business accounts found in your Google account';
                result.status = 404;
                results.push(result);
                continue;
              }
            } catch (extractError) {
              result.message = 'Error extracting account ID from response';
              result.errorDetails = extractError instanceof Error ? extractError.message : 'Unknown error';
              result.status = 500;
              results.push(result);
              continue;
            }
          }
          
          // Replace {accountId} in the URL with the actual account ID
          result.url = test.url.replace('{accountId}', accountId);
        }
        
        // Make the API request
        const response = await fetch(result.url, {
          method: test.method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const responseBody = await response.json();
        
        result.status = response.status;
        result.success = response.ok;
        result.responseBody = responseBody;
        
        if (response.ok) {
          result.message = `Test successful - ${response.status} ${response.statusText}`;
        } else {
          result.message = `Test failed - ${response.status} ${response.statusText}`;
          result.errorDetails = JSON.stringify(responseBody, null, 2);
        }
      } catch (error) {
        result.status = 500;
        result.success = false;
        result.message = 'Test failed due to an error';
        result.errorDetails = error instanceof Error ? error.message : 'Unknown error';
      } finally {
        const endTime = performance.now();
        result.executionTime = (endTime - startTime) / 1000; // Convert to seconds
        results.push(result);
      }
    }
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 