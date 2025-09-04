"use client";

import { OrganizationProfile } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default function ManageOrganizationPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/organizations">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Organizations
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Organization</h1>
            <p className="text-muted-foreground">
              Configure settings, manage members, and control access
            </p>
          </div>
        </div>

        {/* Clerk Organization Profile Component */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Management</CardTitle>
            <CardDescription>
              Use the panel below to manage your organization settings, members, and security policies.
              All changes are automatically saved and secured by Clerk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <OrganizationProfile 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                    card: 'shadow-none',
                    headerTitle: 'text-2xl font-bold',
                    headerSubtitle: 'text-muted-foreground',
                    pageScrollBox: 'max-h-[800px]',
                  }
                }}
                path="/dashboard/organizations/manage"
                routing="path"
              />
            </div>
          </CardContent>
        </Card>

        {/* Management Tips */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <h4 className="font-medium text-amber-900 mb-3">🔧 Management Tips</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
              <div>
                <h5 className="font-medium mb-2">Member Management</h5>
                <ul className="space-y-1">
                  <li>• Invite members by email address</li>
                  <li>• Assign appropriate roles (Admin/Member)</li>
                  <li>• Set up member permissions</li>
                  <li>• Monitor member activity</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Security Settings</h5>
                <ul className="space-y-1">
                  <li>• Configure SSO if available</li>
                  <li>• Set up domain restrictions</li>
                  <li>• Manage API access</li>
                  <li>• Review audit logs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform from this management panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 text-primary flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <h5 className="font-medium">Invite Members</h5>
                <p className="text-sm text-muted-foreground">Add new team members</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 text-primary flex items-center justify-center">
                  <span className="text-lg">🔐</span>
                </div>
                <h5 className="font-medium">Manage Roles</h5>
                <p className="text-sm text-muted-foreground">Change member permissions</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 text-primary flex items-center justify-center">
                  <span className="text-lg">⚙️</span>
                </div>
                <h5 className="font-medium">Update Settings</h5>
                <p className="text-sm text-muted-foreground">Modify organization details</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 text-primary flex items-center justify-center">
                  <span className="text-lg">🛡️</span>
                </div>
                <h5 className="font-medium">Security</h5>
                <p className="text-sm text-muted-foreground">Configure access policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
