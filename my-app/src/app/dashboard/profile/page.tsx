"use client"

import { UserProfile } from "@clerk/nextjs"

export default function ProfilePage() {
  return (
    <div className="p-4">
      <UserProfile path="/dashboard/profile" routing="path" />
    </div>
  )
}


