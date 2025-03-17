import { clerkClient, getAuth } from '@clerk/nextjs/server';

/**
 * Google Business Profile API Service
 * This service handles interactions with the Google Business Profile API
 * It uses the OAuth tokens obtained through Clerk's Google OAuth provider
 */
export class GoogleBusinessService {
  private readonly baseUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1';
  
  /**
   * Get the authenticated user's accounts
   * @returns A list of Google Business Profile accounts
   */
  async getAccounts() {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching business accounts:', error);
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
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }
  
  /**
   * Get reviews for a specific location
   * @param locationId The location ID
   * @returns A list of reviews for this location
   */
  async getReviews(locationId: string) {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }
    
    try {
      // Note: Reviews API is on a different base URL
      const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }
  
  /**
   * Reply to a review
   * @param reviewId The review ID
   * @param reply The reply text
   * @returns The updated review
   */
  async replyToReview(reviewId: string, reply: string) {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }
    
    try {
      const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: reply })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error replying to review:', error);
      throw error;
    }
  }
  
  /**
   * Helper method to get the Google access token from Clerk
   * @returns The Google access token or null if not available
   */
  private async getAccessToken(): Promise<string | null> {
    const auth = getAuth();
    if (!auth?.userId) return null;
    
    try {
      // Get the user's OAuth tokens from Clerk
      const userId = auth.userId;
      const user = await clerkClient.users.getUser(userId);
      
      // Find the Google OAuth account
      const googleAccount = user.externalAccounts.find(
        account => account.provider === 'google'
      );
      
      if (!googleAccount) {
        console.error('No Google account connected');
        return null;
      }
      
      return googleAccount.accessToken || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }
} 