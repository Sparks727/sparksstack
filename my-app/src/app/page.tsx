"use client"

import { Suspense, lazy } from "react"
import { useClerkPreload } from "@/hooks/use-clerk-preload"

// Lazy load the SignIn component to reduce initial bundle size
const LazySignIn = lazy(() => 
  import("@clerk/nextjs").then(module => ({ default: module.SignIn }))
)

export default function Home() {
  // Use custom hook for optimized Clerk preloading
  const { isPreloaded, shouldShowLoading, error } = useClerkPreload()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            {shouldShowLoading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                <p className="text-gray-500 text-sm">Loading...</p>
              </>
            ) : error ? (
              <div className="text-center space-y-2">
                <p className="text-red-500 text-sm">Failed to load authentication form</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-blue-600 hover:text-blue-700 text-sm underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="animate-pulse space-y-4 w-full">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            )}
          </div>
        }>
          <LazySignIn 
            appearance={{
              elements: {
                // Use minimal custom styling to match Clerk hosted appearance
                card: "shadow-lg border border-gray-200",
                headerTitle: "text-gray-900 font-semibold",
                headerSubtitle: "text-gray-600",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-medium",
                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
          />
        </Suspense>
      </div>
    </div>
  )
}


