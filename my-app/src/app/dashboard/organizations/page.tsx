"use client";

import { useUser, useOrganization, useOrganizationList } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BuildingIcon, 
  PlusIcon, 
  SettingsIcon, 
  CrownIcon,
  ShieldIcon,
  CameraIcon,
  UsersIcon,
  UserPlusIcon
} from 'lucide-react';
import { OrganizationProfile } from '@clerk/nextjs';

export default function OrganizationsDashboard() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { userMemberships, setActive } = useOrganizationList();

  const handleSwitchOrganization = async (orgId: string) => {
    try {
      if (setActive) {
        await setActive({ organization: orgId });
        // Success - organization switched
      }
    } catch (error) {
      console.error('Error switching organization:', error);
      // Handle error silently for now
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">
              Manage your organizations and team members
            </p>
          </div>
          {!organization && (
            <Button 
              onClick={() => window.location.href = '/dashboard/organizations/create'}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Create Organization
            </Button>
          )}
        </div>

        {/* Current Organization */}
        {organization && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CrownIcon className="h-5 w-5 text-primary" />
                Current Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Organization Avatar */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BuildingIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-muted border-2 border-background rounded-full p-1">
                      <CameraIcon className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{organization.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Slug: {organization.slug}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(organization.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Organization photos can be managed in the organization settings
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ShieldIcon className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organization Management Section */}
        {organization && (
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
                  path="/dashboard/organizations"
                  routing="path"
                />
              </div>
            </CardContent>
          </Card>
        )}






      </div>
    </div>
  );
}
