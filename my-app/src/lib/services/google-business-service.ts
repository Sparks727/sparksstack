/**
 * Google Business Profile API Service
 * This service handles interactions with the Google Business Profile API
 * It uses the OAuth tokens obtained through Clerk's Google OAuth provider
 */
export class GoogleBusinessService {
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
   * Get the authenticated user's accounts
   * @returns A list of Google Business Profile accounts
   */
  async getAccounts() {
    // Always use mock data if environment variable is set
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      console.log('Using mock account data based on environment variable');
      return {
        accounts: [
          {
            name: 'accounts/123456789',
            accountName: 'Blue Sky Roofing',
            type: 'LOCATION_GROUP',
            role: 'OWNER',
            verificationState: 'VERIFIED'
          }
        ]
      };
    }
    
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }
    
    try {
      console.log('Making API request to get accounts:', `${this.baseUrl}/accounts`);
      const response = await fetch(`${this.baseUrl}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        // For development/testing purposes: Return mock data if API fails
        if (process.env.NODE_ENV === 'development') {
          console.log('Returning mock account data for development');
          return {
            accounts: [
              {
                name: 'accounts/123456789',
                accountName: 'Blue Sky Roofing',
                type: 'LOCATION_GROUP',
                role: 'OWNER',
                verificationState: 'VERIFIED'
              }
            ]
          };
        }
        
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Accounts API response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching business accounts:', error);
      
      // For development/testing purposes: Return mock data if any error occurs
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock account data after error');
        return {
          accounts: [
            {
              name: 'accounts/123456789',
              accountName: 'Blue Sky Roofing',
              type: 'LOCATION_GROUP',
              role: 'OWNER',
              verificationState: 'VERIFIED'
            }
          ]
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Get locations for a specific account
   * @param accountId The Google Business Profile account ID
   * @returns A list of locations under this account
   */
  async getLocations(accountId: string) {
    // Always use mock data if environment variable is set
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      console.log('Using mock location data based on environment variable');
      return {
        locations: [
          {
            name: `${accountId}/locations/abcdefg`,
            title: 'Blue Sky Roofing - Main Office',
            address: {
              formattedAddress: '123 Main St, Arlington, TX 76010'
            },
            primaryPhone: '+18175551234'
          },
          {
            name: `${accountId}/locations/hijklmn`,
            title: 'Blue Sky Roofing - Dallas Branch',
            address: {
              formattedAddress: '456 Commerce Ave, Dallas, TX 75001'
            },
            primaryPhone: '+12145556789'
          }
        ]
      };
    }
    
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
        
        // For development/testing purposes: Return mock data if API fails
        if (process.env.NODE_ENV === 'development') {
          console.log('Returning mock location data for development');
          return {
            locations: [
              {
                name: `${accountId}/locations/abcdefg`,
                title: 'Blue Sky Roofing - Main Office',
                address: {
                  formattedAddress: '123 Main St, Arlington, TX 76010'
                },
                primaryPhone: '+18175551234'
              },
              {
                name: `${accountId}/locations/hijklmn`,
                title: 'Blue Sky Roofing - Dallas Branch',
                address: {
                  formattedAddress: '456 Commerce Ave, Dallas, TX 75001'
                },
                primaryPhone: '+12145556789'
              }
            ]
          };
        }
        
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Locations API response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      
      // For development/testing purposes: Return mock data if any error occurs
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock location data after error');
        return {
          locations: [
            {
              name: `${accountId}/locations/abcdefg`,
              title: 'Blue Sky Roofing - Main Office',
              address: {
                formattedAddress: '123 Main St, Arlington, TX 76010'
              },
              primaryPhone: '+18175551234'
            },
            {
              name: `${accountId}/locations/hijklmn`,
              title: 'Blue Sky Roofing - Dallas Branch',
              address: {
                formattedAddress: '456 Commerce Ave, Dallas, TX 75001'
              },
              primaryPhone: '+12145556789'
            }
          ]
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Get reviews for a specific location
   * @param locationName The location name/path
   * @returns A list of reviews for this location
   */
  async getReviews(locationName: string) {
    // Always use mock data if environment variable is set
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      console.log('Using mock review data based on environment variable');
      return {
        reviews: [
          {
            name: `${locationName}/reviews/abc123`,
            starRating: 5,
            comment: "Excellent service and quality work! The team was very professional.",
            createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            reviewer: { displayName: "John Smith" }
          },
          {
            name: `${locationName}/reviews/def456`,
            starRating: 4,
            comment: "Good work overall. Would use again.",
            createTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            reviewer: { displayName: "Sarah Johnson" }
          },
          {
            name: `${locationName}/reviews/ghi789`,
            starRating: 5,
            comment: "Best roofing company in the area. Highly recommend!",
            createTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            reviewer: { displayName: "Michael Williams" }
          }
        ]
      };
    }
    
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
        
        // For development/testing purposes: Return mock data if API fails
        if (process.env.NODE_ENV === 'development') {
          console.log('Returning mock review data for development');
          return {
            reviews: [
              {
                name: `${locationName}/reviews/abc123`,
                starRating: 5,
                comment: "Excellent service and quality work! The team was very professional.",
                createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                reviewer: { displayName: "John Smith" }
              },
              {
                name: `${locationName}/reviews/def456`,
                starRating: 4,
                comment: "Good work overall. Would use again.",
                createTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                reviewer: { displayName: "Sarah Johnson" }
              },
              {
                name: `${locationName}/reviews/ghi789`,
                starRating: 5,
                comment: "Best roofing company in the area. Highly recommend!",
                createTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                reviewer: { displayName: "Michael Williams" }
              }
            ]
          };
        }
        
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Reviews API response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      
      // For development/testing purposes: Return mock data if any error occurs
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock review data after error');
        return {
          reviews: [
            {
              name: `${locationName}/reviews/abc123`,
              starRating: 5,
              comment: "Excellent service and quality work! The team was very professional.",
              createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              reviewer: { displayName: "John Smith" }
            },
            {
              name: `${locationName}/reviews/def456`,
              starRating: 4,
              comment: "Good work overall. Would use again.",
              createTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              reviewer: { displayName: "Sarah Johnson" }
            },
            {
              name: `${locationName}/reviews/ghi789`,
              starRating: 5,
              comment: "Best roofing company in the area. Highly recommend!",
              createTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
              reviewer: { displayName: "Michael Williams" }
            }
          ]
        };
      }
      
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
    // Always use mock data if environment variable is set
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      console.log('Using mock reply data based on environment variable');
      return {
        name: reviewName,
        reply: {
          comment: reply,
          updateTime: new Date().toISOString()
        }
      };
    }
    
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
        
        // For development/testing purposes: Return mock data if API fails
        if (process.env.NODE_ENV === 'development') {
          console.log('Returning mock reply data for development');
          return {
            name: reviewName,
            reply: {
              comment: reply,
              updateTime: new Date().toISOString()
            }
          };
        }
        
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Reply API response data:', data);
      return data;
    } catch (error) {
      console.error('Error replying to review:', error);
      
      // For development/testing purposes: Return mock data if any error occurs
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock reply data after error');
        return {
          name: reviewName,
          reply: {
            comment: reply,
            updateTime: new Date().toISOString()
          }
        };
      }
      
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