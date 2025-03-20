'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CircleCheck, CircleX, CircleAlert, ExternalLink, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ApiTestResult {
  name: string;
  success: boolean;
  statusCode: number;
  statusText: string;
  errorMessage: string | null;
  errorDetails: unknown;
  responseBody: unknown;
  requestDetails: {
    endpoint: string;
    method: string;
    apiService: string;
  };
  recommendations: string[];
}

interface ApiTestResponse {
  success: boolean;
  message: string;
  results: ApiTestResult[];
  overallRecommendations: string[];
  tokenInfo: {
    present: boolean;
    prefix: string;
    length: number;
  };
}

export default function ApiDirectTestPage() {
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<ApiTestResponse | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const runTests = async () => {
    setTesting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/google/api-direct-test');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTestResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setTesting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (result: ApiTestResult) => {
    if (result.success) {
      return <CircleCheck className="h-8 w-8 text-green-500" />;
    }
    if (result.statusCode >= 500) {
      return <CircleAlert className="h-8 w-8 text-amber-500" />;
    }
    return <CircleX className="h-8 w-8 text-red-500" />;
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-500">{statusCode}</Badge>;
    }
    if (statusCode >= 400 && statusCode < 500) {
      return <Badge className="bg-red-500">{statusCode}</Badge>;
    }
    if (statusCode >= 500) {
      return <Badge className="bg-amber-500">{statusCode}</Badge>;
    }
    return <Badge>{statusCode}</Badge>;
  };

  if (loading || testing) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Google Business API Direct Test</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Google Business API Direct Test</h1>
        <Alert variant="destructive">
          <AlertTitle>Error Running Tests</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={runTests} disabled={testing}>
          {testing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Try Again
        </Button>
      </div>
    );
  }

  if (!testResults) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Google Business API Direct Test</h1>
        <Alert>
          <AlertTitle>No Results</AlertTitle>
          <AlertDescription>No test results available. Please run the tests.</AlertDescription>
        </Alert>
        <Button onClick={runTests} disabled={testing}>
          {testing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Run Tests
        </Button>
      </div>
    );
  }

  const passedApis = testResults.results.filter(r => r.success);
  const failedApis = testResults.results.filter(r => !r.success);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold">Google Business API Direct Test</h1>
        <Button onClick={runTests} className="mt-2 md:mt-0" disabled={testing}>
          {testing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Run Tests Again
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">API Details</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
              <CardDescription>
                {testResults.success
                  ? 'All APIs are working correctly'
                  : `${failedApis.length} of ${testResults.results.length} APIs failed testing`}
              </CardDescription>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>We are now focusing on the Legacy Google My Business API for all operations.</p>
                <p>Other specialized APIs have been disabled in Google Cloud Console.</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">{passedApis.length}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">APIs Working</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400">{failedApis.length}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">APIs Failing</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <h3 className="font-medium">Overall Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {testResults.overallRecommendations.map((rec, i) => (
                    <li key={i} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-gray-500">
              Google OAuth Token: {testResults.tokenInfo.present 
                ? `Present (${testResults.tokenInfo.prefix}, length: ${testResults.tokenInfo.length})` 
                : 'Not found'}
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testResults.results.map((result) => (
              <Card key={result.name} className={result.success ? 'border-green-200' : 'border-red-200'}>
                <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                  {getStatusIcon(result)}
                  <div>
                    <CardTitle className="text-lg">{result.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      {getStatusBadge(result.statusCode)}
                      <span>{result.statusText}</span>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {!result.success && result.errorMessage && (
                    <div className="text-sm text-red-500 mb-2">{result.errorMessage}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    {result.requestDetails.method} {result.requestDetails.endpoint}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {testResults.results.map((result) => (
              <Accordion type="single" collapsible key={result.name}>
                <AccordionItem value={result.name}>
                  <AccordionTrigger className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result)}
                      <div className="text-left">
                        <p className="font-medium">{result.name}</p>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(result.statusCode)}
                          <span className="text-sm">{result.statusText}</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-b-md">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Request Details</h4>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                          <p>Method: {result.requestDetails.method}</p>
                          <p>Endpoint: {result.requestDetails.endpoint}</p>
                          <p>API Service: {result.requestDetails.apiService}</p>
                        </div>
                      </div>
                      
                      {!result.success && result.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-1">Recommendations</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {result.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.responseBody && (
                        <div>
                          <h4 className="font-medium mb-1">Response Body</h4>
                          <ScrollArea className="h-[200px] w-full">
                            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                              {typeof result.responseBody === 'string' 
                                ? result.responseBody 
                                : JSON.stringify(result.responseBody, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overall Recommendations</CardTitle>
              <CardDescription>
                Based on the test results, here are recommendations to fix issues with your Google Business APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-3">
                {testResults.overallRecommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
              
              {failedApis.length > 0 && (
                <>
                  <h3 className="font-medium mt-6 mb-2">API-Specific Recommendations</h3>
                  <div className="space-y-4">
                    {failedApis.map((api) => (
                      <div key={api.name} className="p-4 border rounded-md">
                        <h4 className="font-medium flex items-center space-x-2">
                          {getStatusBadge(api.statusCode)}
                          <span>{api.name}</span>
                        </h4>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {api.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <div className="text-sm">
                <p className="font-medium">Google Cloud Console Resources</p>
                <ul className="mt-1 space-y-1">
                  <li className="flex items-center">
                    <a 
                      href="https://console.cloud.google.com/apis/dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      API Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                  <li className="flex items-center">
                    <a 
                      href="https://console.cloud.google.com/apis/library" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      API Library <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                  <li className="flex items-center">
                    <a 
                      href="https://console.cloud.google.com/apis/quotas" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      API Quotas <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                </ul>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 