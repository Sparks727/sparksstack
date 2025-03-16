import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ConnectGBP() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate API connection
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Google Business Profile</CardTitle>
        <CardDescription>
          Connect your Google Business Profile to view insights and manage your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <AlertTitle className="font-medium">Connected</AlertTitle>
            <AlertDescription>
              Your Google Business Profile is connected. You can now view your business metrics.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Google Business Profile to access:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Business metrics and insights</li>
              <li>Customer reviews and ratings</li>
              <li>Post and photo performance</li>
              <li>Local search analytics</li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isConnected ? (
          <Button variant="destructive" onClick={handleDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="bg-[#4285F4] hover:bg-[#3367d6] text-white"
          >
            {isConnecting ? "Connecting..." : "Connect Google Business Profile"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 