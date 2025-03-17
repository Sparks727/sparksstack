'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { GoogleBusinessService } from '@/lib/services/google-business-service';

// Define proper types for the API responses
interface GoogleBusinessAccount {
  name: string;
  accountName?: string;
  type?: string;
  [key: string]: unknown;
}

interface GoogleBusinessLocation {
  name: string;
  title?: string;
  address?: {
    formattedAddress?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface GoogleBusinessReview {
  name: string;
  starRating?: number;
  comment?: string;
  createTime?: string;
  [key: string]: unknown;
}

interface GoogleBusinessData {
  accounts: GoogleBusinessAccount[];
  locations: GoogleBusinessLocation[];
  reviews: GoogleBusinessReview[];
  isLoading: boolean;
  error: string | null;
  debugInfo: {
    hasToken: boolean;
    tokenPrefix?: string;
    accountsError?: string;
    locationsError?: string;
    reviewsError?: string;
    oauthError?: string;
  };
}

export default function GoogleBusinessClient() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [googleBusinessData, setGoogleBusinessData] = useState<GoogleBusinessData>({
    accounts: [],
    locations: [],
    reviews: [],
    isLoading: true,
    error: null,
    debugInfo: {
      hasToken: false
    }
  });

  useEffect(() => {
    async function fetchGoogleBusinessData() {
      try {
        console.log("Attempting to fetch Google Business Profile data...");
        
        // Check if user has Google OAuth connection
        const googleAccount = user?.externalAccounts?.find(
          account => account.provider === 'google'
        );

        if (!googleAccount) {
          setGoogleBusinessData(prev => ({
            ...prev,
            isLoading: false,
            error: 'No Google account connected. Please connect your Google account in settings.',
            debugInfo: {
              ...prev.debugInfo,
              hasToken: false
            }
          }));
          return;
        }

        // Process scopes that might be in different formats
        let formattedScopes: string[] = [];
        if (googleAccount?.approvedScopes) {
          // If it's already an array, use it
          if (Array.isArray(googleAccount.approvedScopes)) {
            // Each array element might still contain multiple space-separated scopes
            formattedScopes = googleAccount.approvedScopes.flatMap(scope => 
              typeof scope === 'string' ? scope.split(' ') : [scope]
            );
          } 
          // If it's a string, split by spaces
          else if (typeof googleAccount.approvedScopes === 'string') {
            formattedScopes = googleAccount.approvedScopes.split(' ');
          }
        }
        
        // Check if business.manage scope is present
        const hasBusinessManageScope = formattedScopes.some(scope => 
          scope === 'https://www.googleapis.com/auth/business.manage'
        );

        if (!hasBusinessManageScope) {
          setGoogleBusinessData(prev => ({
            ...prev,
            isLoading: false,
            error: 'Missing required Google Business Profile permissions. Please disconnect and reconnect your Google account to grant the necessary permissions.',
            debugInfo: {
              ...prev.debugInfo,
              hasToken: false,
              accountsError: 'Missing business.manage scope'
            }
          }));
          return;
        }
        
        // Get OAuth token from Clerk for Google
        // You need to set up a JWT template named 'oauth_google' in the Clerk dashboard
        // with the Google Business Profile API scope: https://www.googleapis.com/auth/business.manage
        let token = null;
        try {
          token = await getToken({ template: 'oauth_google' });
          console.log("Token received:", token ? "Token found (first 10 chars): " + token.substring(0, 10) + "..." : "No token");
        } catch (tokenError: Error | unknown) {
          console.error("Error getting token:", tokenError);
          // Check for access_denied error which indicates Google verification issue
          if ((tokenError as Error)?.message?.includes('access_denied') || 
              tokenError?.toString().includes('access_denied')) {
            setGoogleBusinessData(prev => ({
              ...prev,
              isLoading: false,
              error: 'Access blocked: Your Google Cloud Project has not completed the verification process. During development, you need to add your Google account as a test user in the Google Cloud Console.',
              debugInfo: {
                ...prev.debugInfo,
                hasToken: false,
                oauthError: 'access_denied - Your Google account needs to be added as a test user'
              }
            }));
            return;
          }
        }
        
        if (!token) {
          setGoogleBusinessData(prev => ({
            ...prev,
            isLoading: false,
            error: 'No Google Business access token available. Please make sure your Google account is connected with Business Profile permissions in your account settings.',
            debugInfo: {
              hasToken: false
            }
          }));
          return;
        }
        
        // Initialize service with token
        const googleBusinessService = new GoogleBusinessService(token);
        
        // Update debug info with token status
        setGoogleBusinessData(prev => ({
          ...prev,
          debugInfo: {
            ...prev.debugInfo,
            hasToken: true,
            tokenPrefix: token.substring(0, 10) + "..."
          }
        }));
        
        // Fetch accounts
        console.log("Fetching Google Business accounts...");
        let accounts: GoogleBusinessAccount[] = [];
        try {
          const accountsResponse = await googleBusinessService.getAccounts();
          console.log("Accounts response:", accountsResponse);
          accounts = accountsResponse?.accounts || [];
        } catch (error) {
          console.error("Error fetching accounts:", error);
          setGoogleBusinessData(prev => ({
            ...prev,
            debugInfo: {
              ...prev.debugInfo,
              accountsError: error instanceof Error ? error.message : String(error)
            }
          }));
        }
        
        // If we have accounts, fetch locations for the first account
        let locations: GoogleBusinessLocation[] = [];
        let reviews: GoogleBusinessReview[] = [];
        
        if (accounts.length > 0) {
          console.log("Fetching locations for account:", accounts[0].name);
          try {
            const locationsResponse = await googleBusinessService.getLocations(accounts[0].name);
            console.log("Locations response:", locationsResponse);
            locations = locationsResponse?.locations || [];
          } catch (error) {
            console.error("Error fetching locations:", error);
            setGoogleBusinessData(prev => ({
              ...prev,
              debugInfo: {
                ...prev.debugInfo,
                locationsError: error instanceof Error ? error.message : String(error)
              }
            }));
          }
          
          // If we have locations, fetch reviews for the first location
          if (locations.length > 0) {
            console.log("Fetching reviews for location:", locations[0].name);
            try {
              const reviewsResponse = await googleBusinessService.getReviews(locations[0].name);
              console.log("Reviews response:", reviewsResponse);
              reviews = reviewsResponse?.reviews || [];
            } catch (error) {
              console.error("Error fetching reviews:", error);
              setGoogleBusinessData(prev => ({
                ...prev,
                debugInfo: {
                  ...prev.debugInfo,
                  reviewsError: error instanceof Error ? error.message : String(error)
                }
              }));
            }
          }
        } else {
          // No accounts found as owner, try to get locations with manager access
          console.log("No accounts found as owner, trying to get locations with manager access...");
          try {
            const accessibleLocationsResponse = await googleBusinessService.getAccessibleLocations();
            console.log("Accessible locations response:", accessibleLocationsResponse);
            if (accessibleLocationsResponse?.locations) {
              locations = accessibleLocationsResponse.locations;
            }
          } catch (error) {
            console.error("Error fetching accessible locations:", error);
            setGoogleBusinessData(prev => ({
              ...prev,
              debugInfo: {
                ...prev.debugInfo,
                locationsError: error instanceof Error ? error.message : String(error)
              }
            }));
          }
        }
        
        setGoogleBusinessData({
          accounts,
          locations,
          reviews,
          isLoading: false,
          error: null,
          debugInfo: {
            hasToken: true,
            tokenPrefix: token.substring(0, 10) + "...",
            accountsError: accounts.length === 0 ? "No accounts found" : undefined,
            locationsError: accounts.length > 0 && locations.length === 0 ? "No locations found" : undefined,
            reviewsError: locations.length > 0 && reviews.length === 0 ? "No reviews found" : undefined
          }
        });
        
      } catch (error) {
        console.error('Error fetching Google Business data:', error);
        setGoogleBusinessData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          debugInfo: {
            ...prev.debugInfo,
            accountsError: error instanceof Error ? error.message : String(error)
          }
        }));
      }
    }

