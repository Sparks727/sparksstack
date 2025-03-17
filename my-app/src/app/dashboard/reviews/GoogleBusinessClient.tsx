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
}

export default function GoogleBusinessClient() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [googleBusinessData, setGoogleBusinessData] = useState<GoogleBusinessData>({
    accounts: [],
    locations: [],
    reviews: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    async function fetchGoogleBusinessData() {
      try {
        // Get OAuth token from Clerk for Google
        // You need to set up a JWT template named 'oauth_google' in the Clerk dashboard
        // with the Google Business Profile API scope: https://www.googleapis.com/auth/business.manage
        const token = await getToken({ template: 'oauth_google' });
        
        if (!token) {
          setGoogleBusinessData(prev => ({
            ...prev,
            isLoading: false,
            error: 'No Google Business access token available. Please make sure your Google account is connected with Business Profile permissions in your account settings.'
          }));
          return;
        }
        
        // Initialize service with token
        const googleBusinessService = new GoogleBusinessService(token);
        
        // Fetch accounts
        const accountsResponse = await googleBusinessService.getAccounts();
        const accounts = accountsResponse?.accounts || [];
        
        // If we have accounts, fetch locations for the first account
        let locations: GoogleBusinessLocation[] = [];
        let reviews: GoogleBusinessReview[] = [];
        
        if (accounts.length > 0) {
          const locationsResponse = await googleBusinessService.getLocations(accounts[0].name);
          locations = locationsResponse?.locations || [];
          
          // If we have locations, fetch reviews for the first location
          if (locations.length > 0) {
            const reviewsResponse = await googleBusinessService.getReviews(locations[0].name);
            reviews = reviewsResponse?.reviews || [];
          }
        }
        
        setGoogleBusinessData({
          accounts,
          locations,
          reviews,
          isLoading: false,
          error: null
        });
        
      } catch (error) {
        console.error('Error fetching Google Business data:', error);
        setGoogleBusinessData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
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

  if (googleBusinessData.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <h3 className="font-medium">Error Connecting to Google Business Profile</h3>
        <p>{googleBusinessData.error}</p>
        <p className="mt-2 text-sm">
          Please make sure you have connected your Google Business Profile account in your settings.
        </p>
      </div>
    );
  }

  if (googleBusinessData.accounts.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-medium">No Google Business Accounts Found</h3>
        <p>
          We couldn&apos;t find any Google Business Profile accounts associated with your Google account.
          Please make sure you have at least one business account set up in Google Business Profile Manager.
        </p>
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
      </div>
    </div>
  );
} 