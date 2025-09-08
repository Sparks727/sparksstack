import { SectionCards } from "@/components/section-cards";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="px-4 lg:px-6">
            <div className="bg-muted/50 min-h-[40vh] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}