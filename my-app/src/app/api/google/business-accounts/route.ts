import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface BusinessAccount {
  name: string;
  accountName: string;
  accountNumber?: string;
  type: string;
  role?: string;
  verificationState?: string;
  storeCode?: string;
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
    
    console.log("Fetching accounts from:", accountsUrl);
    
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
    
    // Get basic account information first
    const accounts = accountsData.accounts.map((account: BusinessAccount) => ({
      id: account.name.split('/').pop(),
      name: account.accountName,
      accountNumber: account.accountNumber || null,
      type: account.type,
      role: account.role || 'OWNER',
      fullResource: account.name,
      verificationState: 'UNKNOWN' // Will be updated if possible
    }));
    
    // Fetch additional account verification data from the Verifications API if available
    try {
      // For each account, try to get first location to check verification state
      await Promise.all(accounts.map(async (account: {
        id: string;
        name: string;
        accountNumber: string | null;
        type: string;
        role: string;
        fullResource: string;
        verificationState: string;
        isVerified?: boolean;
        storeCode?: string;
      }) => {
        try {
          const locationsUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${account.fullResource}/locations?pageSize=1`;
          
          const locationsResponse = await fetch(locationsUrl, {
            headers: {
              'Authorization': `Bearer ${oauthToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            
            if (locationsData.locations && locationsData.locations.length > 0) {
              const location = locationsData.locations[0];
              
              // Check for verification state in the location data
              if (location.metadata && location.metadata.verificationState) {
                account.verificationState = location.metadata.verificationState;
              } else if (location.verificationState) {
                account.verificationState = location.verificationState;
              }
              
              // Check if the location is permanently closed
              if (location.metadata && location.metadata.hasOwnProperty('isVerified')) {
                account.isVerified = location.metadata.isVerified;
              }
              
              // Check if the location has a store code (useful for franchises)
              if (location.storeCode) {
                account.storeCode = location.storeCode;
              }
            }
          }
        } catch (locationError) {
          console.log(`Error fetching location for account ${account.id}:`, locationError);
          // Continue with next account
        }
      }));
    } catch (verificationError) {
      console.log("Error fetching verification data:", verificationError);
      // Continue with the accounts we have
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully retrieved business accounts',
      totalAccounts: accounts.length,
      accounts: accounts,
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