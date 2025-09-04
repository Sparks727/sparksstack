"use client";

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldIcon, MailIcon, KeyIcon, CameraIcon, EditIcon, BuildingIcon, UsersIcon, PlusIcon, TrashIcon, UserIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { validateInputLength, sanitizeInput } from "@/lib/validation";

export default function DashboardPage() {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  
  // Organization state
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

    console.log('Starting photo upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id,
      userEmail: user.primaryEmailAddress?.emailAddress
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Clear the file input
      event.target.value = '';
      
      console.log('Uploading to Clerk...');
      
      // Upload to Clerk's user profile using the correct method
      await user.setProfileImage({ file });
      
      console.log('Upload successful!');
      
      // Show success message
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
      
      // Force a re-render by updating the user object
      // This is more efficient than reloading the entire page
      console.log('Reloading user data...');
      await user.reload();
      console.log('User data reloaded successfully');
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to upload image. Please try again.";
      
      if (error instanceof Error) {
        console.log('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        
        if (error.message.includes('unauthorized') || error.message.includes('permission')) {
          errorMessage = "You don't have permission to update your profile image.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('size') || error.message.includes('large')) {
          errorMessage = "Image file is too large. Please use a smaller image.";
        } else if (error.message.includes('format') || error.message.includes('type')) {
          errorMessage = "Invalid image format. Please use JPEG, PNG, or GIF.";
        }
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
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










  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.username || user?.firstName || "User"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  {user?.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt={user.fullName || 'User'} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {user?.fullName || user?.username || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Main Content - User Profile */}
          <div className="w-full">
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


                  {/* Organizations Management */}
                  <div className="space-y-4">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BuildingIcon className="h-5 w-5" />
                          Organizations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-6 text-center space-y-4">
                          <BuildingIcon className="h-16 w-16 mx-auto text-muted-foreground/50" />
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Manage Your Organizations</h3>
                            <p className="text-muted-foreground mb-4">
                              Create organizations, invite team members, and manage access with Clerk's secure organization system.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button 
                                onClick={() => window.location.href = '/dashboard/organizations'}
                                className="flex items-center gap-2"
                              >
                                <BuildingIcon className="h-4 w-4" />
                                Go to Organizations
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => window.location.href = '/dashboard/organizations/create'}
                                className="flex items-center gap-2"
                              >
                                <PlusIcon className="h-4 w-4" />
                                Create New
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">What you can do:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Create and manage organizations</li>
                            <li>• Invite team members securely</li>
                            <li>• Set role-based permissions</li>
                            <li>• Monitor organization activity</li>
                            <li>• Configure security settings</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
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