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
      console.log('Starting Google APIs status check...');
      
      // Get token
      let token = null;
      try {
        token = await getToken({ template: 'oauth_google' });
        console.log('Token obtained for API check:', token ? `${token.substring(0, 10)}...` : 'No token');
      } catch (tokenError) {
        console.error('Failed to get token for API check:', tokenError);
        setApiStatus(prev => prev.map(api => ({
          ...api,
          status: 'error',
          details: `Token error: ${tokenError instanceof Error ? tokenError.message : String(tokenError)}`
        })));
        setCheckingApis(false);
        return;
      }
      
      if (!token) {
        console.error('No token available for API checks');
        setApiStatus(prev => prev.map(api => ({
          ...api,
          status: 'error',
          details: 'No token available. Please connect your Google account with the required permissions.'
        })));
        setCheckingApis(false);
        return;
      }
      
      // Check each API in parallel
      const checkPromises = apiStatus.map(async (api) => {
        console.log(`Checking API: ${api.name} at ${api.endpoint}`);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(api.endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          console.log(`API ${api.name} response:`, response.status, response.statusText);
          
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
            // For some endpoints, 404 is expected when you don't have data
            status = 'enabled';
            details = 'API seems enabled, but no data found or endpoint requires specific parameters';
          } else {
            // Try to get more details from the error response
            let responseText = '';
            try {
              responseText = await response.text();
            } catch {
              responseText = 'Could not read response body';
            }
            
            console.log(`API ${api.name} error details:`, responseText);
            details = `${details} - ${responseText.substring(0, 200)}...`;
            
            // Check for common error messages
            if (responseText.includes('API not enabled')) {
              status = 'disabled';
              details = 'API is not enabled in your Google Cloud Project';
            } else if (responseText.includes('permission') || responseText.includes('Permission')) {
              status = 'error';
              details = 'Permission denied - you may not have the required access level';
            }
          }
          
          return { ...api, status, details };
        } catch (error) {
          console.error(`Error checking API ${api.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          let errorDetails = 'Unknown error';
          
          if (errorMessage.includes('aborted') || errorMessage.includes('timeout')) {
            errorDetails = 'Request timed out after 10 seconds';
          } else if (errorMessage.includes('network')) {
            errorDetails = 'Network error - check your internet connection';
          } else {
            errorDetails = errorMessage;
          }
          
          return {
            ...api,
            status: 'error' as const,
            details: errorDetails
          };
        }
      });
      
      try {
        const results = await Promise.all(checkPromises);
        console.log('All API checks completed:', results);
        setApiStatus(results as ApiStatus[]);
      } catch (promiseError) {
        console.error('Error in Promise.all for API checks:', promiseError);
        setApiStatus(prev => prev.map(api => ({
          ...api,
          status: 'error' as const,
          details: 'Failed to complete API check'
        })));
      }
      
    } catch (error) {
      console.error('Error in main API checking function:', error);
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
                  <p className="text-xs text-gray-500 mt-1 ml-5 break-words">{api.details}</p>
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
      
      {/* Simple API Checker for direct testing */}
      <div className="mt-6 p-4 bg-white rounded border">
        <h4 className="font-medium mb-2">Direct API Testing</h4>
        <p className="text-sm mb-4">
          Test each API endpoint directly. This can help diagnose issues with the API Status Checker.
        </p>
        
        <SimpleAPIChecker 
          name="Test Locations Access (Manager Access)" 
          endpoint="https://mybusinessaccountmanagement.googleapis.com/v1/locations" 
          getToken={getToken}
        />
        
        <SimpleAPIChecker 
          name="Test Accounts Access (Owner Access)" 
          endpoint="https://mybusinessaccountmanagement.googleapis.com/v1/accounts" 
          getToken={getToken}
        />
      </div>
      
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

// Simple API Checker component for direct testing
function SimpleAPIChecker({ 
  name, 
  endpoint, 
  getToken 
}: { 
  name: string; 
  endpoint: string; 
  getToken: (args?: { template: string }) => Promise<string | null>; 
}) {
  const [result, setResult] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    details?: string;
  }>({
    status: 'idle',
    message: 'Not tested yet'
  });

  const testEndpoint = async () => {
    setResult({
      status: 'loading',
      message: 'Testing API...'
    });

    try {
      // Get token
      const token = await getToken({ template: 'oauth_google' });
      
      if (!token) {
        setResult({
          status: 'error',
          message: 'Failed to get token',
          details: 'Make sure your Google account is connected with the required permissions'
        });
        return;
      }

      // Make request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Get response text for more details
      let responseText = '';
      try {
        responseText = await response.text();
      } catch {
        responseText = 'Could not read response body';
      }
      
      // Handle response based on status
      if (response.ok) {
        setResult({
          status: 'success',
          message: `Success (${response.status})`,
          details: responseText.substring(0, 300) + (responseText.length > 300 ? '...' : '')
        });
      } else if (response.status === 404) {
        setResult({
          status: 'success',
          message: `API available but no data found (${response.status})`,
          details: responseText.substring(0, 300) + (responseText.length > 300 ? '...' : '')
        });
      } else if (response.status === 403) {
        setResult({
          status: 'error',
          message: `API not enabled (${response.status})`,
          details: responseText.substring(0, 300) + (responseText.length > 300 ? '...' : '')
        });
      } else {
        setResult({
          status: 'error',
          message: `Error: ${response.status} ${response.statusText}`,
          details: responseText.substring(0, 300) + (responseText.length > 300 ? '...' : '')
        });
      }
    } catch (error) {
      setResult({
        status: 'error',
        message: 'Error testing API',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  };

  return (
    <div className="mb-4 p-3 border rounded">
      <div className="flex justify-between items-center mb-2">
        <h5 className="font-medium">{name}</h5>
        <Button 
          variant="outline" 
          size="sm"
          disabled={result.status === 'loading'}
          onClick={testEndpoint}
        >
          {result.status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Testing...
            </>
          ) : 'Test Now'}
        </Button>
      </div>
      
      <div className="text-xs text-gray-500">{endpoint}</div>
      
      {result.status !== 'idle' && (
        <div className={`mt-2 p-2 text-sm rounded ${
          result.status === 'loading' ? 'bg-gray-100' :
          result.status === 'success' ? 'bg-green-50 text-green-800' : 
          'bg-red-50 text-red-800'
        }`}>
          <div className="font-medium">{result.message}</div>
          {result.details && (
            <pre className="mt-1 whitespace-pre-wrap text-xs overflow-auto max-h-32">{result.details}</pre>
          )}
        </div>
      )}
    </div>
  );
} 