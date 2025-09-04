"use client";

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 sm:space-y-8 w-full max-w-md mx-auto">
        {/* Sparks Stack Logo */}
        <div className="flex justify-center">
          <Image
            src="/SparksStackLogo.png"
            alt="Sparks Stack Logo"
            width={200}
            height={200}
            className="w-32 h-32 sm:w-48 sm:h-48 object-contain"
            priority
          />
        </div>
        
        {/* Dashboard Coming Soon Message */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Dashboard Coming Soon!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-sm sm:max-w-md mx-auto leading-relaxed">
            We're working hard to build something amazing for you. Stay tuned!
          </p>
        </div>
        
        {/* User Info (Optional) */}
        {user && (
          <div className="pt-6 sm:pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Welcome back, {user.firstName || user.username || 'User'}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 