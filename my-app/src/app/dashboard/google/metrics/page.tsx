'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { BarChart3, LineChart, PieChart, RefreshCw, CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MetricsData {
  profileName: string;
  metrics: {
    [key: string]: number[];
  };
  timeRanges: string[];
}

export default function BusinessMetricsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Simulate loading metrics data
  useEffect(() => {
    // In a real application, we would fetch this data from an API
    setTimeout(() => {
      setLoading(false);
      
      // Sample data for demonstration
      setMetricsData({
        profileName: "Your Business Name",
        timeRanges: ["Last Week", "2 Weeks Ago", "3 Weeks Ago", "4 Weeks Ago"],
        metrics: {
          "Views": [1245, 1100, 980, 1050],
          "Searches": [856, 790, 820, 750],
          "Clicks": [321, 280, 310, 290],
          "Calls": [45, 38, 42, 40],
          "Direction Requests": [112, 98, 105, 110],
          "Website Visits": [207, 190, 175, 185]
        }
      });
    }, 1500);
  }, []);

  const calculateChange = (current: number, previous: number): { percent: number, isPositive: boolean } => {
    if (previous === 0) return { percent: 0, isPositive: false };
    const change = ((current - previous) / previous) * 100;
    return { 
      percent: Math.abs(Math.round(change * 10) / 10), 
      isPositive: change >= 0 
    };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Google Business Profile Metrics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Google Business Profile Metrics</h1>
        <Alert variant="destructive">
          <AlertTitle>Error Loading Metrics</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!metricsData) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Google Business Profile Metrics</h1>
        <Alert>
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>No metrics data available. Please check your Business Profile connection.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold">Google Business Profile Metrics</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>Last 30 days</span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="table">Detailed Table</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{metricsData.profileName}</CardTitle>
              <CardDescription>
                Performance overview for your Business Profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(metricsData.metrics).map(([metricName, values]) => {
                  const current = values[0];
                  const previous = values[1];
                  const change = calculateChange(current, previous);
                  
                  return (
                    <Card key={metricName}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{metricName}</p>
                            <p className="text-2xl font-bold mt-1">{current.toLocaleString()}</p>
                          </div>
                          {metricName === "Views" && <BarChart3 className="h-5 w-5 text-muted-foreground" />}
                          {metricName === "Searches" && <LineChart className="h-5 w-5 text-muted-foreground" />}
                          {metricName === "Clicks" && <PieChart className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className={`mt-2 text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {change.isPositive ? '↑' : '↓'} {change.percent}% vs previous period
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metrics History</CardTitle>
              <CardDescription>
                Detailed view of your Business Profile metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Business Profile performance data for the last 4 weeks</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    {metricsData.timeRanges.map((range) => (
                      <TableHead key={range} className="text-right">{range}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(metricsData.metrics).map(([metricName, values]) => (
                    <TableRow key={metricName}>
                      <TableCell className="font-medium">{metricName}</TableCell>
                      {values.map((value, index) => (
                        <TableCell key={index} className="text-right">{value.toLocaleString()}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Data is refreshed daily from Google Business Profile
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Charts</CardTitle>
              <CardDescription>
                Visual representation of your Business Profile performance
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Charts will be implemented in the next update.
                </p>
                <p className="text-sm text-muted-foreground">
                  Coming soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 