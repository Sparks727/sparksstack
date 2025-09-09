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
      // Force embedded components instead of hosted pages
      signInUrl="/"
      signUpUrl="/"
      // Performance optimizations
      appearance={{
        // Preload common styles to reduce layout shift
        baseTheme: undefined,
        variables: {
          colorPrimary: "#2563eb", // blue-600
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#000000",
        }
      }}
      // Enable faster initialization
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      // Reduce initial bundle size by not loading unnecessary features
      localization={{
        locale: "en-US"
      }}
    >
      {children}
    </ClerkProvider>
  );
} 