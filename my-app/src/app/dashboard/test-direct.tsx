"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export default function DirectApiTest() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function testDirectApi() {
    if (!token) return;
    
    setLoading(true);
    try {
      console.log('Testing People API with direct token input');
      
      // First test People API
      const peopleResponse = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('People API response:', peopleResponse.status, peopleResponse.statusText);
      
      let peopleResult = null;
      if (peopleResponse.ok) {
        peopleResult = await peopleResponse.json();
      } else {
        peopleResult = await peopleResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
      }
      
      // Test Business Profile API
      const businessResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Business API response:', businessResponse.status, businessResponse.statusText);
      
      let businessResult = null;
      if (businessResponse.ok) {
        businessResult = await businessResponse.json();
      } else {
        businessResult = await businessResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
      }
      
      setResult({
        peopleApi: {
          status: peopleResponse.status,
          success: peopleResponse.ok,
          data: peopleResult
        },
        businessApi: {
          status: businessResponse.status,
          success: businessResponse.ok,
          data: businessResult
        }
      });
    } catch (error) {
      console.error('Test error:', error);
      setResult({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Direct API Testing Tool</CardTitle>
          <CardDescription>
            Test Google APIs directly with a token for troubleshooting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Paste a valid OAuth token from Google to test API access directly:
              </p>
              <div className="flex gap-2">
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste OAuth token here"
                  className="font-mono text-xs"
                />
                <Button 
                  onClick={testDirectApi}
                  disabled={loading || !token}
                >
                  {loading ? 'Testing...' : 'Test APIs Directly'}
                </Button>
              </div>
            </div>
            
            {result && (
              <div className="bg-gray-50 p-4 rounded-md border">
                <h4 className="font-medium mb-2">Test Results</h4>
                <div className="space-y-4">
                  {result.peopleApi && (
                    <Alert className={result.peopleApi.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}>
                      <h4 className="font-medium">People API Test: {result.peopleApi.success ? 'Success' : 'Failed'}</h4>
                      <p className="text-sm mt-1">Status: {result.peopleApi.status}</p>
                      <pre className="text-xs font-mono whitespace-pre-wrap max-h-32 overflow-auto bg-white bg-opacity-50 p-2 rounded mt-2">
                        {JSON.stringify(result.peopleApi.data, null, 2)}
                      </pre>
                    </Alert>
                  )}
                  
                  {result.businessApi && (
                    <Alert className={result.businessApi.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}>
                      <h4 className="font-medium">Business API Test: {result.businessApi.success ? 'Success' : 'Failed'}</h4>
                      <p className="text-sm mt-1">Status: {result.businessApi.status}</p>
                      <pre className="text-xs font-mono whitespace-pre-wrap max-h-32 overflow-auto bg-white bg-opacity-50 p-2 rounded mt-2">
                        {JSON.stringify(result.businessApi.data, null, 2)}
                      </pre>
                    </Alert>
                  )}
                  
                  {result.error && (
                    <Alert className="bg-red-50 border-red-200 text-red-800">
                      <h4 className="font-medium">Error Occurred</h4>
                      <p className="text-sm mt-1">{result.error}</p>
                    </Alert>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-sm border-t pt-4">
              <h4 className="font-medium mb-1">How to get a test token:</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OAuth Playground</a></li>
                <li>In the right panel, click on "OAuth 2.0 Configuration" (gear icon)</li>
                <li>Check "Use your own OAuth credentials"</li>
                <li>Enter your OAuth Client ID and Secret from Google Cloud Console</li>
                <li>In the left panel, scroll to find "Google Business Profile API" and select the scopes</li>
                <li>Click "Authorize APIs" and complete the authorization flow</li>
                <li>On step 2, click "Exchange authorization code for tokens"</li>
                <li>Copy the "Access token" and paste it above</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 