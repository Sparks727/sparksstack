"use client";

import { useUser, useOrganization } from '@clerk/nextjs';
import { OrganizationProfile } from '@clerk/nextjs';

export default function OrganizationsDashboard() {
  const { user } = useUser();
  const { organization } = useOrganization();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
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
  );
}
