"use client";

import { useUser, SignInButton } from '@clerk/nextjs';

export default function Home() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-bold">
            <span className="text-orange-500">Sparks</span>
            <span>Stack</span>
          </h1>
          
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <SignInButton mode="modal">
              <button className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto">
                Onward
              </button>
            </SignInButton>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">
          <span className="text-orange-500">Sparks</span>
          <span>Stack</span>
        </h1>
        <h2 className="text-2xl font-bold">Welcome, {user?.firstName || 'User'}!</h2>
        <p className="text-lg">You are successfully signed in.</p>
        
        <p className="text-md text-muted-foreground">
          This is a simplified version of the app for testing Clerk authentication.
        </p>
      </main>
    </div>
  );
}
