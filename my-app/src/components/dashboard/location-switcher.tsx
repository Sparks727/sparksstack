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
          <span className="text-sm font-medium truncate max-w-[150px]">
            {locations[0].name}
          </span>
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
        <SelectTrigger className="h-8 gap-1 w-[180px] bg-secondary border-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <SelectValue placeholder="Select location">
              {activeLocation.name}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    location.isConnected ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                <span>{location.name}</span>
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