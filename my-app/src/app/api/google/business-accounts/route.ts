import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface BusinessAccount {
  name: string;
  accountName: string;
  accountNumber?: string;
  type: string;
  role?: string;
}

/**
 * API endpoint to fetch business accounts from Google Business Profile
 * Using the Account Management API which we've confirmed is working
 */
export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const pageSize = searchParams.get('pageSize') || '100'; // Default to 100 results
    const pageToken = searchParams.get('pageToken') || '';
    
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
    
    // Fetch accounts from the Account Management API
    let accountsUrl = `https://mybusinessaccountmanagement.googleapis.com/v1/accounts?pageSize=${pageSize}`;
    
    // Add pageToken if provided
    if (pageToken) {
      accountsUrl += `&pageToken=${pageToken}`;
    }
    
    const accountsResponse = await fetch(accountsUrl, {
      headers: {
        'Authorization': `Bearer ${oauthToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!accountsResponse.ok) {
      const errorData = await accountsResponse.json();
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch business accounts',
        details: errorData,
        status: accountsResponse.status
      }, { status: accountsResponse.status });
    }
    
    const accountsData = await accountsResponse.json();
    
    // Format the response to include only essential account information
    const formattedAccounts = accountsData.accounts.map((account: BusinessAccount) => ({
      id: account.name.split('/').pop(),
      name: account.accountName,
      accountNumber: account.accountNumber || null,
      type: account.type,
      role: account.role || 'OWNER',
      fullResource: account.name
    }));
    
    return NextResponse.json({
      success: true,
      message: 'Successfully retrieved business accounts',
      totalAccounts: formattedAccounts.length,
      accounts: formattedAccounts,
      nextPageToken: accountsData.nextPageToken || null,
      pageSize: parseInt(pageSize)
    });
    
  } catch (error) {
    console.error('Error fetching business accounts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 