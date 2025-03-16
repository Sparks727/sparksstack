"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ConnectGBP } from "@/components/dashboard/connect-gbp";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { LocationSwitcher } from "@/components/dashboard/location-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocationStore } from "@/lib/store/location-store";

// Icons for metrics cards
function ViewsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SearchesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ActionsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function RatingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { locations, activeLocationId } = useLocationStore();
  
  // Protect this page - redirect if not authenticated
  if (isLoaded && !user) {
    redirect("/");
  }

  // Find the active location
  const activeLocation = locations.find(loc => loc.id === activeLocationId) || locations[0];

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
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {activeLocation ? activeLocation.name : 'Dashboard'} Overview
              </h1>
              <p className="text-muted-foreground">
                Monitor your Google Business Profile performance and analytics
              </p>
            </div>

            {/* Google Business Profile connection status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {!activeLocation?.isConnected ? (
                <ConnectGBP />
              ) : (
                <Card className="col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle>Connected Profile</CardTitle>
                    <CardDescription>Google Business Profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#4285F4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{activeLocation.name}</div>
                        <div className="text-xs text-muted-foreground">Connected profile</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Key metrics */}
              <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricsCard 
                  title="Profile Views" 
                  value="3,254" 
                  icon={<ViewsIcon />} 
                  description="Total views this month"
                  change={{ value: 12, type: "positive" }}
                />
                <MetricsCard 
                  title="Search Appearances" 
                  value="2,143" 
                  icon={<SearchesIcon />} 
                  description="Times your business appeared in search"
                  change={{ value: 8, type: "positive" }}
                />
                <MetricsCard 
                  title="Customer Actions" 
                  value="547" 
                  icon={<ActionsIcon />} 
                  description="Website visits, calls, directions"
                  change={{ value: 5, type: "positive" }}
                />
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricsChart />
              
              {/* Reviews summary */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                  <CardDescription>Customer feedback summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-4xl font-bold flex items-center">
                      4.7 
                      <RatingIcon />
                    </div>
                    <div className="text-sm text-muted-foreground">Based on 142 reviews</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">5 stars</span>
                      <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <span className="text-sm">70%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">4 stars</span>
                      <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="text-sm">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">3 stars</span>
                      <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '7%' }}></div>
                      </div>
                      <span className="text-sm">7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">2 stars</span>
                      <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '2%' }}></div>
                      </div>
                      <span className="text-sm">2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">1 star</span>
                      <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '1%' }}></div>
                      </div>
                      <span className="text-sm">1%</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline">View All Reviews</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 