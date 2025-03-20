import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * API endpoint to fetch reviews for a business location
 * This uses the Google My Business API to get reviews
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
    
    // Fetch reviews using the Google My Business API
    const reviewsUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?pageSize=${pageSize}&orderBy=${orderBy}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    
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
        message: 'Successfully retrieved reviews',
        locationId,
        accountId,
        reviews: reviewsData.reviews || [],
        totalReviewCount: reviewsData.totalReviewCount || 0,
        averageRating: reviewsData.averageRating || 0,
        nextPageToken: reviewsData.nextPageToken || null
      });
    } else {
      // Handle error response
      const errorData = await reviewsResponse.json().catch(() => ({}));
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch reviews',
        locationId,
        accountId,
        details: errorData,
        status: reviewsResponse.status,
        message: 'Reviews API endpoint failed. Make sure the Google My Business API is enabled and you have proper permissions.'
      }, { status: reviewsResponse.status });
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
    
    // Reply to the review using the Google My Business API
    const replyUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;
    
    const replyResponse = await fetch(replyUrl, {
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

    if (replyResponse.ok) {
      const replyData = await replyResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'Successfully replied to review',
        reply: replyData
      });
    } else {
      // Handle error response
      const errorData = await replyResponse.json().catch(() => ({}));
      
      return NextResponse.json({
        success: false,
        error: 'Failed to reply to review',
        details: errorData,
        status: replyResponse.status,
        message: 'Review reply API endpoint failed. Make sure the Google My Business API is enabled and you have proper permissions.'
      }, { status: replyResponse.status });
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
    
    // Delete the review reply using the Google My Business API
    const deleteUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${oauthToken}`,
        'Accept': 'application/json'
      }
    });

    if (deleteResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Successfully deleted review reply'
      });
    } else {
      // Handle error response
      const errorData = await deleteResponse.json().catch(() => ({}));
      
      return NextResponse.json({
        success: false,
        error: 'Failed to delete review reply',
        details: errorData,
        status: deleteResponse.status,
        message: 'Delete review reply API endpoint failed. Make sure the Google My Business API is enabled and you have proper permissions.'
      }, { status: deleteResponse.status });
    }
  } catch (error) {
    console.error('Error deleting review reply:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 