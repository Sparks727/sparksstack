"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocationStore } from "@/lib/store/location-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewCard from "@/components/ReviewCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import GoogleBusinessClient from "./GoogleBusinessClient";

function RatingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function ReviewsPage() {
  const { user, isLoaded } = useUser();
  const { locations, activeLocationId } = useLocationStore();
  
  // Protect this page - redirect if not authenticated
  if (isLoaded && !user) {
    redirect("/");
  }

  // Find the active location
  const activeLocation = locations.find(loc => loc.id === activeLocationId) || locations[0];

  // Sample reviews data
  const reviews = [
    {
      id: 1,
      author: "John Doe",
      rating: 5,
      date: "2023-12-10",
      content: "Excellent service! The team was very professional and attentive to my needs. Would definitely recommend to others.",
      replied: true
    },
    {
      id: 2,
      author: "Jane Smith",
      rating: 4,
      date: "2023-12-05",
      content: "Great experience overall. The only reason I'm not giving 5 stars is because the response time could be a bit faster.",
      replied: false
    },
    {
      id: 3,
      author: "Bob Johnson",
      rating: 5,
      date: "2023-11-28",
      content: "Top-notch service and quality. I've been a customer for years and have never been disappointed.",
      replied: true
    },
    {
      id: 4,
      author: "Alice Brown",
      rating: 3,
      date: "2023-11-15",
      content: "Decent service, but there's definitely room for improvement in terms of communication.",
      replied: false
    },
    {
      id: 5,
      author: "Michael Wilson",
      rating: 5,
      date: "2023-11-10",
      content: "Absolutely fantastic! The attention to detail was impressive.",
      replied: true
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <Button variant="outline">Export</Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Google Business Profile Data</h2>
        <p className="text-muted-foreground">
          Below is the real data from your connected Google Business Profile account. 
          This data is fetched directly via the Google Business Profile API.
        </p>
        <GoogleBusinessClient />
      </div>

      <div className="space-y-6">
        {/* Review Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* If no location connected */}
          {!activeLocation?.isConnected && (
            <Card className="border-dashed border-2">
              <CardHeader>
                <CardTitle>Connect your Google Business Profile</CardTitle>
                <CardDescription>
                  Connect your profile to manage and respond to reviews
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-8">
                <Button 
                  className="bg-[#4285F4] hover:bg-[#3367d6]"
                  size="lg"
                >
                  Connect to Google
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reviews Summary Card - only show if location connected */}
          {activeLocation?.isConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Reviews Overview</CardTitle>
                <CardDescription>Your business rating and review statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex flex-col items-center">
                    <div className="text-5xl font-bold flex items-center mb-2">
                      4.7 <RatingIcon />
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Rating</div>
                    <div className="text-sm font-medium">Based on 142 reviews</div>
                  </div>
                  
                  <div className="flex-1 space-y-2 min-w-[300px]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">5 stars</span>
                      <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <span className="text-sm">70%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">4 stars</span>
                      <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="text-sm">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">3 stars</span>
                      <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '7%' }}></div>
                      </div>
                      <span className="text-sm">7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">2 stars</span>
                      <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '2%' }}></div>
                      </div>
                      <span className="text-sm">2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">1 star</span>
                      <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '1%' }}></div>
                      </div>
                      <span className="text-sm">1%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold">15</div>
                      <div className="text-sm text-muted-foreground">New this month</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold">85%</div>
                      <div className="text-sm text-muted-foreground">Response rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Latest customer feedback from Google Business Profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{review.author}</div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i}
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill={i < review.rating ? "currentColor" : "none"}
                            stroke="currentColor" 
                            strokeWidth="2" 
                            className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                    <div>
                      <Button variant={review.replied ? "outline" : "default"} size="sm">
                        {review.replied ? "View Reply" : "Reply"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{review.content}</p>
                </div>
              ))}
            </div>
            <Button className="mt-6 w-full" variant="outline">Load More Reviews</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 