    if (user) {
      fetchGoogleBusinessData();
    }
  }, [getToken, user]);

  if (googleBusinessData.isLoading) {
    return <div className="p-4 text-center">Loading Google Business Profile data...</div>;
  }

  // Display debug information in development
  const showDebugInfo = () => {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-md text-xs font-mono">
        <h4 className="font-medium mb-2">Debug Information</h4>
        <pre>{JSON.stringify(googleBusinessData.debugInfo, null, 2)}</pre>
      </div>
    );
  };

  if (googleBusinessData.error) {
    const isVerificationError = googleBusinessData.debugInfo.oauthError?.includes('access_denied');
    const isScopeError = googleBusinessData.debugInfo.accountsError === 'Missing business.manage scope';
    const isAPIError = googleBusinessData.debugInfo.accountsError?.includes('API error: 403') ||
                      googleBusinessData.debugInfo.accountsError?.includes('API is not enabled');
    
    return (
      <div className={`p-4 ${
        isVerificationError 
          ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
          : isScopeError
            ? 'bg-amber-50 border border-amber-200 text-amber-800'
            : isAPIError
              ? 'bg-blue-50 border border-blue-200 text-blue-800'
              : 'bg-red-50 border border-red-200 text-red-700'
      } rounded-md`}>
        <h3 className="font-medium">
          {isVerificationError 
            ? 'Google Verification Required' 
            : isScopeError
              ? 'Missing Google Business Profile Permissions'
              : isAPIError
                ? 'Google API Not Enabled'
                : 'Error Connecting to Google Business Profile'
          }
        </h3>
        <p>{googleBusinessData.error}</p>
        
        {isVerificationError ? (
          <div className="mt-4 text-sm">
            <p className="mb-2">You need to add your Google account as a test user in the Google Cloud Console:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
              <li>Select your project</li>
              <li>Navigate to &quot;APIs &amp; Services&quot; &gt; &quot;OAuth consent screen&quot;</li>
              <li>In the &quot;Test users&quot; section, click &quot;Add Users&quot;</li>
              <li>Add your Google email address</li>
              <li>Save changes and try connecting again</li>
            </ol>
          </div>
        ) : isScopeError ? (
          <div className="mt-4 text-sm">
            <p className="mb-2">You need to reconnect your Google account with the correct permissions:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to your <a href="/dashboard/settings" className="text-blue-600 underline">Account Settings</a></li>
              <li>Under &quot;Google Business Profile&quot;, click &quot;Disconnect&quot;</li>
              <li>Then click &quot;Connect&quot; to sign in again</li>
              <li>Make sure to check the box that allows access to &quot;View and manage your Google Business Profile&quot; when prompted for permissions</li>
            </ol>
          </div>
        ) : isAPIError ? (
          <div className="mt-4 text-sm">
            <p className="mb-2">You need to enable the Google Business Profile APIs in your Google Cloud Project:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to the <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console API Library</a></li>
              <li>Search for and enable these APIs:
                <ul className="list-disc pl-5 mt-1 mb-2">
                  <li>Business Profile API</li>
                  <li>My Business Account Management API</li>
                  <li>My Business Business Information API</li>
                  <li>My Business Reviews API</li>
                </ul>
              </li>
              <li>Wait a few minutes for the changes to propagate</li>
              <li>Try refreshing this page</li>
            </ol>
          </div>
        ) : (
          <p className="mt-2 text-sm">
            Please make sure you have connected your Google Business Profile account in your settings.
          </p>
        )}
        
        {showDebugInfo()}
      </div>
    );
  }

  if (googleBusinessData.accounts.length === 0 && googleBusinessData.locations.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-medium">No Google Business Accounts or Locations Found</h3>
        <p>
          We couldn&apos;t find any Google Business Profile accounts or locations associated with your Google account.
          This can happen if:
        </p>
        
        <ul className="list-disc pl-5 mt-2 mb-3 text-sm">
          <li><strong>You don&apos;t have ownership</strong> of any Google Business Profiles (owner access provides the most complete API access)</li>
          <li><strong>You only have manager access</strong> but not to any specific locations</li>
          <li><strong>You haven&apos;t set up</strong> a Google Business Profile yet</li>
        </ul>
        
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-medium mb-2">For Agencies & Business Managers</h4>
          <p className="text-sm mb-2">
            As an agency or business manager, you need specific access to work with client Business Profiles:
          </p>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li>Have each client add your Google account as a <strong>Location Manager</strong> to their specific business locations (not just account-level access)</li>
            <li>They can do this through their <a href="https://business.google.com/locations" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Business Profile Manager</a> by:
              <ul className="list-disc pl-5 mt-1 mb-1">
                <li>Selecting a location</li>
                <li>Going to &quot;Users&quot; or &quot;Access&quot;</li>
                <li>Adding your email as a Manager or Owner</li>
              </ul>
            </li>
            <li>Ensure your Google account is the same one used to log in to this application</li>
            <li>For best API support, request <strong>Location Manager</strong> access to specific locations rather than just Account Manager access</li>
          </ol>
          <p className="text-sm mt-2">
            <a href="https://developers.google.com/my-business/content/access-management-api-access" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Read more about access levels in Google&apos;s documentation</a>
          </p>
        </div>
        
        <div className="mt-4 text-sm">
          <p className="mb-2">To resolve this issue, you can:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Use a Google account that has <strong>owner-level access</strong> to at least one Google Business Profile</li>
            <li>Ask the owner to grant you manager access to specific locations, not just the account</li>
            <li>Create your own Google Business Profile at <a href="https://business.google.com/create" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Business Profile Manager</a></li>
          </ol>
        </div>
        
        {showDebugInfo()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-md shadow-sm border">
        <h2 className="text-lg font-medium mb-4">Your Google Business Profile Data</h2>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Business Accounts ({googleBusinessData.accounts.length})</h3>
          <ul className="divide-y">
            {googleBusinessData.accounts.map((account, i) => (
              <li key={account.name || i} className="py-2">
                {account.accountName || 'Unnamed Account'} 
                <span className="text-xs ml-2 text-gray-500">{account.type || 'Unknown type'}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Locations ({googleBusinessData.locations.length})</h3>
          <ul className="divide-y">
            {googleBusinessData.locations.map((location, i) => (
              <li key={location.name || i} className="py-2">
                {location.title || 'Unnamed Location'}
                <p className="text-xs text-gray-600">{location.address?.formattedAddress || 'No address'}</p>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Reviews ({googleBusinessData.reviews.length})</h3>
          <ul className="divide-y">
            {googleBusinessData.reviews.map((review, i) => (
              <li key={review.name || i} className="py-2">
                <div className="flex items-center">
                  <div className="text-yellow-400">{'★'.repeat(review.starRating || 0)}</div>
                  <span className="ml-2 text-gray-500 text-sm">
                    {new Date(review.createTime || '').toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{review.comment || 'No comment'}</p>
              </li>
            ))}
          </ul>
        </div>
        
        {showDebugInfo()}
      </div>
    </div>
  );
} 