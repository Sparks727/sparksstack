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

// Initial sample data - Blue Sky Roofing locations
const initialLocations: Location[] = [
  {
    id: '1',
    name: 'Blue Sky Roofing - Sarasota',
    address: '240 North Washington Boulevard Suite 318, Sarasota, Florida 34236',
    phone: '(941) 877-1234',
    website: 'https://blueskyroofingtx.com',
    isConnected: true
  },
  {
    id: '2',
    name: 'Blue Sky Roofing - Punta Gorda',
    address: '6120 Sweden Blvd, Punta Gorda, FL 33982',
    phone: '(941) 877-5678',
    website: 'https://blueskyroofingtx.com',
    isConnected: true
  },
  {
    id: '3',
    name: 'Blue Sky Roofing - St. Petersburg',
    address: '136 4th St N #2206, St. Petersburg, FL 33701',
    phone: '(727) 555-1234',
    website: 'https://blueskyroofingtx.com',
    isConnected: true
  },
  {
    id: '4',
    name: 'Blue Sky Roofing - Largo',
    address: '13375 Center Ave, Largo, FL 33773',
    phone: '(727) 555-5678',
    website: 'https://blueskyroofingtx.com',
    isConnected: true
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