"use client"

import { OrganizationList, OrganizationProfile } from "@clerk/nextjs"

export default function OrganizationsPage() {
  return (
    <div className="p-4 grid gap-6">
      <OrganizationProfile />
      <OrganizationList hidePersonal afterCreateOrganizationUrl="/dashboard" />
    </div>
  )
}


