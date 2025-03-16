"use client";

import { useUser } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, UsersIcon, DollarSignIcon, ShoppingCartIcon, TrendingUpIcon, MapPin } from 'lucide-react';
import { useLocationStore } from '@/lib/store/location-store';
import { Button } from '@/components/ui/button';

// Sample data for main office
const mainOfficeData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 320 },
  { name: 'Mar', value: 550 },
  { name: 'Apr', value: 780 },
  { name: 'May', value: 510 },
  { name: 'Jun', value: 890 },
  { name: 'Jul', value: 680 },
];

// Sample data for Arlington location
const arlingtonData = [
  { name: 'Jan', value: 350 },
  { name: 'Feb', value: 290 },
  { name: 'Mar', value: 420 },
  { name: 'Apr', value: 590 },
  { name: 'May', value: 480 },
  { name: 'Jun', value: 710 },
  { name: 'Jul', value: 590 },
];

// Sample data for Dallas location
const dallasData = [
  { name: 'Jan', value: 480 },
  { name: 'Feb', value: 390 },
  { name: 'Mar', value: 620 },
  { name: 'Apr', value: 850 },
  { name: 'May', value: 640 },
  { name: 'Jun', value: 950 },
  { name: 'Jul', value: 820 },
];

// Sample data for Fort Worth location
const fortWorthData = [
  { name: 'Jan', value: 280 },
  { name: 'Feb', value: 220 },
  { name: 'Mar', value: 380 },
  { name: 'Apr', value: 490 },
  { name: 'May', value: 330 },
  { name: 'Jun', value: 610 },
  { name: 'Jul', value: 450 },
];

// Sample data for all locations combined
const allLocationsData = [
  { name: 'Jan', value: 1510 },
  { name: 'Feb', value: 1220 },
  { name: 'Mar', value: 1970 },
  { name: 'Apr', value: 2710 },
  { name: 'May', value: 1960 },
  { name: 'Jun', value: 3160 },
  { name: 'Jul', value: 2540 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.FC<{ size?: number; className?: string }>;
  trend: 'up' | 'down';
}

// Stat card component
const StatCard = ({ title, value, change, icon: Icon, trend }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />}
          <span className="text-sm ml-1">{change}</span>
        </div>
      </div>
      <div className="bg-blue-50 p-3 rounded-full">
        <Icon size={24} className="text-blue-500" />
      </div>
    </div>
  </div>
);

// Location stat values - would come from API in real app
const locationStats = {
  '1': { // Blue Sky Roofing - Main Office
    users: "1,324",
    revenue: "$42,750",
    orders: "78",
    growth: "8.7%",
    userChange: "12% increase",
    revenueChange: "15% increase",
    ordersChange: "5% increase",
    growthChange: "7% increase",
    userTrend: "up" as const,
    revenueTrend: "up" as const,
    ordersTrend: "up" as const,
    growthTrend: "up" as const,
  },
  '2': { // Blue Sky Roofing - Arlington
    users: "973",
    revenue: "$35,620",
    orders: "64",
    growth: "6.8%",
    userChange: "9% increase",
    revenueChange: "11% increase",
    ordersChange: "8% increase",
    growthChange: "5% increase",
    userTrend: "up" as const,
    revenueTrend: "up" as const,
    ordersTrend: "up" as const,
    growthTrend: "up" as const,
  },
  '3': { // Blue Sky Roofing - Dallas
    users: "1,458",
    revenue: "$51,935",
    orders: "93",
    growth: "11.2%",
    userChange: "16% increase",
    revenueChange: "19% increase",
    ordersChange: "14% increase",
    growthChange: "10% increase",
    userTrend: "up" as const,
    revenueTrend: "up" as const,
    ordersTrend: "up" as const,
    growthTrend: "up" as const,
  },
  '4': { // Blue Sky Roofing - Fort Worth
    users: "812",
    revenue: "$28,450",
    orders: "52",
    growth: "5.3%",
    userChange: "7% increase",
    revenueChange: "4% increase",
    ordersChange: "-2% decrease",
    growthChange: "3% increase",
    userTrend: "up" as const,
    revenueTrend: "up" as const,
    ordersTrend: "down" as const,
    growthTrend: "up" as const,
  },
  // Combined stats for "All Locations"
  all: {
    users: "4,567",
    revenue: "$158,755",
    orders: "287",
    growth: "9.5%",
    userChange: "14% increase",
    revenueChange: "12% increase",
    ordersChange: "9% increase",
    growthChange: "8% increase",
    userTrend: "up" as const,
    revenueTrend: "up" as const,
    ordersTrend: "up" as const,
    growthTrend: "up" as const,
  }
};

export default function Dashboard() {
  const { user } = useUser();
  const { locations, activeLocationId, setActiveLocation } = useLocationStore();
  
  // Get active location or null for "All Locations"
  const activeLocation = activeLocationId 
    ? locations.find(loc => loc.id === activeLocationId) 
    : null;
  
  // Get stats based on active location or all locations
  const stats = activeLocationId 
    ? locationStats[activeLocationId as keyof typeof locationStats] 
    : locationStats.all;
  
  // Get chart data based on active location or all locations
  const chartData = activeLocationId 
    ? (activeLocationId === '1' 
        ? mainOfficeData 
        : activeLocationId === '2' 
          ? arlingtonData 
          : activeLocationId === '3' 
            ? dallasData 
            : fortWorthData) 
    : allLocationsData;
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        
        <p className="text-gray-600 mt-1">
          {activeLocation 
            ? `Viewing dashboard for ${activeLocation.name}`
            : "Viewing combined metrics for all locations"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          change={stats.userChange} 
          icon={UsersIcon} 
          trend={stats.userTrend} 
        />
        <StatCard 
          title="Revenue" 
          value={stats.revenue} 
          change={stats.revenueChange} 
          icon={DollarSignIcon} 
          trend={stats.revenueTrend} 
        />
        <StatCard 
          title="Orders" 
          value={stats.orders} 
          change={stats.ordersChange} 
          icon={ShoppingCartIcon} 
          trend={stats.ordersTrend} 
        />
        <StatCard 
          title="Growth" 
          value={stats.growth} 
          change={stats.growthChange} 
          icon={TrendingUpIcon} 
          trend={stats.growthTrend} 
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          {activeLocation 
            ? `${activeLocation.name} Monthly Performance`
            : "All Locations Monthly Performance"}
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Location List (only shown when viewing all locations) */}
      {!activeLocation && locations.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Your Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map(location => (
              <div key={location.id} className="border rounded-md p-4 hover:border-blue-500 transition-colors">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-50 rounded-full mr-3">
                    <MapPin size={18} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{location.name}</h3>
                    <p className="text-sm text-gray-500">{location.address}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm">
                        {location.isConnected ? (
                          <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Connected</span>
                        ) : (
                          <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Not Connected</span>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => setActiveLocation(location.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Additional location info */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 pt-3 border-t">
                  <div>
                    <span className="block font-medium">Phone:</span>
                    {location.phone}
                  </div>
                  <div>
                    <span className="block font-medium">Service Status:</span>
                    {location.id === '1' || location.id === '2' ? 'Active' : 'Limited'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
} 