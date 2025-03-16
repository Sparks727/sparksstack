"use client";

import { useUser } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, UsersIcon, DollarSignIcon, ShoppingCartIcon, TrendingUpIcon } from 'lucide-react';

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

export default function Dashboard() {
  const { user } = useUser();
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.firstName || 'User'}!</h1>
        <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Users" 
          value="2,541" 
          change="12% increase" 
          icon={UsersIcon} 
          trend="up" 
        />
        <StatCard 
          title="Revenue" 
          value="$13,245" 
          change="8% increase" 
          icon={DollarSignIcon} 
          trend="up" 
        />
        <StatCard 
          title="Orders" 
          value="2,356" 
          change="5% decrease" 
          icon={ShoppingCartIcon} 
          trend="down" 
        />
        <StatCard 
          title="Growth" 
          value="15.3%" 
          change="10% increase" 
          icon={TrendingUpIcon} 
          trend="up" 
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Monthly Performance</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
} 