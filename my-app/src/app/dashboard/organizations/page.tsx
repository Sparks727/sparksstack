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
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Organization Management
              </CardTitle>
              <CardDescription>
                Manage your organization settings, members, and security policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Member Management */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <UsersIcon className="h-6 w-6 text-primary" />
                    <h4 className="font-medium">Members</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manage team members, roles, and permissions
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Members
                  </Button>
                </div>

                {/* Invite Members */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <UserPlusIcon className="h-6 w-6 text-primary" />
                    <h4 className="font-medium">Invite Members</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send invitations to new team members
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Invite Members
                  </Button>
                </div>

                {/* Organization Settings */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <SettingsIcon className="h-6 w-6 text-primary" />
                    <h4 className="font-medium">Settings</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure organization preferences and policies
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Configure Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}






      </div>
    </div>
  );
}
