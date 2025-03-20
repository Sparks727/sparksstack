/**
 * Google Business Profile API Service
 * This service handles interactions with the Google Business Profile API
 * It uses the OAuth tokens obtained through Clerk's Google OAuth provider
 */
export class GoogleBusinessService {
  // API endpoints to use the v4 API and proper format
  private readonly baseUrl = 'https://mybusinessaccountmanagement.googleapis.com/v1';
  private readonly businessInfoUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1';
  private readonly reviewsUrl = 'https://mybusinessreviews.googleapis.com/v1';
  private accessToken: string | null = null;
  
  /**
   * Constructor that can accept an access token directly
   */
  constructor(accessToken?: string) {
    if (accessToken) {
      this.accessToken = accessToken;
    }
  }
  
  /**
   * Set the access token for API calls
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }
  
  /**
   * Test API connection by attempting to get accounts
   */
  async testConnection() {
    try {
      const token = this.accessToken;
      if (!token) {
        throw new Error('No access token available');
      }
      
      // Log token details for debugging (only first few chars)
      console.log('Using token (first 15 chars):', token.substring(0, 15) + '...');
      console.log('Token length:', token.length);
      
      // Raw OAuth tokens typically don't start with 'eyJ' (JWT format) and don't have dots
      // They're usually longer strings of random characters
      const isProbablyRawOAuth = !token.startsWith('eyJ') && !token.includes('.');
      console.log('Token appears to be a raw OAuth token:', isProbablyRawOAuth);
      
      // Check for common token format issues
      if (token.startsWith('eyJ') && token.includes('.')) {
        console.warn('⚠️ Token appears to be a JWT, not a raw OAuth token. Google APIs typically expect a raw OAuth token.');
      }
      
      if (token.startsWith('{') && token.endsWith('}')) {
        console.warn('⚠️ Token appears to be a JSON string, not a raw OAuth token. Please extract the actual token from this JSON.');
        try {
          const parsed = JSON.parse(token);
          console.log('JSON token contains keys:', Object.keys(parsed));
        } catch (e) {
          console.error('Failed to parse JSON token:', e);
        }
      }
      
      // Check if token appears to be in JWT format (rough check)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Token does not appear to be in standard JWT format (expected 3 parts separated by dots)');
      } else {
        try {
          // Decode the payload (middle part) to check claims
          const payloadBase64 = tokenParts[1];
          // Add padding if needed
          const padding = '='.repeat((4 - payloadBase64.length % 4) % 4);
          const base64 = (payloadBase64 + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
          
          const jsonPayload = decodeURIComponent(atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''));
          
          const payload = JSON.parse(jsonPayload);
          console.log('Token payload:', payload);
          
          // Check for critical fields
          if (payload.exp) {
            const expiryDate = new Date(payload.exp * 1000);
            const now = new Date();
            console.log('Token expires:', expiryDate.toISOString());
            console.log('Token expired:', expiryDate < now);
          }
          
          // Check for scope
          if (payload.scope) {
            console.log('Token scopes:', payload.scope);
            const hasBusinessScope = payload.scope.includes('business.manage');
            console.log('Has business.manage scope:', hasBusinessScope);
          }
        } catch (e) {
          console.warn('Failed to decode token payload:', e);
        }
      }
      
      // First, try a simpler Google API to test if the token is valid at all
      // The People API is commonly accessible and a good test
      try {
        console.log('Testing token validity with People API');
        const peopleResponse = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('People API response:', peopleResponse.status, peopleResponse.statusText);
        
        if (!peopleResponse.ok) {
          // If this fails, the token itself is likely invalid
          const errorData = await peopleResponse.json().catch(() => ({}));
          return {
            success: false,
            status: peopleResponse.status,
            error: errorData.error?.message || 'Invalid OAuth token',
            message: 'OAuth token validation failed. The token may be invalid or expired.',
            details: {
              ...errorData,
              suggestion: "Try reconnecting your Google account in Clerk settings"
            }
          };
        }
        
        console.log('Token is valid for People API');
        
        // Also try the userinfo endpoint which is often more reliable
        const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('UserInfo API response:', userinfoResponse.status, userinfoResponse.statusText);
        
        if (userinfoResponse.ok) {
          console.log('Token is valid for UserInfo API');
        }
      } catch (peopleError) {
        console.error('Error testing token with People API:', peopleError);
      }
      
      // Try each Business Profile API endpoint
      const endpoints = [
        { url: `${this.baseUrl}/accounts`, name: 'accounts' },
        { url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts', name: 'accounts (direct)' },
        { url: `${this.baseUrl}/accountsById`, name: 'accountsById' },
        { url: 'https://mybusinessbusinessinformation.googleapis.com/v1/chains', name: 'chains' },
        { url: 'https://businessprofileperformance.googleapis.com/v1/locations', name: 'businessPerformance' }
      ];
      
      let lastError = null;
      
      // Try each endpoint
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint.name} (${endpoint.url})`);
          
          const response = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log(`Response from ${endpoint.name}:`, response.status, response.statusText);
          
          if (response.ok) {
            const data = await response.json();
            return {
              success: true,
              data,
              message: `Successfully connected to Google Business Profile API via ${endpoint.name} endpoint`,
              endpointTested: endpoint.name
            };
          }
          
          // If not ok, store error for later
          const errorData = await response.json().catch(() => ({}));
          lastError = {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error?.message || errorData.error || response.statusText,
            endpoint: endpoint.name,
            details: errorData
          };
          
          // Special case for 403 errors - may indicate permissions issue rather than auth issue
          if (response.status === 403) {
            return {
              success: false,
              status: response.status,
              error: errorData.error?.message || 'Access forbidden. API may not be enabled or permissions not granted.',
              message: `Failed to connect to Google Business Profile API (403 Forbidden). Please ensure the API is enabled in Google Cloud Console and your account has sufficient permissions.`,
              details: {
                ...errorData,
                suggestedFix: "Enable the Google Business Profile API in your Google Cloud Console and ensure your Google account has access to manage business profiles."
              }
            };
          }
        } catch (endpointError) {
          console.error(`Error testing ${endpoint.name} endpoint:`, endpointError);
        }
      }
      
      // If we got here, all endpoints failed
      if (lastError) {
        return {
          success: false,
          status: lastError.status,
          error: lastError.error || 'Failed to connect to all API endpoints',
          message: `Failed to connect to Google Business Profile API (${lastError.status}: ${lastError.error})`,
          details: {
            ...lastError.details,
            testedEndpoints: endpoints.map(e => e.name),
            suggestions: [
              "Ensure the Google Business Profile API is enabled in your Google Cloud Console",
              "Make sure to enable 'Business Profile Performance API', 'My Business API' and related APIs",
              "Verify that your Google account has access to Google Business Profile",
              "Check that the OAuth scope includes https://www.googleapis.com/auth/business.manage",
              "Visit business.google.com to confirm you have access to business profiles",
              "Verify that your Clerk JWT template is correctly configured"
            ]
          }
        };
      }
      
      // Generic error if no specific error was captured
      return {
        success: false,
        error: 'Failed to connect to all API endpoints',
        message: 'Unable to establish connection with any Google Business Profile API endpoint',
        isNetworkError: true
      };
    } catch (error) {
      console.error('Google Business API test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: 'Error testing connection to Google Business Profile API',
        isNetworkError: true
      };
    }
  }
  
  /**
   * Get the authenticated user's accounts
   */
  async getAccounts() {
    try {
      const token = this.accessToken;
      if (!token) {
        throw new Error('No access token available');
      }
      
      const response = await fetch(`${this.baseUrl}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }
  
