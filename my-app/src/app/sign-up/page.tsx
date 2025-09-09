"use client"

import Image from "next/image"
import { Suspense, lazy } from "react"
import { useClerkPreload } from "@/hooks/use-clerk-preload"

// Lazy load the SignUp component to reduce initial bundle size
const LazySignUp = lazy(() => 
  import("@clerk/nextjs").then(module => ({ default: module.SignUp }))
)

export default function SignUp() {
  // Use custom hook for optimized Clerk preloading
  const { isPreloaded, shouldShowLoading, error } = useClerkPreload()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full min-h-[600px]">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20">
              <Image
                src="/SparksStackLogo.png"
                alt="SparksStack Logo"
                width={80}
                height={80}
                className="rounded-lg shadow-lg w-full h-full object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Join SparksStack and get started today
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 min-h-[400px]">
            <div className="flex justify-center">
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                  {shouldShowLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-500 text-sm">Loading sign-up form...</p>
                    </>
                  ) : error ? (
                    <div className="text-center space-y-2">
                      <p className="text-red-500 text-sm">Failed to load sign-up form</p>
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
                <LazySignUp 
                  appearance={{
                    elements: {
                      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                      card: "shadow-none",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "bg-white border-gray-300 hover:bg-gray-50 text-gray-700",
                      formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                      footerActionLink: "text-blue-600 hover:text-blue-700"
                    }
                  }}
                  signInUrl="/"
                  afterSignUpUrl="/dashboard"
                />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 min-h-[60px] flex items-center justify-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
