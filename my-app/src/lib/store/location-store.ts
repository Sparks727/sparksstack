import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  isConnected: boolean;
}

interface LocationState {
  locations: Location[];
  activeLocationId: string | null;
  addLocation: (location: Omit<Location, 'id'>) => void;
  removeLocation: (id: string) => void;
  updateLocation: (id: string, updates: Partial<Omit<Location, 'id'>>) => void;
  setActiveLocation: (id: string | null) => void;
  setAllLocations: () => void;
}

// Initial sample data
const initialLocations: Location[] = [
  {
    id: '1',
    name: 'SparksStack Downtown',
    address: '123 Main St, San Francisco, CA 94105',
    phone: '(415) 555-1234',
    website: 'https://downtown.sparksstack.com',
    isConnected: true
  },
  {
    id: '2',
    name: 'SparksStack Uptown',
    address: '456 Market St, San Francisco, CA 94103',
    phone: '(415) 555-5678',
    website: 'https://uptown.sparksstack.com',
    isConnected: false
  }
];

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      locations: initialLocations,
      activeLocationId: null, // Default to "All Locations"
      
      addLocation: (locationData) => set((state) => ({
        locations: [
          ...state.locations,
          {
            ...locationData,
            id: Math.random().toString(36).substring(2, 9) // Simple ID generation
          }
        ]
      })),
      
      removeLocation: (id) => set((state) => ({
        locations: state.locations.filter(location => location.id !== id),
        // Reset active location if we're removing the active one
        activeLocationId: state.activeLocationId === id ? null : state.activeLocationId
      })),
      
      updateLocation: (id, updates) => set((state) => ({
        locations: state.locations.map(location => 
          location.id === id 
            ? { ...location, ...updates } 
            : location
        )
      })),
      
      setActiveLocation: (id) => set(() => ({
        activeLocationId: id
      })),
      
      setAllLocations: () => set(() => ({
        activeLocationId: null
      }))
    }),
    {
      name: 'location-storage', // Name for the localStorage key
    }
  )
); 