"use client";

import { useUser, useOrganization } from '@clerk/nextjs';
import { OrganizationProfile } from '@clerk/nextjs';
import { BuildingIcon } from 'lucide-react';

export default function OrganizationsDashboard() {
  const { user } = useUser();
  const { organization } = useOrganization();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <BuildingIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Organizations</h1>
            <p className="text-sm text-muted-foreground">
              Manage your organization settings
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <OrganizationProfile 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0",
                pageScrollBox: "p-0",
                navbar: "hidden",
                pageContent: "p-0"
              }
            }}
            path="/dashboard/organizations"
            routing="path"
          />
        </div>
      </div>
    </div>
  );
}
