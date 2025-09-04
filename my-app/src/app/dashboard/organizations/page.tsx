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
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your organizations and team members
            </p>
          </div>
          {!organization && (
            <Button 
              onClick={() => window.location.href = '/dashboard/organizations/create'}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Create Organization
            </Button>
          )}
        </div>

        {/* All Organizations */}
        {userMemberships && userMemberships.data && userMemberships.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">All Organizations</CardTitle>
              <CardDescription>
                Switch between your organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userMemberships.data.map((membership) => (
                  <div
                    key={membership.organization.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BuildingIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{membership.organization.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {membership.role}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {membership.organization.id === organization?.id && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwitchOrganization(membership.organization.id)}
                        disabled={membership.organization.id === organization?.id}
                        className="text-xs h-8 px-3"
                      >
                        {membership.organization.id === organization?.id ? 'Current' : 'Switch'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organization Management Section */}
        {organization && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Organization Management</CardTitle>
              <CardDescription>
                Manage your organization settings, members, and access control
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
