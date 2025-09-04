"use client";

import { useUser } from '@clerk/nextjs';
import { SignOutButton } from '@clerk/nextjs';
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, UserIcon, ShieldIcon, MailIcon, KeyIcon } from "lucide-react";

export default function DashboardPage() {
  const { user } = useUser();
  
  const handlePasswordReset = () => {
    // Redirect to sign-in page for password reset
    window.location.href = '/sign-in?redirect_url=' + encodeURIComponent('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/SparksStackLogo.png"
                alt="SparksStack Logo"
                width={180}
                height={60}
                priority
                className="h-8 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}
              </span>
              <SignOutButton>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <KeyIcon className="h-4 w-4" />
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Quick Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Sign In</span>
                  <span className="text-sm font-medium">
                    {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldIcon className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start h-auto p-3">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Account Settings</span>
                    <span className="text-xs text-muted-foreground">Manage your account preferences</span>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start h-auto p-3">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Security</span>
                    <span className="text-xs text-muted-foreground">Password and 2FA settings</span>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start h-auto p-3">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Notifications</span>
                    <span className="text-xs text-muted-foreground">Email and push preferences</span>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Account Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Account Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Days as Member</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {user?.emailAddresses?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Email Addresses</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - User Profile */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your account details and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Image Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.imageUrl} alt={user?.firstName || "User"} />
                    <AvatarFallback className="text-2xl">
                      {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-muted-foreground">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>

                {/* Email Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MailIcon className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">Email Addresses</h4>
                  </div>
                  <div className="space-y-2">
                    {user?.emailAddresses?.map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">{email.emailAddress}</span>
                        <Badge variant={email.verification?.status === 'verified' ? 'default' : 'secondary'}>
                          {email.verification?.status === 'verified' ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Password Reset Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <KeyIcon className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">Password & Security</h4>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      Need to change your password or update security settings?
                    </p>
                    <Button variant="outline" size="sm" onClick={handlePasswordReset}>
                      Reset Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 