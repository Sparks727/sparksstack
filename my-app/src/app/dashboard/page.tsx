"use client";

import { useUser } from '@clerk/nextjs';
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useUser();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
      <Image
        src="/SparksStackLogo.png"
        alt="SparksStack Logo"
        width={250}
        height={80}
        priority
        className="mb-6"
      />
      
      <h1 className="text-3xl font-bold mb-4">Welcome to Sparks Stack</h1>
      
      {user && (
        <p className="text-xl mb-8">
          Hello, {user.firstName || "there"}! Thanks for signing in.
        </p>
      )}
      
      <div className="max-w-2xl text-center mb-8">
        <p className="text-lg mb-4">
          We&apos;re working on something amazing to help businesses like yours thrive online.
        </p>
        <p className="text-lg">
          Our platform is under construction, but we&apos;ll be launching soon!
        </p>
      </div>
      
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-3">Stay Updated</h2>
        <p className="mb-4">We&apos;ll notify you as soon as Sparks Stack is ready to launch.</p>
        <p className="text-sm text-gray-500">
          In the meantime, if you have any questions, please reach out to us at{" "}
          <a href="mailto:sparksstack@gmail.com" className="text-blue-600 hover:underline">
            sparksstack@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
} 