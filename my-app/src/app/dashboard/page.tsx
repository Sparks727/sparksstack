/* eslint-disable */
"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader } from '@/components/ui/card';
import { ActivitySquare, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('api-test');
  const router = useRouter();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'api-test') {
      router.push('/dashboard/api-direct-test');
    } else if (value === 'metrics') {
      router.push('/dashboard/google/metrics');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Google Business Profile</h1>
        <p className="text-muted-foreground">
          Test your API connections and view performance metrics
        </p>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-2">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="api-test" className="flex items-center gap-2">
                <ActivitySquare className="h-4 w-4" />
                <span>API Diagnostics</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Business Metrics</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
} 