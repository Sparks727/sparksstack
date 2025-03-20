import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * API endpoint to fetch reviews for a business location
 * This uses the Google Business Profile API to get reviews
 */
export async function GET(request: Request) {
  try {
    // Get location ID from query parameter
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const accountId = searchParams.get('accountId');
    const pageSize = searchParams.get('pageSize') || '20';
    const pageToken = searchParams.get('pageToken') || '';
    const orderBy = searchParams.get('orderBy') || 'updateTime';
    
    if (!locationId || !accountId) {
      return NextResponse.json(
        { error: 'Missing locationId or accountId query parameter' },
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
    
    // Construct the full location name
    const locationName = `accounts/${accountId}/locations/${locationId}`;
    
    // Try the newer Business Profile API first
    try {
      // First approach: Use the newer mybusinessreviews.googleapis.com API
      const reviewsUrl = `https://mybusinessreviews.googleapis.com/v1/${locationName}/reviews?pageSize=${pageSize}${pageToken ? `&pageToken=${pageToken}` : ''}`;
      
      const reviewsResponse = await fetch(reviewsUrl, {
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        
        return NextResponse.json({
          success: true,
          message: 'Successfully retrieved reviews with new API',
          locationId,
          accountId,
          reviews: reviewsData.reviews || [],
          totalReviewCount: reviewsData.totalReviewCount || 0,
          averageRating: reviewsData.averageRating || 0,
          nextPageToken: reviewsData.nextPageToken || null
        });
      } else {
        // If the first approach fails, try a fallback approach
        throw new Error(`New API failed with status ${reviewsResponse.status}`);
      }
    } catch (newApiError) {
      console.warn("New reviews API failed, trying legacy API:", newApiError);
      
      // Fallback to the legacy API
      try {
        // Fallback: Try the legacy Google My Business API
        const legacyReviewsUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?pageSize=${pageSize}&orderBy=${orderBy}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        
        const legacyResponse = await fetch(legacyReviewsUrl, {
          headers: {
            'Authorization': `Bearer ${oauthToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (legacyResponse.ok) {
          const legacyData = await legacyResponse.json();
          
          return NextResponse.json({
            success: true,
            message: 'Successfully retrieved reviews with legacy API',
            locationId,
            accountId,
            reviews: legacyData.reviews || [],
            totalReviewCount: legacyData.totalReviewCount || 0,
            averageRating: legacyData.averageRating || 0,
            nextPageToken: legacyData.nextPageToken || null,
            usingLegacyApi: true
          });
        } else {
          // Both APIs failed
          const errorData = await legacyResponse.json().catch(() => ({}));
          
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch reviews from both new and legacy APIs',
            locationId,
            accountId,
            details: errorData,
            status: legacyResponse.status,
            message: 'Make sure either the Business Review Management API or Google My Business API is enabled and you have proper permissions.'
          }, { status: legacyResponse.status });
        }
      } catch (legacyError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch reviews from both APIs',
          newApiError: newApiError instanceof Error ? newApiError.message : 'Unknown error with new API',
          legacyError: legacyError instanceof Error ? legacyError.message : 'Unknown error with legacy API',
          locationId,
          accountId,
          message: 'Make sure either the Business Review Management API or Google My Business API is enabled and you have proper permissions.'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to reply to a review
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { accountId, locationId, reviewId, comment } = body;
    
    if (!accountId || !locationId || !reviewId || !comment) {
      return NextResponse.json(
        { error: 'Missing required parameters: accountId, locationId, reviewId, and comment are required' },
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
    
    // Construct the full location and review name
    const reviewName = `accounts/${accountId}/locations/${locationId}/reviews/${reviewId}`;
    
    // Try the newer Business Profile API first
    try {
      // First approach: Use the newer mybusinessreviews API
      const replyUrl = `https://mybusinessreviews.googleapis.com/v1/${reviewName}:reply`;
      
      const replyResponse = await fetch(replyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: comment
        })
      });

      if (replyResponse.ok) {
        const replyData = await replyResponse.json();
        
        return NextResponse.json({
          success: true,
          message: 'Successfully replied to review with new API',
          reply: replyData
        });
      } else {
        // If the first approach fails, try a fallback approach
        throw new Error(`New API failed with status ${replyResponse.status}`);
      }
    } catch (newApiError) {
      console.warn("New reviews API failed for reply, trying legacy API:", newApiError);
      
      // Fallback to the legacy API
      try {
        // Fallback: Try the legacy Google My Business API
        const legacyReplyUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;
        
        const legacyResponse = await fetch(legacyReplyUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${oauthToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            comment: comment
          })
        });

        if (legacyResponse.ok) {
          const legacyData = await legacyResponse.json();
          
          return NextResponse.json({
            success: true,
            message: 'Successfully replied to review with legacy API',
            reply: legacyData,
            usingLegacyApi: true
          });
        } else {
          // Both APIs failed
          const errorData = await legacyResponse.json().catch(() => ({}));
          
          return NextResponse.json({
            success: false,
            error: 'Failed to reply to review using both new and legacy APIs',
            details: errorData,
            status: legacyResponse.status,
            message: 'Make sure either the Business Review Management API or Google My Business API is enabled and you have proper permissions.'
          }, { status: legacyResponse.status });
        }
      } catch (legacyError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to reply to review using both APIs',
          newApiError: newApiError instanceof Error ? newApiError.message : 'Unknown error with new API',
          legacyError: legacyError instanceof Error ? legacyError.message : 'Unknown error with legacy API',
          message: 'Make sure either the Business Review Management API or Google My Business API is enabled and you have proper permissions.'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error replying to review:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to delete a review reply
 */
export async function DELETE(request: Request) {
  try {
    // Get parameters from query
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const locationId = searchParams.get('locationId');
    const reviewId = searchParams.get('reviewId');
    
    if (!accountId || !locationId || !reviewId) {
      return NextResponse.json(
        { error: 'Missing required parameters: accountId, locationId, and reviewId are required' },
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
    
    // Construct the full location and review name
    const reviewName = `accounts/${accountId}/locations/${locationId}/reviews/${reviewId}`;
    
    // Try the newer Business Profile API first
    try {
      // First approach: Use the newer mybusinessreviews API
      const deleteReplyUrl = `https://mybusinessreviews.googleapis.com/v1/${reviewName}:deleteReply`;
      
      const deleteResponse = await fetch(deleteReplyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (deleteResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'Successfully deleted review reply with new API'
        });
      } else {
        // If the first approach fails, try a fallback approach
        throw new Error(`New API failed with status ${deleteResponse.status}`);
      }
    } catch (newApiError) {
      console.warn("New reviews API failed for delete reply, trying legacy API:", newApiError);
      
      // Fallback to the legacy API
      try {
        // Fallback: Try the legacy Google My Business API
        const legacyDeleteUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;
        
        const legacyResponse = await fetch(legacyDeleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${oauthToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (legacyResponse.ok) {
          return NextResponse.json({
            success: true,
            message: 'Successfully deleted review reply with legacy API',
            usingLegacyApi: true
          });
        } else {
          // Both APIs failed
          const errorData = await legacyResponse.json().catch(() => ({}));
          
          return NextResponse.json({
            success: false,
            error: 'Failed to delete review reply using both new and legacy APIs',
            details: errorData,
            status: legacyResponse.status,
            message: 'Make sure either the Business Review Management API or Google My Business API is enabled and you have proper permissions.'
          }, { status: legacyResponse.status });
        }
      } catch (legacyError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to delete review reply using both APIs',
          newApiError: newApiError instanceof Error ? newApiError.message : 'Unknown error with new API',
          legacyError: legacyError instanceof Error ? legacyError.message : 'Unknown error with legacy API',
          message: 'Make sure either the Business Review Management API or Google My Business API is enabled and you have proper permissions.'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error deleting review reply:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 