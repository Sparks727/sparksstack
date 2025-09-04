"use client";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, UserPlusIcon, MailIcon, ShieldIcon, SettingsIcon, BuildingIcon } from 'lucide-react';
import Link from 'next/link';

export default function InviteMembersPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Invite Members</h1>
            <p className="text-muted-foreground">
              Add new team members to your organization
            </p>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MailIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Email Invitations</h4>
                  <p className="text-sm text-blue-700">Send secure invites via email</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ShieldIcon className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Role Management</h4>
                  <p className="text-sm text-green-700">Assign appropriate permissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member Invitation Information */}
        <Card>
          <CardHeader>
            <CardTitle>Invite New Members</CardTitle>
            <CardDescription>
              To invite new members to your organization, use the organization management panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="p-6 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">How to Invite Members</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Member invitations are managed through Clerk's organization management system for enhanced security.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Go to <strong>Manage Organization</strong></p>
                  <p>2. Navigate to the <strong>Members</strong> section</p>
                  <p>3. Click <strong>Invite Member</strong></p>
                  <p>4. Enter the member's email address</p>
                  <p>5. Assign appropriate role (Admin/Member)</p>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/organizations/manage'}
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Manage Organization
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard/organizations'}
                >
                  <BuildingIcon className="h-4 w-4 mr-2" />
                  Back to Organizations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invitation Tips */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <h4 className="font-medium text-amber-900 mb-3">💡 Invitation Best Practices</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
              <div>
                <h5 className="font-medium mb-2">Before Inviting</h5>
                <ul className="space-y-1">
                  <li>• Verify email addresses are correct</li>
                  <li>• Choose appropriate roles for each member</li>
                  <li>• Consider starting with "Member" role</li>
                  <li>• Prepare welcome message if needed</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">After Inviting</h5>
                <ul className="space-y-1">
                  <li>• Follow up with invitees if needed</li>
                  <li>• Monitor invitation status</li>
                  <li>• Resend invitations if they expire</li>
                  <li>• Welcome new members to the team</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <h4 className="font-medium text-purple-900 mb-3">👥 Understanding Roles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-purple-800">
              <div>
                <h5 className="font-medium mb-2">Admin Role</h5>
                <ul className="space-y-1">
                  <li>• Full organization management</li>
                  <li>• Can invite and remove members</li>
                  <li>• Can change organization settings</li>
                  <li>• Can assign and change roles</li>
                  <li>• Access to all organization features</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Member Role</h5>
                <ul className="space-y-1">
                  <li>• Access to organization resources</li>
                  <li>• Can view other members</li>
                  <li>• Limited to assigned permissions</li>
                  <li>• Cannot manage organization</li>
                  <li>• Can leave organization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4">
          <Link href="/dashboard/organizations">
            <Button variant="outline">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Organizations
            </Button>
          </Link>
          <Link href="/dashboard/organizations/manage">
            <Button>
              <ShieldIcon className="h-4 w-4 mr-2" />
              Manage Organization
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
