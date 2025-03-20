import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface ApiResult {
  success: boolean;
  message: string;
  details: Record<string, unknown> | null;
}

/**
 * API endpoint to test connectivity to all required Google Business APIs
 * This helps diagnose which APIs are properly enabled and which are not
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
    
    // Initialize results object
    const results: Record<string, ApiResult> = {
      accountManagementApi: { success: false, message: '', details: null },
      businessInformationApi: { success: false, message: '', details: null },
      legacyMyBusinessApi: { success: false, message: '', details: null },
      businessReviewManagementApi: { success: false, message: '', details: null },
      performanceApi: { success: false, message: '', details: null },
      verificationsApi: { success: false, message: '', details: null }
    };
    
    // Test 1: Account Management API (getting accounts)
    try {
      const accountsUrl = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts?pageSize=1';
      const accountsResponse = await fetch(accountsUrl, {
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        results.accountManagementApi = {
          success: true,
          message: 'Successfully connected to Account Management API',
          details: {
            accountsFound: accountsData.accounts?.length || 0
          }
        };
        
        // If we have at least one account, use it for further tests
        if (accountsData.accounts && accountsData.accounts.length > 0) {
          const accountId = accountsData.accounts[0].name.split('/').pop();
          
          // Test 2: Business Information API (getting locations)
          try {
            const locationsUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?pageSize=1`;
            const locationsResponse = await fetch(locationsUrl, {
              headers: {
                'Authorization': `Bearer ${oauthToken}`,
                'Accept': 'application/json'
              }
            });
            
            if (locationsResponse.ok) {
              const locationsData = await locationsResponse.json();
              results.businessInformationApi = {
                success: true,
                message: 'Successfully connected to Business Information API',
                details: {
                  locationsFound: locationsData.locations?.length || 0
                }
              };
              
              // If we have at least one location, use it for further tests
              if (locationsData.locations && locationsData.locations.length > 0) {
                const locationId = locationsData.locations[0].name.split('/').pop();
                
                // Test 3: Legacy My Business API (getting reviews)
                try {
                  const legacyReviewsUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?pageSize=1`;
                  const legacyReviewsResponse = await fetch(legacyReviewsUrl, {
                    headers: {
                      'Authorization': `Bearer ${oauthToken}`,
                      'Accept': 'application/json'
                    }
                  });
                  
                  if (legacyReviewsResponse.ok) {
                    const legacyReviewsData = await legacyReviewsResponse.json();
                    results.legacyMyBusinessApi = {
                      success: true,
                      message: 'Successfully connected to Legacy My Business API',
                      details: {
                        totalReviewCount: legacyReviewsData.totalReviewCount || 0
                      }
                    };
                  } else {
                    const errorData = await legacyReviewsResponse.json().catch(() => ({}));
                    results.legacyMyBusinessApi = {
                      success: false,
                      message: `Failed to connect to Legacy My Business API with status ${legacyReviewsResponse.status}`,
                      details: errorData
                    };
                  }
                } catch (legacyReviewsError) {
                  results.legacyMyBusinessApi = {
                    success: false,
                    message: 'Error connecting to Legacy My Business API',
                    details: legacyReviewsError instanceof Error ? { error: legacyReviewsError.message } : { error: 'Unknown error' }
                  };
                }
                
                // Test 4: Business Review Management API (new reviews API)
                try {
                  const reviewsUrl = `https://mybusinessreviews.googleapis.com/v1/accounts/${accountId}/locations/${locationId}/reviews?pageSize=1`;
                  const reviewsResponse = await fetch(reviewsUrl, {
                    headers: {
                      'Authorization': `Bearer ${oauthToken}`,
                      'Accept': 'application/json'
                    }
                  });
                  
                  if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    results.businessReviewManagementApi = {
                      success: true,
                      message: 'Successfully connected to Business Review Management API',
                      details: {
                        totalReviewCount: reviewsData.totalReviewCount || 0
                      }
                    };
                  } else {
                    const errorData = await reviewsResponse.json().catch(() => ({}));
                    results.businessReviewManagementApi = {
                      success: false,
                      message: `Failed to connect to Business Review Management API with status ${reviewsResponse.status}`,
                      details: errorData
                    };
                  }
                } catch (reviewsError) {
                  results.businessReviewManagementApi = {
                    success: false,
                    message: 'Error connecting to Business Review Management API',
                    details: reviewsError instanceof Error ? { error: reviewsError.message } : { error: 'Unknown error' }
                  };
                }
                
                // Test 5: Performance API
                try {
                  const timeRange = {
                    startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date().toISOString()
                  };
                  
                  const performanceUrl = `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:fetchMetricTimeSeries`;
                  const performanceResponse = await fetch(performanceUrl, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${oauthToken}`,
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      timeRange,
                      metric: 'QUERIES_DIRECT'
                    })
                  });
                  
                  if (performanceResponse.ok) {
                    const performanceData = await performanceResponse.json();
                    results.performanceApi = {
                      success: true,
                      message: 'Successfully connected to Business Profile Performance API',
                      details: performanceData
                    };
                  } else {
                    const errorData = await performanceResponse.json().catch(() => ({}));
                    results.performanceApi = {
                      success: false,
                      message: `Failed to connect to Business Profile Performance API with status ${performanceResponse.status}`,
                      details: errorData
                    };
                  }
                } catch (performanceError) {
                  results.performanceApi = {
                    success: false,
                    message: 'Error connecting to Business Profile Performance API',
                    details: performanceError instanceof Error ? { error: performanceError.message } : { error: 'Unknown error' }
                  };
                }
                
                // Test 6: Verifications API
                try {
                  const verificationsUrl = `https://mybusinessverifications.googleapis.com/v1/locations/${locationId}/verifications`;
                  const verificationsResponse = await fetch(verificationsUrl, {
                    headers: {
                      'Authorization': `Bearer ${oauthToken}`,
                      'Accept': 'application/json'
                    }
                  });
                  
                  if (verificationsResponse.ok) {
                    const verificationsData = await verificationsResponse.json();
                    results.verificationsApi = {
                      success: true,
                      message: 'Successfully connected to Verifications API',
                      details: verificationsData
                    };
                  } else {
                    const errorData = await verificationsResponse.json().catch(() => ({}));
                    results.verificationsApi = {
                      success: false,
                      message: `Failed to connect to Verifications API with status ${verificationsResponse.status}`,
                      details: errorData
                    };
                  }
                } catch (verificationsError) {
                  results.verificationsApi = {
                    success: false,
                    message: 'Error connecting to Verifications API',
                    details: verificationsError instanceof Error ? { error: verificationsError.message } : { error: 'Unknown error' }
                  };
                }
              } else {
                // No locations found
                if (results.businessInformationApi.details) {
                  results.businessInformationApi.details.warning = "Account has no locations, couldn't test location-dependent APIs";
                } else {
                  results.businessInformationApi.details = {
                    warning: "Account has no locations, couldn't test location-dependent APIs"
                  };
                }
              }
            } else {
              const errorData = await locationsResponse.json().catch(() => ({}));
              results.businessInformationApi = {
                success: false,
                message: `Failed to connect to Business Information API with status ${locationsResponse.status}`,
                details: errorData
              };
            }
          } catch (locationsError) {
            results.businessInformationApi = {
              success: false,
              message: 'Error connecting to Business Information API',
              details: locationsError instanceof Error ? { error: locationsError.message } : { error: 'Unknown error' }
            };
          }
        } else {
          // No accounts found
          if (results.accountManagementApi.details) {
            results.accountManagementApi.details.warning = "No accounts found, couldn't test account-dependent APIs";
          } else {
            results.accountManagementApi.details = {
              warning: "No accounts found, couldn't test account-dependent APIs"
            };
          }
        }
      } else {
        const errorData = await accountsResponse.json().catch(() => ({}));
        results.accountManagementApi = {
          success: false,
          message: `Failed to connect to Account Management API with status ${accountsResponse.status}`,
          details: errorData
        };
      }
    } catch (accountsError) {
      results.accountManagementApi = {
        success: false,
        message: 'Error connecting to Account Management API',
        details: accountsError instanceof Error ? { error: accountsError.message } : { error: 'Unknown error' }
      };
    }
    
    // Return all results
    return NextResponse.json({
      success: true,
      message: 'API connectivity test completed',
      results,
      oauthTokenPresent: true,
      apiHelpText: {
        accountManagementApi: {
          name: "My Business Account Management API",
          description: "Handles account information and permissions",
          apiEnable: "mybusinessaccountmanagement.googleapis.com"
        },
        businessInformationApi: {
          name: "My Business Business Information API",
          description: "Handles business location information",
          apiEnable: "mybusinessbusinessinformation.googleapis.com"
        },
        legacyMyBusinessApi: {
          name: "Google My Business API (Legacy)",
          description: "Legacy API for business data including reviews",
          apiEnable: "mybusiness.googleapis.com"
        },
        businessReviewManagementApi: {
          name: "Business Review Management API",
          description: "Modern API for business reviews",
          apiEnable: "mybusinessreviews.googleapis.com"
        },
        performanceApi: {
          name: "Business Profile Performance API",
          description: "API for performance metrics like impressions, website clicks, etc.",
          apiEnable: "businessprofileperformance.googleapis.com"
        },
        verificationsApi: {
          name: "My Business Verifications API",
          description: "API for verification status and processes",
          apiEnable: "mybusinessverifications.googleapis.com"
        }
      }
    });
  } catch (error) {
    console.error('Error testing API connectivity:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error running API tests' },
      { status: 500 }
    );
  }
} 