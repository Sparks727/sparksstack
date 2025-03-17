'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

interface DebugInfo {
  hasGoogleConnection?: boolean;
  googleAccountId?: string | null;
  googleAccountEmail?: string | null;
  googleAccountScopes?: string[] | null;
  hasBusinessManageScope?: boolean;
  hasToken?: boolean;
  tokenPrefix?: string | null;
  rawTokenPrefix?: string | null;
  userId?: string | null;
  primaryEmail?: string | null;
  error?: string;
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
      const token = await getToken({ template: 'oauth_google' });
      
      // Get raw user token to check claims
      const rawToken = await getToken();
      
      // Set debug info
      setDebugInfo({
        hasGoogleConnection: !!googleAccount,
        googleAccountId: googleAccount?.id || null,
        googleAccountEmail: googleAccount?.emailAddress || null,
        googleAccountScopes: googleAccount?.approvedScopes 
          ? Array.isArray(googleAccount.approvedScopes) 
            ? googleAccount.approvedScopes 
            : [googleAccount.approvedScopes]
          : null,
        hasBusinessManageScope: googleAccount?.approvedScopes
          ? Array.isArray(googleAccount.approvedScopes)
            ? googleAccount.approvedScopes.includes('https://www.googleapis.com/auth/business.manage')
            : googleAccount.approvedScopes === 'https://www.googleapis.com/auth/business.manage'
          : false,
        hasToken: !!token,
        tokenPrefix: token ? `${token.substring(0, 10)}...` : null,
        rawTokenPrefix: rawToken ? `${rawToken.substring(0, 10)}...` : null,
        userId: user?.id || null,
        primaryEmail: user?.primaryEmailAddress?.emailAddress || null,
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