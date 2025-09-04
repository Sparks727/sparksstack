"use client";

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  UserIcon, 
  CalendarIcon, 
  ShieldIcon,
  CameraIcon,
  CheckIcon,
  LoaderIcon
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export default function ProfilePage() {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
  });

  // Debounced auto-save function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (newData: typeof formData) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleAutoSave(newData);
        }, 1000); // 1 second delay
      };
    })(),
    []
  );

  // Auto-save when form data changes
  useEffect(() => {
    if (user && (formData.firstName !== user.firstName || 
                  formData.lastName !== user.lastName || 
                  formData.username !== user.username)) {
      debouncedSave(formData);
    }
  }, [formData, user, debouncedSave]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const handleAutoSave = async (data: typeof formData) => {
    if (!user || isSaving) return;

    // Don't save if no changes
    if (data.firstName === user.firstName && 
        data.lastName === user.lastName && 
        data.username === user.username) {
      return;
    }

    setIsSaving(true);
    
    try {
      await user.update({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
      });
      
      setLastSaved(new Date());
      
      // Show subtle success indicator
      toast({
        title: "Profile Updated",
        description: "Your profile has been automatically saved.",
      });
      
    } catch (error) {
      console.error('Error auto-saving profile:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save profile changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

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
      
      // Upload to Clerk using the correct method
      await user.setProfileImage({ file });
      
      console.log('Upload successful!');
      
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

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Edit your profile information below. Changes are automatically saved.
          </p>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <UserIcon className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative flex justify-center sm:justify-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <CameraIcon className="h-4 w-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold">{formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : formData.username || user?.fullName || 'User'}</h3>
                {formData.username && (
                  <p className="text-sm text-muted-foreground">@{formData.username}</p>
                )}
                <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <ShieldIcon className="h-3 w-3" />
                    {user?.primaryEmailAddress?.verification?.status === 'verified' ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <CalendarIcon className="h-3 w-3" />
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Auto-save Status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
              {isSaving ? (
                <>
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                  <span>Saving changes...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckIcon className="h-4 w-4 text-green-600" />
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : null}
            </div>

            {/* Form Section - Always Editable */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First name"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last name"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={user?.primaryEmailAddress?.emailAddress || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed from this page
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>
              </div>
              <button className="px-3 py-2 text-sm border rounded-md hover:bg-muted transition-colors">
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button className="px-3 py-2 text-sm border rounded-md hover:bg-muted transition-colors">
                Enable 2FA
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
