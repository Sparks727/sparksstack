'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GoogleBusinessClient from './GoogleBusinessClient';
import GoogleBusinessDebug from './GoogleBusinessDebug';

interface GoogleBusinessSectionProps {
  showDebug?: boolean;
  title?: string;
  description?: string;
  compact?: boolean;
}

export default function GoogleBusinessSection({
  showDebug = false,
  title = "Google Business Profile",
  description = "Data from your connected Google Business Profile account",
  compact = false
}: GoogleBusinessSectionProps) {
  const [debugVisible, setDebugVisible] = useState(false);
  
  return (
    <div className="space-y-6">
      <Card className={compact ? "shadow-sm" : "shadow"}>
        <CardHeader className={compact ? "pb-2" : ""}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {showDebug && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDebugVisible(!debugVisible)}
              >
                {debugVisible ? "Hide Troubleshooting" : "Troubleshooting"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <GoogleBusinessClient />
          
          {showDebug && debugVisible && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Troubleshooting</h3>
              <GoogleBusinessDebug />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 