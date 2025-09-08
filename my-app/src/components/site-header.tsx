// Replacing custom UI deps to avoid missing modules
// import { Button } from "@/components/ui/button"
// import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="mx-2 h-4 w-px bg-border" />
        <h1 className="text-base font-medium">Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/dashboard"
            afterLeaveOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
            appearance={{ elements: { rootBox: "hidden sm:flex" } }}
          />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
