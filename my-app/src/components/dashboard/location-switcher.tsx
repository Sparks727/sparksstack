import { useLocationStore } from "@/lib/store/location-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LocationSwitcher() {
  const { locations, activeLocationId, setActiveLocation } = useLocationStore();

  // If there are no locations yet, show a button to add one
  if (locations.length === 0) {
    return (
      <div className="flex items-center">
        <Link href="/dashboard/locations">
          <Button variant="outline" size="sm">
            Add Location
          </Button>
        </Link>
      </div>
    );
  }

  // If there is only one location
  if (locations.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-secondary">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <div>
            <span className="text-sm font-medium block truncate max-w-[150px]">
              {locations[0].name}
            </span>
            <span className="text-xs text-muted-foreground block truncate max-w-[150px]">
              {locations[0].address}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Find the active location object
  const activeLocation = locations.find(loc => loc.id === activeLocationId) || locations[0];

  return (
    <div className="flex items-center gap-2">
      <Select
        value={activeLocationId || undefined}
        onValueChange={(value: string) => setActiveLocation(value)}
      >
        <SelectTrigger className="h-auto min-h-10 gap-1 w-[260px] bg-secondary border-0 py-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <div className="flex flex-col items-start">
              <SelectValue placeholder="Select location">
                {activeLocation.name}
              </SelectValue>
              {activeLocationId && (
                <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                  {activeLocation.address}
                </span>
              )}
            </div>
          </div>
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id} className="py-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    location.isConnected ? "bg-green-500" : "bg-yellow-500"
                  } flex-shrink-0`}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{location.name}</span>
                  <span className="text-xs text-muted-foreground">{location.address}</span>
                </div>
              </div>
            </SelectItem>
          ))}
          <div className="p-1 mt-2 border-t">
            <Link href="/dashboard/locations">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Manage Locations
              </Button>
            </Link>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
} 