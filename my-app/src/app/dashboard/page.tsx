"use client";

import { useUser } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, UsersIcon, DollarSignIcon, ShoppingCartIcon, TrendingUpIcon, MapPin } from 'lucide-react';
import { useLocationStore } from '@/lib/store/location-store';

// Sample data for charts
const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 700 },
];

// Sample data for all locations combined
const allLocationsData = [
  { name: 'Jan', value: 625 },
  { name: 'Feb', value: 480 },
  { name: 'Mar', value: 950 },
  { name: 'Apr', value: 1200 },
  { name: 'May', value: 850 },
  { name: 'Jun', value: 1400 },
  { name: 'Jul', value: 1100 },
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
  '1': { // SparksStack Downtown
    users: "1,324",
    revenue: "$7,245",
    orders: "1,156",
    growth: "9.3%",
    userChange: "8% increase",
    revenueChange: "5% increase",
    ordersChange: "3% decrease",
    growthChange: "7% increase",
    userTrend: "up" as const,
    revenueTrend: "up" as const,
    ordersTrend: "down" as const,
    growthTrend: "up" as const,
  },
  '2': { // SparksStack Uptown
    users: "1,217",
    revenue: "$6,000",
    orders: "1,200",
    growth: "6.0%",
    userChange: "14% increase",
    revenueChange: "10% increase",
    ordersChange: "8% increase",
    growthChange: "12% increase",
    userTrend: "up" as const,
    revenueTrend: "up" as const,
    ordersTrend: "up" as const,
    growthTrend: "up" as const,
  },
  // Combined stats for "All Locations"
  all: {
    users: "2,541",
    revenue: "$13,245",
    orders: "2,356",
    growth: "15.3%",
    userChange: "12% increase",
    revenueChange: "8% increase",
    ordersChange: "5% decrease",
    growthChange: "10% increase",
    userTrend: "up" as const,
    revenueTrend: "up" as const,
    ordersTrend: "down" as const,
    growthTrend: "up" as const,
  }
};

export default function Dashboard() {
  const { user } = useUser();
  const { locations, activeLocationId } = useLocationStore();
  
  // Get active location or null for "All Locations"
  const activeLocation = activeLocationId 
    ? locations.find(loc => loc.id === activeLocationId) 
    : null;
  
  // Get stats based on active location or all locations
  const stats = activeLocationId 
    ? locationStats[activeLocationId as keyof typeof locationStats] 
    : locationStats.all;
  
  // Get chart data based on active location or all locations
  const chartData = activeLocationId ? data : allLocationsData;
  
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map(location => (
              <div key={location.id} className="border rounded-md p-4 hover:border-blue-500 transition-colors">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-50 rounded-full mr-3">
                    <MapPin size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{location.name}</h3>
                    <p className="text-sm text-gray-500">{location.address}</p>
                    <div className="mt-2 text-sm">
                      {location.isConnected ? (
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Connected</span>
                      ) : (
                        <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Not Connected</span>
                      )}
                    </div>
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