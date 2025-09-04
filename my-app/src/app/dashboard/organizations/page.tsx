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
  CameraIcon
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
          <Button 
            onClick={() => window.location.href = '/dashboard/organizations/create'}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Create Organization
          </Button>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/dashboard/organizations/manage'}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Organizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BuildingIcon className="h-5 w-5" />
              Your Organizations
            </CardTitle>
            <CardDescription>
              Switch between organizations or manage your memberships
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userMemberships.data && userMemberships.data.length > 0 ? (
              <div className="space-y-4">
                {userMemberships.data.map((membership) => (
                  <div
                    key={membership.organization.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                      organization?.id === membership.organization.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BuildingIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{membership.organization.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Your role: <Badge variant="outline">{membership.role}</Badge>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {membership.organization.membersCount || 0} members
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {organization?.id !== membership.organization.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwitchOrganization(membership.organization.id)}
                        >
                          Switch to
                        </Button>
                      )}
                      
                      {membership.role === 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = '/dashboard/organizations/manage'}
                        >
                          <SettingsIcon className="h-4 w-4 mr-2" />
                          Admin
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/dashboard/organizations/manage'}
                        className="text-red-600 hover:text-red-700"
                      >
                        Leave
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BuildingIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No organizations yet</p>
                <p className="text-sm">Create your first organization to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                onClick={() => window.location.href = '/dashboard/organizations/create'}>
            <CardContent className="p-6 text-center">
              <PlusIcon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Create Organization</h3>
              <p className="text-sm text-muted-foreground">
                Start a new organization for your team
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = '/dashboard/organizations/manage'}>
            <CardContent className="p-6 text-center">
              <SettingsIcon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Manage Organization</h3>
              <p className="text-sm text-muted-foreground">
                Configure settings and manage members
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = '/dashboard/organizations/invite'}>
            <CardContent className="p-6 text-center">
              <BuildingIcon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Invite Members</h3>
              <p className="text-sm text-muted-foreground">
                Add new team members to your organization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Information Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ShieldIcon className="h-5 w-5 text-primary" />
              Security & Best Practices
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Organization Security</h4>
                <ul className="space-y-1">
                  <li>• Role-based access control</li>
                  <li>• Secure member invitations</li>
                  <li>• Audit logs for all changes</li>
                  <li>• SSO integration support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Member Management</h4>
                <ul className="space-y-1">
                  <li>• Email-based invitations</li>
                  <li>• Role assignment (Admin/Member)</li>
                  <li>• Member removal and role changes</li>
                  <li>• Organization transfer capabilities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