  /**
   * Get locations for a specific account
   * @param accountId The Google Business Profile account ID
   * @returns A list of locations under this account
   */
  async getLocations(accountId: string) {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }
    
    try {
      console.log('Making API request to get locations:', `${this.businessInfoUrl}/${accountId}/locations`);
      const response = await fetch(`${this.businessInfoUrl}/${accountId}/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Locations API response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }
  
  /**
   * Get reviews for a specific location
   * @param locationName The location name/path
   * @returns A list of reviews for this location
   */
  async getReviews(locationName: string) {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }
    
    try {
      console.log('Making API request to get reviews:', `${this.reviewsUrl}/${locationName}/reviews`);
      const response = await fetch(`${this.reviewsUrl}/${locationName}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Reviews API response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }
  
  /**
   * Reply to a review
   * @param reviewName The review name/path
   * @param reply The reply text
   * @returns The updated review
   */
  async replyToReview(reviewName: string, reply: string) {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }
    
    try {
      console.log('Making API request to reply to review:', `${this.reviewsUrl}/${reviewName}/reply`);
      const response = await fetch(`${this.reviewsUrl}/${reviewName}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: reply })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Reply API response data:', data);
      return data;
    } catch (error) {
      console.error('Error replying to review:', error);
      throw error;
    }
  }
  
  /**
   * Get locations the user has access to without requiring account ownership
   * This is useful for manager access where the user doesn't own the business
   * @returns A list of locations the user has access to
   */
  async getAccessibleLocations() {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }
    
    try {
      console.log('Making API request to get accessible locations:', `${this.baseUrl}/locations`);
      console.log('Authorization header (first 15 chars):', `Bearer ${token.substring(0, 15)}...`);
      
      const response = await fetch(`${this.baseUrl}/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        // Add more detailed error logging
        if (response.status === 403) {
          console.error('403 Forbidden: This typically means the API is not enabled in your Google Cloud Project');
        } else if (response.status === 401) {
          console.error('401 Unauthorized: This typically means token issues or insufficient permissions');
        } else if (response.status === 404) {
          console.error('404 Not Found: This endpoint may be incorrect or the API might have changed');
        }
        
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Accessible locations API response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching accessible locations:', error);
      throw error;
    }
  }
  
  /**
   * Helper method to get the Google access token
   * @returns The Google access token or null if not available
   */
  private async getAccessToken(): Promise<string | null> {
    // If token was provided to constructor or set manually, use it
    if (this.accessToken) {
      return this.accessToken;
    }
    
    // Otherwise, return null (token should be passed from client components)
    return null;
  }
} 