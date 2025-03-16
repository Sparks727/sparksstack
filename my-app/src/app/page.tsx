"use client";

import Image from "next/image";
import { useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  
  // Redirect signed-in users to dashboard
  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  // Only show the landing page for non-signed-in users
  if (!isSignedIn) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center">
          <Image
            src="/SparksStackLogo.png"
            alt="SparksStack Logo"
            width={250}
            height={80}
            priority
            className="mb-4"
          />
          
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

  // This section won't render as we redirect in the useEffect
  return null;
}
