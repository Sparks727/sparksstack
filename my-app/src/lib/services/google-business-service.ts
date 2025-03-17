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
      
      // Make a more robust request with better error handling
      const response = await fetch(`${this.baseUrl}/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // The next line is important for handling CORS in development and production
        mode: 'cors',
      });
      
      // Handle specific error codes better
      if (!response.ok) {
        let errorMessage = '';
        // Define a specific interface for the error data
        let errorData: { error?: { message?: string } } = {};
        
        try {
          errorData = await response.json();
          errorMessage = errorData.error?.message || response.statusText;
        } catch {
          // If the response is not JSON, use text instead
          const errorText = await response.text().catch(() => 'Failed to parse error response');
          errorMessage = errorText || response.statusText;
        }
        
        // Return more detailed error information
        return {
          success: false,
          status: response.status,
          error: errorMessage,
          message: `Failed to connect to Google Business Profile API (${response.status}: ${errorMessage})`,
          details: errorData
        };
      }
      
      // Parse the successful response
      const data = await response.json();
      return {
        success: true,
        data,
        message: 'Successfully connected to Google Business Profile API'
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