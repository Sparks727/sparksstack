"use client";

import { CreateOrganization } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, BuildingIcon } from 'lucide-react';
import Link from 'next/link';

export default function CreateOrganizationPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/organizations">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Organizations
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Organization</h1>
            <p className="text-muted-foreground">
              Set up a new organization for your team
            </p>
          </div>
        </div>

        {/* Information Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BuildingIcon className="h-5 w-5 text-primary" />
              About Organizations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">What is an Organization?</h4>
                <p className="text-sm text-muted-foreground">
                  Organizations allow you to collaborate with team members, manage permissions, 
                  and share resources securely. Each member can have different roles and access levels.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Key Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Team member management</li>
                  <li>• Role-based access control</li>
                  <li>• Secure file sharing</li>
                  <li>• Activity monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clerk Create Organization Component */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Fill in the details below to create your new organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <CreateOrganization 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                    card: 'shadow-none',
                    headerTitle: 'text-2xl font-bold',
                    headerSubtitle: 'text-muted-foreground',
                  }
                }}
                afterCreateOrganizationUrl="/dashboard/organizations"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h4 className="font-medium text-blue-900 mb-3">💡 Pro Tips</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Organization Name:</strong> Choose a clear, memorable name that reflects your team or project.</p>
              <p><strong>Slug:</strong> This will be used in URLs and should be URL-friendly (lowercase, no spaces).</p>
              <p><strong>Privacy:</strong> You can always change organization settings later in the management panel.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
