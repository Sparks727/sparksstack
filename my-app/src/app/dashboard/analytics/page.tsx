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
import { useLocationStore } from '@/lib/store/location-store';

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
  const { locations, activeLocationId } = useLocationStore();
  const [activeTab, setActiveTab] = useState("data");
  const [ga4MeasurementId, setGa4MeasurementId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGA4Connected, setIsGA4Connected] = useState(false);
  
  // Get active location
  const activeLocation = activeLocationId 
    ? locations.find(loc => loc.id === activeLocationId) 
    : null;
  
  // Protect this page - redirect if not authenticated
  if (isLoaded && !user) {
    redirect("/");
  }

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate API connection
    setTimeout(() => {
      setIsConnecting(false);
      setIsGA4Connected(true);
      setActiveTab("data");
    }, 1500);
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Website Analytics</h1>
        <p className="text-muted-foreground">
          {activeLocation 
            ? `Analytics for ${activeLocation.name}` 
            : "Combined analytics for all locations"}
        </p>
      </div>

      {!isGA4Connected ? (
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle>Connect Google Analytics</CardTitle>
            <CardDescription>
              Connect your Google Analytics account to view website performance data
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <div className="max-w-md w-full space-y-6">
              <div className="space-y-3">
                <Label htmlFor="ga4-id">Google Analytics 4 Measurement ID</Label>
                <Input 
                  id="ga4-id" 
                  placeholder="G-XXXXXXXXXX" 
                  value={ga4MeasurementId}
                  onChange={(e) => setGa4MeasurementId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your GA4 Measurement ID starts with G- and can be found in your GA4 property settings
                </p>
              </div>

              <Button 
                className="w-full bg-[#F57C00] hover:bg-[#E65100]"
                size="lg"
                onClick={handleConnect}
                disabled={!ga4MeasurementId || isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect Google Analytics"}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Need help finding your Measurement ID? 
                  <a 
                    href="https://support.google.com/analytics/answer/9539598" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline ml-1"
                  >
                    View Google&apos;s guide
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={activeTab} className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="data">Analytics Data</TabsTrigger>
            <TabsTrigger value="setup">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,624</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+12.3%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,417</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+5.2%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2m 13s</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-500">-1.5%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">44.2%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">-2.1%</span> from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Traffic Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
                <CardDescription>Website visitors and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={websiteTrafficData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} name="Users" />
                      <Line type="monotone" dataKey="pageviews" stroke="#82ca9d" name="Page Views" />
                      <Line type="monotone" dataKey="sessions" stroke="#ffc658" name="Sessions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={conversionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {conversionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Pages Viewed */}
              <Card>
                <CardHeader>
                  <CardTitle>Pages Viewed</CardTitle>
                  <CardDescription>Most popular pages on your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pageViewsData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => [`${value} views`, 'Page Views']} />
                        <Legend />
                        <Bar dataKey="views" name="Page Views">
                          {pageViewsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PAGE_COLORS[index % PAGE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics Connection</CardTitle>
                <CardDescription>
                  Manage your Google Analytics integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#F57C00" viewBox="0 0 24 24">
                        <path d="M19.86 21a2.12 2.12 0 0 1-1.55-.68 2.59 2.59 0 0 1-.67-1.87V5.19c0-.85.12-1.57.67-2.03.46-.45 1.13-.58 1.88-.58.55 0 1.34.06 1.93.6.69.6.8 1.57.8 2.39v12.9c0 1.13-.33 1.66-.8 2.03-.43.31-1.02.5-1.76.5h-.5zM6.86 12.19v8.96c0 .3.19.5.5.5h.53c.3 0 .5-.2.5-.5v-8.96c0-.3-.2-.5-.5-.5h-.53c-.31 0-.5.2-.5.5zM0 20.69c0 .7.28 1.3.75 1.77.47.46 1.1.75 1.8.75.68 0 1.32-.29 1.78-.75.47-.47.75-1.07.75-1.77V4.31c0-.82-.1-1.79-.8-2.39-.59-.54-1.38-.6-1.93-.6-.75 0-1.42.13-1.88.58C.12 2.37 0 3.09 0 3.94V20.7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Google Analytics 4</h3>
                      <p className="text-sm text-muted-foreground">Connected to your website</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Connected
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsGA4Connected(false)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="ga4-id">Measurement ID</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="ga4-id" 
                        value={ga4MeasurementId || "G-XXXXXXXXXX"}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Stream</Label>
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Your Website</p>
                          <p className="text-sm text-muted-foreground">Web data stream</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </>
  );
} 