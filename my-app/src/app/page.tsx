"use client"

import Image from "next/image"
import { useState, Suspense, lazy } from "react"
import { useClerkPreload } from "@/hooks/use-clerk-preload"

// Lazy load the SignIn component to reduce initial bundle size
const LazySignIn = lazy(() => 
  import("@clerk/nextjs").then(module => ({ default: module.SignIn }))
)

export default function Home() {
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  
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
            Welcome to SparksStack
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 min-h-[400px]">
            <div className="flex justify-center">
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                  {shouldShowLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-500 text-sm">Loading sign-in form...</p>
                    </>
                  ) : error ? (
                    <div className="text-center space-y-2">
                      <p className="text-red-500 text-sm">Failed to load sign-in form</p>
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
                      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                      card: "shadow-none",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "bg-white border-gray-300 hover:bg-gray-50 text-gray-700",
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
        </div>

        <div className="text-center mt-12 min-h-[60px] flex items-center justify-center">
          <p className="text-gray-500 text-sm">
            By signing in or creating an account, you agree to our{" "}
            <button
              onClick={() => setShowTerms(true)}
              className="text-blue-600 hover:text-blue-700 underline cursor-pointer"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-blue-600 hover:text-blue-700 underline cursor-pointer"
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>

      {/* Terms of Service Overlay */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
                <button
                  onClick={() => setShowTerms(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600 mb-4">
                  <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                <p className="text-gray-600 mb-4">
                  By accessing and using SparksStack, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Use License</h3>
                <p className="text-gray-600 mb-4">
                  Permission is granted to temporarily use SparksStack for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Disclaimer</h3>
                <p className="text-gray-600 mb-4">
                  The materials on SparksStack are provided on an 'as is' basis. SparksStack makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Limitations</h3>
                <p className="text-gray-600 mb-4">
                  In no event shall SparksStack or its suppliers be liable for any damages arising out of the use or inability to use the materials on SparksStack.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Revisions</h3>
                <p className="text-gray-600 mb-4">
                  SparksStack may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the then current version of these terms.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTerms(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Overlay */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-600 mb-4">
                  <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
                <p className="text-gray-600 mb-4">
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
                <p className="text-gray-600 mb-4">
                  We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Information Sharing</h3>
                <p className="text-gray-600 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Data Security</h3>
                <p className="text-gray-600 mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Your Rights</h3>
                <p className="text-gray-600 mb-4">
                  You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Contact Us</h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at privacy@sparksstack.com.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


