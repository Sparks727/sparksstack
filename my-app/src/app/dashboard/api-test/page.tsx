'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

// Custom Badge component
const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className = '', 
  variant = 'default' 
}) => {
  const variantClasses = {
    default: 'bg-primary/10 text-primary',
    outline: 'border border-gray-200'
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

interface SpinnerProps {
  className?: string;
}

// Custom Spinner component
const Spinner: React.FC<SpinnerProps> = ({ className = '' }) => {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />;
};

interface ApiResult {
  success: boolean;
  message: string;
  details: Record<string, unknown> | null;
}

interface ApiTestResponse {
  success: boolean;
  message: string;
  results: Record<string, ApiResult>;
  oauthTokenPresent: boolean;
  apiHelpText: Record<string, {
    name: string;
    description: string;
    apiEnable: string;
  }>;
}

export default function ApiTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/google/api-test');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run API test');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error running API test:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Google Business API Connectivity Test</h1>
      <p className="text-lg mb-6">
        This tool tests connectivity to various Google Business APIs and helps diagnose which APIs are properly enabled.
      </p>
      
      <div className="mb-8">
        <Button 
          disabled={loading} 
          onClick={runTest} 
          className="px-6 py-3 text-lg"
        >
          {loading ? <Spinner className="mr-2" /> : null}
          {loading ? 'Running Tests...' : 'Run API Test'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
              <CardDescription>
                Overview of API connectivity status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(results.results).map(([apiKey, result]) => (
                  <Card key={apiKey} className={`border-l-4 ${result.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium">
                          {results.apiHelpText[apiKey]?.name || apiKey}
                        </CardTitle>
                        {result.success ? 
                          <CheckCircle className="h-5 w-5 text-green-500" /> : 
                          <XCircle className="h-5 w-5 text-red-500" />
                        }
                      </div>
                      <CardDescription className="text-xs">
                        {results.apiHelpText[apiKey]?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{result.message}</p>
                      {!result.success && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            API to enable: {results.apiHelpText[apiKey]?.apiEnable}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-col space-y-4 w-full">
                <p className="text-sm text-gray-600">
                  OAuth Token Status: {results.oauthTokenPresent ? 
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge> : 
                    <Badge variant="default" className="bg-red-100 text-red-800 hover:bg-red-100">Missing</Badge>
                  }
                </p>
                <a 
                  href="https://console.cloud.google.com/apis/library" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  Go to Google Cloud Console to enable APIs <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
              <CardDescription>
                Complete response details for debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 