'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CircleCheck, CircleX, ExternalLink, RefreshCw, AlertCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ApiTestResult {
  name: string;
  url: string;
  status: number;
  success: boolean;
  message: string;
  responseBody?: unknown;
  errorDetails?: string;
  executionTime?: number;
}

interface ApiTestResponse {
  results: ApiTestResult[];
}

export default function ApiTestPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const fetchApiTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/google/api-direct-test');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiTestResponse = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiTest();
  }, []);

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-500">Status {status}</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge variant="destructive">Status {status}</Badge>;
    } else if (status >= 500) {
      return <Badge variant="destructive">Status {status}</Badge>;
    } else {
      return <Badge variant="secondary">Status {status}</Badge>;
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success 
      ? <CircleCheck className="h-6 w-6 text-green-500" /> 
      : <CircleX className="h-6 w-6 text-red-500" />;
  };

  // Function to format JSON for display
  const formatJSON = (data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // Function to get troubleshooting advice based on test results
  const getTroubleshootingAdvice = (result: ApiTestResult) => {
    if (result.success) return null;
    
    if (result.status === 401) {
      return (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <h4 className="font-medium text-amber-800">Authentication Issue</h4>
          <ul className="list-disc ml-5 mt-1 text-sm text-amber-700 space-y-1">
            <li>Verify your OAuth connection is set up correctly in Clerk</li>
            <li>Check that your Google account is properly connected</li>
            <li>Ensure your OAuth scope includes <code>https://www.googleapis.com/auth/business.manage</code></li>
            <li>Try disconnecting and reconnecting your Google account</li>
          </ul>
        </div>
      );
    }
    
    if (result.status === 403) {
      return (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <h4 className="font-medium text-amber-800">Permission Issue</h4>
          <ul className="list-disc ml-5 mt-1 text-sm text-amber-700 space-y-1">
            <li>Verify the API is enabled in Google Cloud Console</li>
            <li>Check that API quotas are not set to 0</li>
            <li>Ensure your project is properly set up and verified</li>
            <li>For testing mode, verify your email is added as a test user</li>
          </ul>
          <div className="mt-2">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://console.cloud.google.com/apis/library" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs"
              >
                Check API Status in Google Cloud
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      );
    }
    
    if (result.status === 404) {
      if (result.name === 'Legacy My Business API') {
        return (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <h4 className="font-medium text-amber-800">Resource Not Found</h4>
            <ul className="list-disc ml-5 mt-1 text-sm text-amber-700 space-y-1">
              <li>Verify that your Google account has associated business accounts</li>
              <li>The account ID might be invalid or incorrectly extracted</li>
              <li>Check that your business is listed in <a href="https://business.google.com/locations" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Business Profile Manager</a></li>
            </ul>
          </div>
        );
      }
      return (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <h4 className="font-medium text-amber-800">Endpoint Not Found</h4>
          <ul className="list-disc ml-5 mt-1 text-sm text-amber-700 space-y-1">
            <li>The API endpoint may have changed or is not available</li>
            <li>Verify that the API is properly enabled in Google Cloud Console</li>
          </ul>
        </div>
      );
    }
    
    return null;
  };

  // Check the overall status of the tests
  const getOverallStatus = () => {
    if (results.length === 0) return null;
    
    const allSuccess = results.every(r => r.success);
    const accountApiSuccess = results.find(r => r.name === 'Account Management API')?.success || false;
    const legacyApiSuccess = results.find(r => r.name === 'Legacy My Business API')?.success || false;
    
    if (allSuccess) {
      return (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <CircleCheck className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">All APIs Working Correctly</AlertTitle>
          <AlertDescription className="text-green-700">
            Your Google Business Profile APIs are configured correctly and working as expected.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (accountApiSuccess && !legacyApiSuccess) {
      return (
        <Alert className="bg-amber-50 border-amber-200 mb-4">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Partial API Access</AlertTitle>
          <AlertDescription className="text-amber-700">
            Account Management API is working, but Legacy API is failing. This usually indicates you have API access but might not have a Business Profile, or there might be permission issues with the Legacy API.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!accountApiSuccess) {
      return (
        <Alert className="bg-red-50 border-red-200 mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Configuration Issues</AlertTitle>
          <AlertDescription>
            The Account Management API is not working. This indicates a fundamental configuration issue with your Google API setup that needs to be addressed.
          </AlertDescription>
        </Alert>
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Google Business API Diagnostics</h1>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="mb-2 md:mb-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Setup Guide
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Google Business API Diagnostics</h1>
        </div>
        <Button onClick={fetchApiTest} className="mt-2 md:mt-0">
          <RefreshCw className="mr-2 h-4 w-4" />
          Run Diagnostics
        </Button>
      </div>

      {getOverallStatus()}

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={fetchApiTest} className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </Alert>
      ) : results.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Results</AlertTitle>
          <AlertDescription>No API test results available.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.name} className={cn(
              "border-l-4",
              result.success ? "border-l-green-500" : "border-l-red-500"
            )}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(result.success)}
                      {result.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {result.url}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(result.status)}
                    {result.executionTime && (
                      <Badge variant="outline">{result.executionTime.toFixed(3)}s</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    {result.success ? (
                      <p className="text-green-600 font-medium">{result.message}</p>
                    ) : (
                      <p className="text-red-600 font-medium">{result.message}</p>
                    )}
                  </div>

                  {getTroubleshootingAdvice(result)}

                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleExpand(result.name)}
                      className="w-full justify-between"
                    >
                      <span>Response Details</span>
                      {expandedItems[result.name] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {expandedItems[result.name] && (
                      <div className="mt-4 space-y-4">
                        {result.errorDetails && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Error Details:</h4>
                            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded text-xs overflow-x-auto">
                              {result.errorDetails}
                            </pre>
                          </div>
                        )}
                        
                        {typeof result.responseBody !== 'undefined' && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Response Body:</h4>
                            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded text-xs overflow-x-auto">
                              {formatJSON(result.responseBody)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <div className="w-full text-xs text-muted-foreground">
                  {result.success ? (
                    <p>API is working correctly.</p>
                  ) : (
                    <p>See the <Link href="/dashboard" className="underline">Setup Guide</Link> for detailed configuration instructions.</p>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="apiInfo">
            <AccordionTrigger>About These APIs</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Account Management API</h3>
                <p className="text-sm text-muted-foreground">
                  This API provides access to basic information about your Google Business Profile accounts.
                  It's used to retrieve the list of business accounts associated with your Google account and their basic properties.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Legacy My Business API (v4)</h3>
                <p className="text-sm text-muted-foreground">
                  This is the core API for accessing business location data, reviews, and other information.
                  Despite being "legacy", it's currently the most reliable API for accessing business profile data.
                  This API requires an account ID which is extracted from the Account Management API response.
                </p>
              </div>

              <div className="mt-4 text-sm">
                <p className="font-medium">API Access Requirements:</p>
                <ul className="list-disc ml-6 mt-1 space-y-1 text-muted-foreground">
                  <li>Google account with at least one Business Profile</li>
                  <li>Google Cloud project with the required APIs enabled</li>
                  <li>OAuth consent screen configured with the business.manage scope</li>
                  <li>OAuth credentials properly set up in both Google Cloud and Clerk</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
} 