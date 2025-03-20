/* eslint-disable */
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivitySquare, ArrowRight, CheckCircle, Cog, ExternalLink, FileText, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const runApiTest = () => {
    router.push('/dashboard/api-direct-test');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Google Business Profile API Setup</h1>
        <p className="text-muted-foreground">
          Complete each step to set up your API connections properly
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="setup" className="flex items-center gap-2">
                <Cog className="h-4 w-4" />
                <span>Setup Guide</span>
              </TabsTrigger>
              <TabsTrigger value="troubleshoot" className="flex items-center gap-2">
                <ActivitySquare className="h-4 w-4" />
                <span>Troubleshooting</span>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
        </Card>

        <TabsContent value="overview" className="mt-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Google Business Profile APIs</CardTitle>
              <CardDescription>
                Follow these steps to connect your Google Business Profile with this application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  You must have a Google account with at least one Business Profile associated with it.
                  If you don't have a Business Profile, create one at <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">business.google.com</a>
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Test API Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm">
                      Run a diagnostic test to check the connection with Google Business Profile APIs
                    </p>
                    <Button onClick={runApiTest} className="w-full">
                      Run API Test
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Complete Setup Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm">
                      Follow our step-by-step guide to properly set up your Google Business Profile APIs
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab('setup')} className="w-full">
                      View Setup Guide
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="setup" className="mt-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Setup Guide</CardTitle>
              <CardDescription>
                Complete all steps to set up Google Business Profile APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">1</span>
                    Google Cloud Project Setup
                  </h3>
                  <ol className="mt-2 space-y-2 ml-8 list-decimal">
                    <li>
                      Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a>
                    </li>
                    <li>Create a new project or select an existing one</li>
                    <li>Make sure billing is enabled for your project (required for API usage)</li>
                    <li>Note your Project ID - you'll need it later</li>
                  </ol>
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                      Open Google Cloud Console
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">2</span>
                    Enable Required APIs
                  </h3>
                  <ol className="mt-2 space-y-2 ml-8 list-decimal">
                    <li>Navigate to "APIs & Services" {`>`} "Library" in Google Cloud Console</li>
                    <li>Search for and enable the following APIs:
                      <ul className="list-disc ml-6 mt-1">
                        <li>"Google My Business Account Management API"</li>
                        <li>"Google My Business API" (Legacy v4)</li>
                      </ul>
                    </li>
                  </ol>
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                      Go to API Library
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">3</span>
                    Configure OAuth Consent Screen
                  </h3>
                  <ol className="mt-2 space-y-2 ml-8 list-decimal">
                    <li>Go to "APIs & Services" {`>`} "OAuth consent screen"</li>
                    <li>Select "External" as the user type (or "Internal" if using Google Workspace)</li>
                    <li>Fill in the required app information:
                      <ul className="list-disc ml-6 mt-1">
                        <li>App name (e.g., "My Business Profile Manager")</li>
                        <li>User support email</li>
                        <li>Developer contact information</li>
                      </ul>
                    </li>
                    <li>Add the scopes:
                      <ul className="list-disc ml-6 mt-1">
                        <li>https://www.googleapis.com/auth/business.manage (essential)</li>
                      </ul>
                    </li>
                    <li>Add your email as a test user if your app is in testing mode</li>
                  </ol>
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                      Configure Consent Screen
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">4</span>
                    Create OAuth Credentials
                  </h3>
                  <ol className="mt-2 space-y-2 ml-8 list-decimal">
                    <li>Go to "APIs & Services" {`>`} "Credentials"</li>
                    <li>Click "Create Credentials" {`>`} "OAuth client ID"</li>
                    <li>Select "Web application" as the application type</li>
                    <li>Name your client (e.g., "My Business Profile Client")</li>
                    <li>Add Authorized JavaScript origins:
                      <ul className="list-disc ml-6 mt-1">
                        <li>http://localhost:3000 (for development)</li>
                        <li>Your production domain (e.g., https://yourdomain.com)</li>
                      </ul>
                    </li>
                    <li>Add Authorized redirect URIs:
                      <ul className="list-disc ml-6 mt-1">
                        <li>https://accounts.google.com/gsi/select</li>
                        <li>https://clerk.your-org.com/v1/oauth_callback</li>
                      </ul>
                    </li>
                    <li>Click "Create" and note your Client ID and Client Secret</li>
                  </ol>
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                      Create Credentials
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">5</span>
                    Configure Clerk OAuth
                  </h3>
                  <ol className="mt-2 space-y-2 ml-8 list-decimal">
                    <li>Log in to your <a href="https://dashboard.clerk.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Clerk Dashboard</a></li>
                    <li>Select your application</li>
                    <li>Go to "User & Authentication" {`>`} "Social Connections"</li>
                    <li>Find and enable "Google"</li>
                    <li>Enter your Client ID and Client Secret from the previous step</li>
                    <li>Add the required scope: "https://www.googleapis.com/auth/business.manage"</li>
                    <li>Save your changes</li>
                  </ol>
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <a href="https://dashboard.clerk.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                      Open Clerk Dashboard
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">6</span>
                    Test API Connection
                  </h3>
                  <p className="mt-2 ml-8">
                    Now that your setup is complete, test the connection to your Google Business Profile APIs:
                  </p>
                  <div className="ml-8 mt-4">
                    <Button onClick={runApiTest}>
                      Run API Test
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="troubleshoot" className="mt-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Guide</CardTitle>
              <CardDescription>
                Common issues and solutions for Google Business Profile API connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium">401 Unauthorized Errors</h3>
                  <div className="mt-2 ml-4 space-y-2">
                    <p><strong>Problem:</strong> Authentication issues with the Google API</p>
                    <p><strong>Solutions:</strong></p>
                    <ul className="list-disc ml-6">
                      <li>Verify that your OAuth client ID and secret are correctly configured in Clerk</li>
                      <li>Check that your Google account has connected via OAuth in your user profile</li>
                      <li>Ensure your OAuth scopes include "https://www.googleapis.com/auth/business.manage"</li>
                      <li>Try disconnecting and reconnecting your Google account</li>
                      <li>Verify that your JWT template in Clerk is properly configured</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium">403 Forbidden Errors</h3>
                  <div className="mt-2 ml-4 space-y-2">
                    <p><strong>Problem:</strong> Permission issues with the Google API</p>
                    <p><strong>Solutions:</strong></p>
                    <ul className="list-disc ml-6">
                      <li>Ensure that both required APIs are enabled in Google Cloud Console</li>
                      <li>Verify that API quotas are not set to 0 (check in Google Cloud Console)</li>
                      <li>For the Legacy API, you may need to complete the verification process</li>
                      <li>Check that your Google account has permissions to manage Business Profiles</li>
                      <li>If using Testing mode, verify that your email is added as a test user</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium">404 Not Found Errors</h3>
                  <div className="mt-2 ml-4 space-y-2">
                    <p><strong>Problem:</strong> Resource or endpoint not found</p>
                    <p><strong>Solutions:</strong></p>
                    <ul className="list-disc ml-6">
                      <li>Verify that your Google account has associated Business Profiles</li>
                      <li>Check that the account ID is being correctly extracted and used</li>
                      <li>Make sure you're using the correct API version and endpoint format</li>
                      <li>Verify the Business Profile is accessible in <a href="https://business.google.com/locations" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Business Profile Manager</a></li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">No Business Accounts Found</h3>
                  <div className="mt-2 ml-4 space-y-2">
                    <p><strong>Problem:</strong> No Business Profiles associated with your account</p>
                    <p><strong>Solutions:</strong></p>
                    <ul className="list-disc ml-6">
                      <li>Ensure you're logged in with the correct Google account</li>
                      <li>Verify you have a Business Profile at <a href="https://business.google.com/locations" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Business Profile Manager</a></li>
                      <li>If you don't have a Business Profile, create one at <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">business.google.com</a></li>
                      <li>Ensure your Business Profile is verified with Google</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 