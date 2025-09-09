"use client"

import Image from "next/image"

export default function Home() {
  const handleOnwardClick = () => {
    window.location.href = "https://accounts.sparksstack.com/sign-in"
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1F1F23' }}>
      <div className="text-center">
        {/* SparksStack Logo */}
        <div className="flex justify-center mb-12">
          <div className="w-32 h-32">
            <Image
              src="/SparksStackLogo.png"
              alt="SparksStack Logo"
              width={128}
              height={128}
              className="rounded-lg shadow-lg w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Welcome Message */}
        <h1 className="text-5xl font-bold text-white mb-8">
          Welcome to Sparks Stack
        </h1>
        
        <p className="text-xl text-white mb-12 max-w-md mx-auto">
          Your journey to success starts here
        </p>

        {/* Onward Button */}
        <button
          onClick={handleOnwardClick}
          className="text-white font-semibold py-4 px-12 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          style={{ backgroundColor: '#7452FE' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#6B46F5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#7452FE'
          }}
        >
          Onward
        </button>
      </div>
    </div>
  )
}


