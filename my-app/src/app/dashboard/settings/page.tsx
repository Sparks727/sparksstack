"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { LocationSwitcher } from "@/components/dashboard/location-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useLocationStore } from "@/lib/store/location-store";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { locations, activeLocationId } = useLocationStore();
  
  // Protect this page - redirect if not authenticated
  if (isLoaded && !user) {
    redirect("/");
  }

  // Find the active location
  const activeLocation = locations.find(loc => loc.id === activeLocationId) || locations[0];

  const [googleBusinessConnected, setGoogleBusinessConnected] = useState(activeLocation?.isConnected || false);
  const [googleAnalyticsConnected, setGoogleAnalyticsConnected] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [apiRefreshRate, setApiRefreshRate] = useState("24");

  const [connectedMetrics, setConnectedMetrics] = useState({
    profileViews: true,
    searchAppearances: true,
    customerActions: true,
    reviews: true
  });

  const toggleConnection = (service: 'google' | 'analytics' | 'facebook') => {
    if (service === 'google') setGoogleBusinessConnected(!googleBusinessConnected);
    if (service === 'analytics') setGoogleAnalyticsConnected(!googleAnalyticsConnected);
    if (service === 'facebook') setFacebookConnected(!facebookConnected);
  };

  const handleMetricToggle = (metric: keyof typeof connectedMetrics) => {
    setConnectedMetrics({
      ...connectedMetrics,
      [metric]: !connectedMetrics[metric]
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SidebarNav />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-3 flex justify-between items-center">
            <LocationSwitcher />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                Welcome, {user?.firstName}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {activeLocation ? `${activeLocation.name} Settings` : 'Settings & Integrations'}
              </h1>
              <p className="text-muted-foreground">
                Configure your API connections and preferences
              </p>
            </div>

            {/* Current Location Info */}
            {activeLocation && (
              <Card>
                <CardHeader>
                  <CardTitle>Location Information</CardTitle>
                  <CardDescription>Basic information about this business location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Address</h3>
                      <p className="text-sm text-muted-foreground">{activeLocation.address}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Phone</h3>
                      <p className="text-sm text-muted-foreground">{activeLocation.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Website</h3>
                    <p className="text-sm text-muted-foreground">{activeLocation.website}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">Edit Location Details</Button>
                </CardFooter>
              </Card>
            )}

            {/* Connected Services */}
            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>Manage your third-party API integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google Business Profile */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#4285F4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Google Business Profile</h3>
                      <p className="text-sm text-muted-foreground">Sync your business metrics and reviews</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => toggleConnection('google')} 
                    variant={googleBusinessConnected ? "destructive" : "default"}
                    className={googleBusinessConnected ? "" : "bg-[#4285F4] hover:bg-[#3367d6]"}
                  >
                    {googleBusinessConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>

                {/* Google Analytics */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#F57C00" viewBox="0 0 24 24">
                        <path d="M19.86 21a2.12 2.12 0 0 1-1.55-.68 2.59 2.59 0 0 1-.67-1.87V5.19c0-.85.12-1.57.67-2.03.46-.45 1.13-.58 1.88-.58.55 0 1.34.06 1.93.6.69.6.8 1.57.8 2.39v12.9c0 1.13-.33 1.66-.8 2.03-.43.31-1.02.5-1.76.5h-.5zM6.86 12.19v8.96c0 .3.19.5.5.5h.53c.3 0 .5-.2.5-.5v-8.96c0-.3-.2-.5-.5-.5h-.53c-.31 0-.5.2-.5.5zm6.94-1.5v10.46c0 .3.19.5.5.5h.53c.3 0 .5-.2.5-.5V10.69c0-.3-.2-.5-.5-.5h-.53c-.31 0-.5.2-.5.5zM0 20.69c0 .7.28 1.3.75 1.77.47.46 1.1.75 1.8.75.68 0 1.32-.29 1.78-.75.47-.47.75-1.07.75-1.77V4.31c0-.82-.1-1.79-.8-2.39-.59-.54-1.38-.6-1.93-.6-.75 0-1.42.13-1.88.58C.12 2.37 0 3.09 0 3.94V20.7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Google Analytics</h3>
                      <p className="text-sm text-muted-foreground">Track website performance and user behavior</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => toggleConnection('analytics')} 
                    variant={googleAnalyticsConnected ? "destructive" : "default"}
                    className={googleAnalyticsConnected ? "" : "bg-[#F57C00] hover:bg-[#E65100]"}
                  >
                    {googleAnalyticsConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>

                {/* Facebook Integration */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Facebook</h3>
                      <p className="text-sm text-muted-foreground">Connect your Facebook business page</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => toggleConnection('facebook')} 
                    variant={facebookConnected ? "destructive" : "default"}
                    className={facebookConnected ? "" : "bg-[#1877F2] hover:bg-[#0b5fcc]"}
                  >
                    {facebookConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Customize your API integration settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google Business Profile API Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Google Business Profile Metrics</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure which metrics to fetch and display on your dashboard
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="metric-views" 
                        className="rounded"
                        checked={connectedMetrics.profileViews}
                        onChange={() => handleMetricToggle('profileViews')}
                      />
                      <label htmlFor="metric-views" className="text-sm">Profile Views</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="metric-searches" 
                        className="rounded"
                        checked={connectedMetrics.searchAppearances}
                        onChange={() => handleMetricToggle('searchAppearances')}
                      />
                      <label htmlFor="metric-searches" className="text-sm">Search Appearances</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="metric-actions" 
                        className="rounded"
                        checked={connectedMetrics.customerActions}
                        onChange={() => handleMetricToggle('customerActions')}
                      />
                      <label htmlFor="metric-actions" className="text-sm">Customer Actions</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="metric-reviews" 
                        className="rounded"
                        checked={connectedMetrics.reviews}
                        onChange={() => handleMetricToggle('reviews')}
                      />
                      <label htmlFor="metric-reviews" className="text-sm">Reviews</label>
                    </div>
                  </div>
                </div>

                {/* Data Refresh Rate */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Data Refresh Rate</h3>
                  <p className="text-sm text-muted-foreground">
                    How often to fetch new data from connected APIs
                  </p>
                  <select 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={apiRefreshRate}
                    onChange={(e) => setApiRefreshRate(e.target.value)}
                  >
                    <option value="24">Every 24 hours</option>
                    <option value="12">Every 12 hours</option>
                    <option value="6">Every 6 hours</option>
                    <option value="1">Every hour</option>
                  </select>
                </div>

                {/* API Webhooks */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">API Webhook URL</h3>
                  <p className="text-sm text-muted-foreground">
                    Send real-time updates to this URL when data changes
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="https://yourdomain.com/api/webhook"
                    />
                    <Button variant="outline">Save</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Save Configuration</Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 