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
    name: 'Blue Sky Roofing - Main Office',
    address: '2500 W Park Row Dr, Pantego, TX 76013',
    phone: '(817) 769-2553',
    website: 'https://blueskyroofingtx.com',
    isConnected: true
  },
  {
    id: '2',
    name: 'Blue Sky Roofing - Arlington',
    address: '1801 N Collins St, Arlington, TX 76011',
    phone: '(817) 769-2554',
    website: 'https://arlington.blueskyroofingtx.com',
    isConnected: true
  },
  {
    id: '3',
    name: 'Blue Sky Roofing - Dallas',
    address: '6060 N Central Expwy, Dallas, TX 75206',
    phone: '(214) 347-7663',
    website: 'https://dallas.blueskyroofingtx.com',
    isConnected: false
  },
  {
    id: '4',
    name: 'Blue Sky Roofing - Fort Worth',
    address: '1612 Summit Ave, Fort Worth, TX 76102',
    phone: '(817) 502-9119',
    website: 'https://fortworth.blueskyroofingtx.com',
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