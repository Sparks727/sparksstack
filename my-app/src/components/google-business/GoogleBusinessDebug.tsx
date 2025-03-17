'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DebugInfo {
  hasGoogleConnection?: boolean;
  googleAccountId?: string | null;
  googleAccountEmail?: string | null;
  googleAccountScopes?: string[] | null;
  originalScopes?: string[] | string | null;
  hasBusinessManageScope?: boolean;
  hasToken?: boolean;
  tokenPrefix?: string | null;
  rawTokenPrefix?: string | null;
  userId?: string | null;
  primaryEmail?: string | null;
  error?: string;
  oauthError?: string | null;
}

interface ApiStatus {
  name: string;
  endpoint: string;
  status: 'checking' | 'enabled' | 'disabled' | 'error';
  details?: string;
}

export default function GoogleBusinessDebug() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [apiStatus, setApiStatus] = useState<ApiStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingApis, setCheckingApis] = useState(false);

  const checkGoogleConnection = async () => {
    setLoading(true);
    try {
      // Check if user has Google OAuth connection
      const googleAccount = user?.externalAccounts?.find(
        account => account.provider === 'google'
      );

      // Get OAuth token from Clerk for Google
      let token = null;
      let oauthError = null;
      try {
        token = await getToken({ template: 'oauth_google' });
      } catch (error: Error | unknown) {
        console.error('OAuth token error:', error);
        oauthError = error instanceof Error ? error.message : String(error);
      }
      
      // Get raw user token to check claims
      const rawToken = await getToken();
      
      // Handle scopes that might be a space-separated string or an array
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
      
      // Set debug info
      setDebugInfo({
        hasGoogleConnection: !!googleAccount,
        googleAccountId: googleAccount?.id || null,
        googleAccountEmail: googleAccount?.emailAddress || null,
        googleAccountScopes: formattedScopes,
        originalScopes: googleAccount?.approvedScopes,
        hasBusinessManageScope,
        hasToken: !!token,
        tokenPrefix: token ? `${token.substring(0, 10)}...` : null,
        rawTokenPrefix: rawToken ? `${rawToken.substring(0, 10)}...` : null,
        userId: user?.id || null,
        primaryEmail: user?.primaryEmailAddress?.emailAddress || null,
        oauthError: oauthError
      });
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setDebugInfo({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleApis = async () => {
    setCheckingApis(true);
    
    // Initialize API status checks
    setApiStatus([
      {
        name: 'My Business Account Management API',
        endpoint: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
        status: 'checking'
      },
      {
        name: 'My Business Account Management API (Locations)',
        endpoint: 'https://mybusinessaccountmanagement.googleapis.com/v1/locations',
        status: 'checking'
      },
      {
        name: 'Business Profile API',
        endpoint: 'https://businessprofileperformance.googleapis.com/v1/locations',
        status: 'checking'
      },
      {
        name: 'My Business Business Information API',
        endpoint: 'https://mybusinessbusinessinformation.googleapis.com/v1/categories',
        status: 'checking'
      },
      {
        name: 'My Business Reviews API',
        endpoint: 'https://mybusinessreviews.googleapis.com/v1/accounts',
        status: 'checking'
      }
    ]);
    
    try {
      // Get token
      const token = await getToken({ template: 'oauth_google' });
      if (!token) {
        setApiStatus(prev => prev.map(api => ({
          ...api,
          status: 'error',
          details: 'No token available'
        })));
        setCheckingApis(false);
        return;
      }
      
      // Check each API in parallel
      const checkPromises = apiStatus.map(async (api) => {
        try {
          const response = await fetch(api.endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          let status: 'enabled' | 'disabled' | 'error' = 'disabled';
          let details = `Status code: ${response.status}`;
          
          if (response.ok) {
            status = 'enabled';
            details = 'API is enabled and working';
          } else if (response.status === 403) {
            status = 'disabled';
            details = 'API is not enabled in your Google Cloud Project';
          } else if (response.status === 401) {
            status = 'error';
            details = 'Authentication failed - token might be invalid';
          } else if (response.status === 404) {
            // 404 on some endpoints is normal if you don't have data yet
            status = 'enabled';
            details = 'API seems enabled, but endpoint may require specific parameters';
          } else {
            // Try to get more details from the error response
            try {
              const errorText = await response.text();
              details = `${details} - ${errorText.substring(0, 100)}...`;
            } catch {
              // If we can't get the error text, just use the status
            }
          }
          
          return { ...api, status, details };
        } catch (error) {
          return {
            ...api,
            status: 'error' as const,
            details: error instanceof Error ? error.message : String(error)
          };
        }
      });
      
      const results = await Promise.all(checkPromises);
      setApiStatus(results as ApiStatus[]);
      
    } catch (error) {
      console.error('Error checking APIs:', error);
      setApiStatus(prev => prev.map(api => ({
        ...api,
        status: 'error' as const,
        details: error instanceof Error ? error.message : String(error)
      })));
    } finally {
      setCheckingApis(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'text-green-600';
      case 'disabled': return 'text-red-600';
      case 'error': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
      <h3 className="font-medium mb-4">Google Business Profile Debug Tools</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outline" 
          onClick={checkGoogleConnection}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Google Connection Status'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={checkGoogleApis}
          disabled={checkingApis}
        >
          {checkingApis ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking APIs...
            </>
          ) : 'Check Google APIs Status'}
        </Button>
      </div>
      
      {apiStatus.length > 0 && (
        <div className="mb-4 bg-white p-4 rounded border">
          <h4 className="font-medium mb-2">Google API Status</h4>
          <div className="space-y-3">
            {apiStatus.map((api, index) => (
              <div key={index} className="border-b pb-2 last:border-b-0">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    api.status === 'checking' ? 'bg-gray-400' :
                    api.status === 'enabled' ? 'bg-green-500' :
                    api.status === 'disabled' ? 'bg-red-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="font-medium">{api.name}</span>
                  <span className={`ml-2 text-sm ${getStatusColor(api.status)}`}>
                    ({api.status})
                  </span>
                </div>
                {api.details && (
                  <p className="text-xs text-gray-500 mt-1 ml-5">{api.details}</p>
                )}
                <p className="text-xs text-gray-400 mt-1 ml-5">{api.endpoint}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-sm">
            <h5 className="font-medium mb-1">How to fix disabled APIs:</h5>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to the <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console API Library</a></li>
              <li>Search for each disabled API by name</li>
              <li>Click on the API and click &quot;Enable&quot;</li>
              <li>Repeat for all disabled APIs</li>
              <li>Wait a few minutes for changes to propagate</li>
              <li>Come back and check API status again</li>
            </ol>
          </div>
        </div>
      )}
      
      {Object.keys(debugInfo).length > 0 && (
        <div className="bg-white p-3 rounded border text-xs font-mono">
          <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
      
      {/* OAuth verification error helper */}
      {debugInfo.oauthError?.includes('access_denied') && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="font-medium text-yellow-800 mb-2">Google Verification Issue Detected</h4>
          <p className="text-sm mb-2">
            Your Google Cloud Project is in testing mode and your Google account hasn&apos;t been added as a test user.
          </p>
          <div className="pl-4 text-sm">
            <h5 className="font-medium mb-1">To fix this:</h5>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
              <li>Select your project</li>
              <li>Navigate to &quot;APIs &amp; Services&quot; &gt; &quot;OAuth consent screen&quot;</li>
              <li>In the &quot;Test users&quot; section, click &quot;Add Users&quot;</li>
              <li>Add <code className="bg-gray-100 px-1">{debugInfo.primaryEmail || 'your-email@example.com'}</code></li>
              <li>Save changes and try connecting again</li>
            </ol>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm">
        <h4 className="font-medium mb-1">Troubleshooting Steps:</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Verify your Google account is connected in your Clerk user settings</li>
          <li>Ensure the OAuth scope <code>https://www.googleapis.com/auth/business.manage</code> is granted</li>
          <li>Check that your Google account has access to Google Business Profile</li>
          <li>Verify your JWT template is correctly configured in Clerk</li>
          <li>Make sure your Google Cloud project has the Business Profile API enabled</li>
        </ol>
      </div>
    </div>
  );
} 