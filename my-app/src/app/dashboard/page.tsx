"use client";

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Sparks Stack Logo */}
        <div className="flex justify-center">
          <Image
            src="/SparksStackLogo.png"
            alt="Sparks Stack Logo"
            width={200}
            height={200}
            className="w-48 h-48 object-contain"
          />
        </div>
        
        {/* Dashboard Coming Soon Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Dashboard Coming Soon!
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            We're working hard to build something amazing for you. Stay tuned!
          </p>
        </div>
        
        {/* User Info (Optional) */}
        {user && (
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Welcome back, {user.firstName || user.username || 'User'}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 