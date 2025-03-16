"use client";

import Image from "next/image";
import { useUser, SignInButton } from '@clerk/nextjs';
import { useState } from 'react';

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [imageError, setImageError] = useState(false);
  
  // Text logo fallback when image fails to load
  const TextLogo = () => (
    <h1 className="text-4xl font-bold mb-4">
      <span className="text-orange-500">Sparks</span>
      <span>Stack</span>
    </h1>
  );

  if (!isSignedIn) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center">
          {imageError ? (
            <TextLogo />
          ) : (
            <Image
              src="https://i.imgur.com/tZiFJ7t.png"
              alt="SparksStack Logo"
              width={250}
              height={80}
              priority
              className="mb-4"
              onError={() => setImageError(true)}
            />
          )}
          
          <div className="flex justify-center w-full mt-4">
            <SignInButton mode="modal">
              <button className="rounded-full border border-solid border-transparent 
                px-8 py-3 text-base font-medium 
                bg-gradient-to-r from-orange-500 to-red-600 text-white
                transform transition-all duration-300 ease-in-out
                hover:scale-105 hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
                active:scale-95">
                Onward →
              </button>
            </SignInButton>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        {imageError ? (
          <TextLogo />
        ) : (
          <Image
            src="https://i.imgur.com/tZiFJ7t.png"
            alt="SparksStack Logo"
            width={250}
            height={80}
            priority
            className="mb-4"
            onError={() => setImageError(true)}
          />
        )}
        <h2 className="text-2xl font-bold">Welcome, {user?.firstName || 'User'}!</h2>
        <p className="text-lg">You are successfully signed in.</p>
        
        <p className="text-md text-muted-foreground">
          This is a simplified version of the app for testing Clerk authentication.
        </p>
      </main>
    </div>
  );
}
