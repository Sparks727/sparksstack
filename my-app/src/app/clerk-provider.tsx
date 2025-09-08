"use client";

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

export function ClerkClientProvider({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  );
} 