'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

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

export default function GoogleBusinessDebug() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
      <h3 className="font-medium mb-4">Google Business Profile Debug Tools</h3>
      
      <Button 
        variant="outline" 
        onClick={checkGoogleConnection}
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Checking...' : 'Check Google Connection Status'}
      </Button>
      
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