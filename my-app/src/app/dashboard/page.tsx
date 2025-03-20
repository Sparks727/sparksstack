"use client";

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleBusinessService } from '@/lib/services/google-business-service';
import { Alert } from '@/components/ui/alert';

interface DebugInfo {
  hasGoogleConnection?: boolean;
  googleAccountId?: string | null;
  googleAccountEmail?: string | null;
  googleAccountScopes?: string[] | null;
  hasBusinessManageScope?: boolean;
  hasToken?: boolean;
  tokenPrefix?: string | null;
  userId?: string | null;
  primaryEmail?: string | null;
  error?: string | null;
  oauthError?: string | null;
  apiTest?: {
    success: boolean;
    message: string;
    status?: number;
    error?: string;
    details?: Record<string, unknown> | string; // Either an object or string
  } | null;
}

export default function GoogleBusinessProfileTestPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [apiTesting, setApiTesting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});

  async function checkGoogleConnection() {
    setLoading(true);
    try {
      const info: DebugInfo = {
        userId: user?.id,
        primaryEmail: user?.primaryEmailAddress?.emailAddress,
      };

      // Check if user has Google account connected
      const googleAccount = user?.externalAccounts?.find(
        (account) => account.provider === 'google'
      );

      info.hasGoogleConnection = !!googleAccount;
      info.googleAccountId = googleAccount?.id || null;
      info.googleAccountEmail = googleAccount?.emailAddress || null;

      // Check scopes
      if (googleAccount) {
        info.googleAccountScopes = Array.isArray(googleAccount.approvedScopes)
          ? googleAccount.approvedScopes
          : typeof googleAccount.approvedScopes === 'string'
          ? googleAccount.approvedScopes.split(' ')
          : null;

        info.hasBusinessManageScope = info.googleAccountScopes?.includes(
          'https://www.googleapis.com/auth/business.manage'
        );
      }

      // Try to get token
      try {
        const token = await getToken({ template: 'oauth_google' });
        info.hasToken = !!token;
        info.tokenPrefix = token ? `${token.substring(0, 10)}...` : null;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error getting token';
        info.error = errorMessage;
        info.oauthError = errorMessage;
      }

      setDebugInfo(info);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error checking connection';
      setDebugInfo({
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function testApiConnection() {
    setApiTesting(true);
    try {
      // Try to get the token from the custom JWT template first
      let googleToken;
      try {
        // Use the custom JWT template specifically created for Google OAuth
        // Replace 'google_oauth' with the actual name of your template if different
        googleToken = await getToken({ template: 'google_oauth' });
        console.log('Using custom JWT template token for Google OAuth');
        
        if (googleToken) {
          // If the token is in JSON format with a token property, extract it
          try {
            const tokenData = JSON.parse(googleToken);
            if (tokenData.google_oauth_access_token) {
              console.log('Extracted direct OAuth token from custom template');
              googleToken = tokenData.google_oauth_access_token;
            }
          } catch {
            // Token is not JSON, use as is
            console.log('Token is not in JSON format, using as is');
          }
        }
      } catch (templateError) {
        console.error('Error getting token from custom template:', templateError);
      }
      
      // If custom template fails, try to get the token directly from the Google account
      if (!googleToken) {
        const googleAccount = user?.externalAccounts?.find(
          (account) => account.provider === 'google'
        );
        
        if (!googleAccount) {
          setDebugInfo(prev => ({
            ...prev,
            apiTest: {
              success: false,
              message: 'No Google account connected',
              error: 'Please connect your Google account in Clerk settings'
            }
          }));
          return;
        }
        
        try {
          // @ts-expect-error - getToken is available but might not be typed correctly
          googleToken = await googleAccount.getToken();
          console.log('Got direct token from Google account:', !!googleToken);
        } catch (tokenError) {
          console.error('Error getting direct token:', tokenError);
        }
        
        // Final fallback to standard oauth_google template
        if (!googleToken) {
          googleToken = await getToken({ template: 'oauth_google' });
          console.log('Using standard Clerk JWT template token');
        }
      }
      
      if (!googleToken) {
        setDebugInfo(prev => ({
          ...prev,
          apiTest: {
            success: false,
            message: 'No OAuth token available',
            error: 'Failed to get Google OAuth token'
          }
        }));
        return;
      }
      
      // Initialize the service with the token
      const service = new GoogleBusinessService(googleToken);
      
      // Test the connection
      const result = await service.testConnection();
      
      // Add detailed debug logging of the result
      console.log('API Test result:', JSON.stringify(result, null, 2));
      
      // Update debug info with the result
      setDebugInfo(prev => ({
        ...prev,
        apiTest: {
          success: result.success,
          message: result.message,
          status: result.status,
          error: result.error,
          details: result.details || result.data
        }
      }));
      
    } catch (error: unknown) {
      console.error('API Test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error testing API connection';
      setDebugInfo(prev => ({
        ...prev,
        apiTest: {
          success: false,
          message: 'Error testing API connection',
          error: errorMessage
        }
      }));
    } finally {
      setApiTesting(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Google Business Profile API Test</CardTitle>
          <CardDescription>
            Test your Google Business Profile API connectivity and debug connection issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Connection Status</h3>
              <p className="text-sm text-gray-500 mb-2">
                Use this tool to check if your Google account is correctly connected with the required permissions.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={checkGoogleConnection}
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Check Google Connection Status'}
                </Button>
                
                <Button 
                  onClick={testApiConnection}
                  disabled={apiTesting || !debugInfo.hasToken}
                  variant="outline"
                >
                  {apiTesting ? 'Testing API...' : 'Test API Connection'}
                </Button>
              </div>
            </div>
            
            {debugInfo.apiTest && (
              <Alert className={debugInfo.apiTest.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}>
                <h4 className="font-medium">{debugInfo.apiTest.success ? 'API Connection Successful' : 'API Connection Failed'}</h4>
                <p className="text-sm mt-1">{debugInfo.apiTest.message}</p>
                {debugInfo.apiTest.error && (
                  <p className="text-sm mt-1 font-mono text-xs">Error: {debugInfo.apiTest.error}</p>
                )}
                {debugInfo.apiTest.status && (
                  <p className="text-sm mt-1 font-mono text-xs">Status: {debugInfo.apiTest.status}</p>
                )}
                {debugInfo.apiTest.details && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs font-medium">Additional Details:</p>
                    <pre className="text-xs font-mono whitespace-pre-wrap max-h-32 overflow-auto bg-white bg-opacity-50 p-2 rounded mt-1">
                      {typeof debugInfo.apiTest.details === 'string' 
                        ? debugInfo.apiTest.details 
                        : JSON.stringify(debugInfo.apiTest.details, null, 2)}
                    </pre>
                  </div>
                )}
              </Alert>
            )}

            {Object.keys(debugInfo).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md border">
                <h4 className="font-medium mb-2">Debug Information</h4>
                <div className="bg-white p-3 rounded border text-xs font-mono">
                  <pre className="whitespace-pre-wrap break-words">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              </div>
            )}

            {debugInfo.oauthError?.includes('access_denied') && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
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
            
            <div className="text-sm">
              <h4 className="font-medium mb-1">Troubleshooting Steps:</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Verify your Google account is connected in your Clerk user settings</li>
                <li>Ensure the OAuth scope <code>https://www.googleapis.com/auth/business.manage</code> is granted</li>
                <li>Check that your Google account has access to Google Business Profile</li>
                <li><strong>Make sure the Google Business Profile API is enabled in your Google Cloud Project:</strong>
                  <ul className="list-disc pl-5 mt-1 text-xs">
                    <li>Go to <a href="https://console.cloud.google.com/apis/library/businessprofileperformance.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console API Library</a></li>
                    <li>Search for "Business Profile API" and "My Business API"</li>
                    <li>Enable both APIs for your project</li>
                  </ul>
                </li>
                <li><strong>Verify your Google account has proper access to Business Profiles:</strong>
                  <ul className="list-disc pl-5 mt-1 text-xs">
                    <li>Visit <a href="https://business.google.com/locations" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Business Profile Manager</a></li>
                    <li>Ensure you can access and manage business profiles</li>
                  </ul>
                </li>
                <li>Verify your JWT template is correctly configured in Clerk</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 