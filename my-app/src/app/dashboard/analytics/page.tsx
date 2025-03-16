"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useState } from "react";

// Sample data
const websiteTrafficData = [
  { name: 'Jan', users: 4000, pageviews: 6400, sessions: 2400 },
  { name: 'Feb', users: 3000, pageviews: 4300, sessions: 1398 },
  { name: 'Mar', users: 2000, pageviews: 3800, sessions: 9800 },
  { name: 'Apr', users: 2780, pageviews: 3908, sessions: 3908 },
  { name: 'May', users: 1890, pageviews: 4800, sessions: 4800 },
  { name: 'Jun', users: 2390, pageviews: 3800, sessions: 3800 },
  { name: 'Jul', users: 3490, pageviews: 4300, sessions: 4300 },
];

const conversionData = [
  { name: 'Direct', value: 400 },
  { name: 'Organic Search', value: 300 },
  { name: 'Social', value: 300 },
  { name: 'Referral', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const pageViewsData = [
  { name: '/home', views: 1250 },
  { name: '/products', views: 830 },
  { name: '/blog', views: 745 },
  { name: '/about', views: 680 },
  { name: '/contact-us', views: 590 },
  { name: '/pricing', views: 430 },
];

const PAGE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("data");
  const [ga4MeasurementId, setGa4MeasurementId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Protect this page - redirect if not authenticated
  if (isLoaded && !user) {
    redirect("/");
  }

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate API connection
    setTimeout(() => {
      setIsConnecting(false);
      // Show success message or update UI
    }, 1500);
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Website Analytics</h1>
        <p className="text-muted-foreground">Monitor your website performance and visitor behavior</p>
      </div>

      <Tabs defaultValue="data" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="data">Analytics Data</TabsTrigger>
          <TabsTrigger value="connect">Connect GA4</TabsTrigger>
        </TabsList>

        {/* Content goes here... */}
        
        {/* Rest of the existing tab content... */}
      </Tabs>
    </>
  );
} 