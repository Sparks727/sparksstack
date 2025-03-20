'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CircleCheck, CircleX, ExternalLink, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

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

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Google Business API Diagnostics</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchApiTest}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Google Business API Diagnostics</h1>
        <Button onClick={fetchApiTest} className="mt-2 md:mt-0">
          <RefreshCw className="mr-2 h-4 w-4" />
          Run Diagnostics
        </Button>
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Results</AlertTitle>
            <AlertDescription>No API test results available.</AlertDescription>
          </Alert>
        ) : (
          results.map((result) => (
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
                    <p>See Google Cloud Console to verify API settings.</p>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="troubleshooting">
            <AccordionTrigger>Troubleshooting Tips</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <h3 className="text-lg font-medium">Common Issues & Solutions:</h3>
              
              <div className="space-y-1">
                <h4 className="font-medium">404 Not Found Errors</h4>
                <p className="text-sm text-muted-foreground">
                  This usually indicates the API endpoint does not exist or you do not have access to it.
                  Verify that your account has a Google Business Profile associated with it.
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium">401 Unauthorized Errors</h4>
                <p className="text-sm text-muted-foreground">
                  Check that your OAuth scopes include <code>https://www.googleapis.com/auth/business.manage</code>
                  and that your OAuth client ID is properly configured.
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium">403 Forbidden Errors</h4>
                <p className="text-sm text-muted-foreground">
                  Make sure the API is enabled in Google Cloud Console and that your project has the necessary permissions.
                </p>
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://console.cloud.google.com/apis/library" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <span>Open Google Cloud Console</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
} 