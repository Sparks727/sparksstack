"use client";

import { useUser } from '@clerk/nextjs';
import { SignOutButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, UserIcon, ShieldIcon, MailIcon, KeyIcon, CameraIcon, EditIcon, BuildingIcon, UsersIcon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { validateInputLength, sanitizeInput } from "@/lib/validation";

export default function DashboardPage() {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  
  // Organization state
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePasswordReset = () => {
    // Redirect to sign-in page for password reset
    const redirectUrl = encodeURIComponent('/dashboard');
    const signInUrl = `/sign-in?redirect_url=${redirectUrl}`;
    
    // Use Next.js router for secure navigation
    if (typeof window !== 'undefined') {
      window.location.href = signInUrl;
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload to Clerk's user profile using the correct method
      await user.setProfileImage({ file });
      
      // Show success message
      alert('Profile picture updated successfully!');
      
      // Refresh the page to show the new image
      window.location.reload();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!user || !newUsername.trim()) return;

    // Validate username
    if (!validateInputLength(newUsername, 3, 30)) {
      toast({
        title: "Invalid username",
        description: "Username must be between 3 and 30 characters",
        variant: "destructive",
      });
      return;
    }

    // Check username format
    if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
      toast({
        title: "Invalid username format",
        description: "Username can only contain letters, numbers, underscores, and hyphens",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update username in Clerk
      await user.update({
        username: sanitizeInput(newUsername)
      });
      
      setIsEditingUsername(false);
      toast({
        title: "Success",
        description: "Username updated successfully!",
      });
      
      // Refresh the page to show the new username
      window.location.reload();
    } catch (error) {
      console.error('Error updating username:', error);
      toast({
        title: "Error",
        description: "Failed to update username. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelUsernameEdit = () => {
    setIsEditingUsername(false);
    setNewUsername(user?.username || '');
  };

  // Secure API functions for organizations
  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      });
    }
  };

  // Load organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Organization management functions
  const createOrganization = async () => {
    if (!newOrgName.trim()) return;
    
    // Validate input
    if (!validateInputLength(newOrgName, 2, 100)) {
      toast({
        title: "Invalid input",
        description: "Organization name must be between 2 and 100 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: sanitizeInput(newOrgName) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create organization');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Organization created successfully!",
      });
      
      setNewOrgName('');
      setShowCreateOrg(false);
      fetchOrganizations(); // Refresh the list
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create organization",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMemberToOrganization = async (orgId: string) => {
    if (!newMemberEmail.trim()) return;
    
    // Validate email
    if (!newMemberEmail.includes('@') || newMemberEmail.length > 254) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/organizations/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          organizationId: orgId,
          email: sanitizeInput(newMemberEmail),
          role: 'member'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Member invited successfully!",
      });
      
      setNewMemberEmail('');
      fetchOrganizations(); // Refresh the list
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeMemberFromOrganization = async (orgId: string, memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/organizations/members?organizationId=${orgId}&memberId=${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Member removed successfully!",
      });
      
      fetchOrganizations(); // Refresh the list
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrganization = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/organizations?id=${orgId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete organization');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Organization deleted successfully!",
      });
      
      fetchOrganizations(); // Refresh the list
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete organization",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                Welcome, {user?.username || user?.firstName || "User"}
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
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.imageUrl} alt={user?.firstName || "User"} />
                      <AvatarFallback className="text-2xl">
                        {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Avatar Upload Section */}
                    <div className="mt-3 space-y-2">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full flex items-center gap-2"
                          disabled={isUploading}
                        >
                          <CameraIcon className="h-4 w-4" />
                          {isUploading ? 'Uploading...' : 'Change Photo'}
                        </Button>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        JPG, PNG or GIF. Max 5MB.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    
                    {/* Username Section */}
                    <div className="mt-2">
                      {isEditingUsername ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter username"
                            className="w-32"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleUsernameUpdate}
                            className="h-8 px-2"
                          >
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={cancelUsernameEdit}
                            className="h-8 px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {user?.username ? (
                            <p className="text-lg font-medium text-primary">
                              @{user.username}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No username set
                            </p>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingUsername(true)}
                            className="h-6 w-6 p-0"
                          >
                            <EditIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mt-2">
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

                {/* Organization Management Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BuildingIcon className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-medium">Organizations</h4>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setShowCreateOrg(true)}
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Create Organization
                    </Button>
                  </div>

                  {/* Create Organization Form */}
                  {showCreateOrg && (
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <h5 className="font-medium">Create New Organization</h5>
                      <div className="flex gap-2">
                        <Input
                          value={newOrgName}
                          onChange={(e) => setNewOrgName(e.target.value)}
                          placeholder="Organization name"
                          className="flex-1"
                        />
                        <Button size="sm" onClick={createOrganization} disabled={isLoading}>
                          {isLoading ? 'Creating...' : 'Create'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowCreateOrg(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Organizations List */}
                  <div className="space-y-4">
                    {organizations.map((org) => (
                      <Card key={org.id} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{org.name}</CardTitle>
                              <CardDescription>Slug: {org.slug}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {org.members.length} members
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteOrganization(org.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Members List */}
                          <div>
                            <h6 className="font-medium mb-2 flex items-center gap-2">
                              <UsersIcon className="h-4 w-4" />
                              Members
                            </h6>
                            <div className="space-y-2">
                              {org.members.map((member: any) => (
                                <div key={member.id} className="flex items-center justify-between p-2 bg-background rounded border">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{member.email}</span>
                                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                      {member.role}
                                    </Badge>
                                    <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
                                      {member.status}
                                    </Badge>
                                  </div>
                                  {member.role !== 'admin' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMemberFromOrganization(org.id, member.id)}
                                      className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Add Member Form */}
                          <div className="flex gap-2">
                            <Input
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              placeholder="Add member by email"
                              className="flex-1"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => addMemberToOrganization(org.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Adding...' : 'Add Member'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {organizations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <BuildingIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No organizations yet</p>
                        <p className="text-sm">Create your first organization to get started</p>
                      </div>
                    )}
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