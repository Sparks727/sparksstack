import { SignIn } from "@clerk/nextjs"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/SparksStackLogo.png"
              alt="SparksStack Logo"
              width={80}
              height={80}
              className="rounded-lg shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to SparksStack
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center">
              <SignIn 
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
                signUpUrl="/"
              />
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            By signing in or creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}


