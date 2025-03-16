"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const toggleConnection = (service: 'google' | 'analytics' | 'facebook') => {
    if (service === 'google') setGoogleBusinessConnected(!googleBusinessConnected);
    if (service === 'analytics') setGoogleAnalyticsConnected(!googleAnalyticsConnected);
    if (service === 'facebook') setFacebookConnected(!facebookConnected);
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and integration settings</p>
      </div>

      <div className="space-y-6">
        {/* Connection Settings */}
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
      </div>
    </>
  );
} 