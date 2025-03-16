"use client";

import { useUser } from '@clerk/nextjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, StarIcon, MessageCircleIcon, MapPin, MessageSquareIcon, ThumbsUpIcon } from 'lucide-react';
import { useLocationStore } from '@/lib/store/location-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

// Sample review trends data by month
const reviewTrendsData = {
  'main': [
    { name: 'Jan', reviews: 8, rating: 4.5 },
    { name: 'Feb', reviews: 12, rating: 4.6 },
    { name: 'Mar', reviews: 10, rating: 4.7 },
    { name: 'Apr', reviews: 15, rating: 4.8 },
    { name: 'May', reviews: 14, rating: 4.7 },
    { name: 'Jun', reviews: 18, rating: 4.8 },
    { name: 'Jul', reviews: 22, rating: 4.7 },
  ],
  'arlington': [
    { name: 'Jan', reviews: 5, rating: 4.2 },
    { name: 'Feb', reviews: 8, rating: 4.3 },
    { name: 'Mar', reviews: 7, rating: 4.4 },
    { name: 'Apr', reviews: 12, rating: 4.5 },
    { name: 'May', reviews: 10, rating: 4.3 },
    { name: 'Jun', reviews: 14, rating: 4.6 },
    { name: 'Jul', reviews: 16, rating: 4.5 },
  ],
  'dallas': [
    { name: 'Jan', reviews: 10, rating: 4.6 },
    { name: 'Feb', reviews: 14, rating: 4.7 },
    { name: 'Mar', reviews: 13, rating: 4.8 },
    { name: 'Apr', reviews: 19, rating: 4.9 },
    { name: 'May', reviews: 17, rating: 4.8 },
    { name: 'Jun', reviews: 20, rating: 4.7 },
    { name: 'Jul', reviews: 24, rating: 4.8 },
  ],
  'fortworth': [
    { name: 'Jan', reviews: 4, rating: 4.0 },
    { name: 'Feb', reviews: 6, rating: 4.1 },
    { name: 'Mar', reviews: 5, rating: 4.2 },
    { name: 'Apr', reviews: 9, rating: 4.3 },
    { name: 'May', reviews: 8, rating: 4.2 },
    { name: 'Jun', reviews: 11, rating: 4.4 },
    { name: 'Jul', reviews: 14, rating: 4.5 },
  ],
  'all': [
    { name: 'Jan', reviews: 27, rating: 4.4 },
    { name: 'Feb', reviews: 40, rating: 4.5 },
    { name: 'Mar', reviews: 35, rating: 4.6 },
    { name: 'Apr', reviews: 55, rating: 4.7 },
    { name: 'May', reviews: 49, rating: 4.6 },
    { name: 'Jun', reviews: 63, rating: 4.7 },
    { name: 'Jul', reviews: 76, rating: 4.7 },
  ]
};

// Sample review distribution data
const reviewDistributionData = {
  'main': { 5: 70, 4: 20, 3: 7, 2: 2, 1: 1, total: 142 },
  'arlington': { 5: 65, 4: 25, 3: 5, 2: 3, 1: 2, total: 98 },
  'dallas': { 5: 75, 4: 18, 3: 5, 2: 1, 1: 1, total: 157 },
  'fortworth': { 5: 60, 4: 25, 3: 10, 2: 3, 1: 2, total: 67 },
  'all': { 5: 70, 4: 20, 3: 6, 2: 2, 1: 2, total: 464 }
};

// Sample review stats - these would come from API in real app
const reviewStats = {
  '1': { // Blue Sky Roofing - Main Office
    rating: "4.7",
    totalReviews: "142",
    responseRate: "85%",
    newReviews: "22",
    reviewChange: "15% increase",
    ratingChange: "0.2 increase",
    responseRateChange: "10% increase",
    totalReviewsTrend: "up" as const,
    ratingTrend: "up" as const,
    responseRateTrend: "up" as const,
  },
  '2': { // Blue Sky Roofing - Arlington
    rating: "4.5",
    totalReviews: "98",
    responseRate: "78%",
    newReviews: "16",
    reviewChange: "12% increase",
    ratingChange: "0.1 increase",
    responseRateChange: "8% increase",
    totalReviewsTrend: "up" as const,
    ratingTrend: "up" as const,
    responseRateTrend: "up" as const,
  },
  '3': { // Blue Sky Roofing - Dallas
    rating: "4.8",
    totalReviews: "157",
    responseRate: "90%",
    newReviews: "24",
    reviewChange: "20% increase",
    ratingChange: "0.3 increase",
    responseRateChange: "15% increase",
    totalReviewsTrend: "up" as const,
    ratingTrend: "up" as const,
    responseRateTrend: "up" as const,
  },
  '4': { // Blue Sky Roofing - Fort Worth
    rating: "4.3",
    totalReviews: "67",
    responseRate: "65%",
    newReviews: "14",
    reviewChange: "9% increase",
    ratingChange: "0.1 increase",
    responseRateChange: "5% increase",
    totalReviewsTrend: "up" as const,
    ratingTrend: "up" as const,
    responseRateTrend: "up" as const,
  },
  // Combined stats for "All Locations"
  all: {
    rating: "4.7",
    totalReviews: "464",
    responseRate: "82%",
    newReviews: "76",
    reviewChange: "16% increase",
    ratingChange: "0.2 increase",
    responseRateChange: "12% increase",
    totalReviewsTrend: "up" as const,
    ratingTrend: "up" as const,
    responseRateTrend: "up" as const,
  }
};

// Sample reviews data
const sampleReviews = [
  {
    id: 1,
    author: "John Doe",
    rating: 5,
    date: "2023-07-15",
    content: "Excellent service! The team was very professional and attentive to my needs. Would definitely recommend to others.",
    replied: true,
    location: "main"
  },
  {
    id: 2,
    author: "Jane Smith",
    rating: 4,
    date: "2023-07-10",
    content: "Great experience overall. The only reason I'm not giving 5 stars is because the response time could be a bit faster.",
    replied: false,
    location: "arlington"
  },
  {
    id: 3,
    author: "Bob Johnson",
    rating: 5,
    date: "2023-07-05",
    content: "Top-notch service and quality. I've been a customer for years and have never been disappointed.",
    replied: true,
    location: "dallas"
  },
  {
    id: 4,
    author: "Alice Brown",
    rating: 3,
    date: "2023-06-28",
    content: "Decent service, but there's definitely room for improvement in terms of communication.",
    replied: false,
    location: "fortworth"
  },
  {
    id: 5,
    author: "Michael Wilson",
    rating: 5,
    date: "2023-06-20",
    content: "Absolutely fantastic! The attention to detail was impressive.",
    replied: true,
    location: "main"
  },
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

function RatingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const { locations, activeLocationId, setActiveLocation } = useLocationStore();
  const [filteredReviews, setFilteredReviews] = useState(sampleReviews);
  
  // Get active location or null for "All Locations"
  const activeLocation = activeLocationId 
    ? locations.find(loc => loc.id === activeLocationId) 
    : null;
  
  // Get stats based on active location or all locations
  const stats = activeLocationId 
    ? reviewStats[activeLocationId as keyof typeof reviewStats] 
    : reviewStats.all;
  
  // Get distribution data based on active location
  const distributionData = activeLocationId
    ? activeLocationId === '1'
      ? reviewDistributionData.main
      : activeLocationId === '2'
        ? reviewDistributionData.arlington
        : activeLocationId === '3'
          ? reviewDistributionData.dallas
          : reviewDistributionData.fortworth
    : reviewDistributionData.all;
  
  // Get trends data based on active location
  const trendsData = activeLocationId
    ? activeLocationId === '1'
      ? reviewTrendsData.main
      : activeLocationId === '2'
        ? reviewTrendsData.arlington
        : activeLocationId === '3'
          ? reviewTrendsData.dallas
          : reviewTrendsData.fortworth
    : reviewTrendsData.all;
  
  // Filter reviews based on active location
  useEffect(() => {
    if (!activeLocationId) {
      setFilteredReviews(sampleReviews);
    } else {
      const locationKey = 
        activeLocationId === '1' ? 'main' : 
        activeLocationId === '2' ? 'arlington' : 
        activeLocationId === '3' ? 'dallas' : 'fortworth';
      
      setFilteredReviews(sampleReviews.filter(review => review.location === locationKey));
    }
  }, [activeLocationId]);
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Review Management Dashboard {user && `- Welcome, ${user.firstName || 'User'}`}
        </h1>
        
        <p className="text-gray-600 mt-1">
          {activeLocation 
            ? `Managing reviews for ${activeLocation.name}`
            : "Managing reviews for all locations"}
        </p>
      </div>

      {/* Review Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Overall Rating" 
          value={stats.rating} 
          change={stats.ratingChange} 
          icon={StarIcon} 
          trend={stats.ratingTrend} 
        />
        <StatCard 
          title="Total Reviews" 
          value={stats.totalReviews} 
          change={stats.reviewChange} 
          icon={MessageSquareIcon} 
          trend={stats.totalReviewsTrend} 
        />
        <StatCard 
          title="New Reviews (30d)" 
          value={stats.newReviews} 
          change={stats.reviewChange} 
          icon={MessageCircleIcon} 
          trend={stats.totalReviewsTrend} 
        />
        <StatCard 
          title="Response Rate" 
          value={stats.responseRate} 
          change={stats.responseRateChange} 
          icon={ThumbsUpIcon} 
          trend={stats.responseRateTrend} 
        />
      </div>

      {/* Review Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Rating Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Customer ratings breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold flex items-center mb-2">
                  {stats.rating} <RatingIcon />
                </div>
                <div className="text-sm text-muted-foreground">Overall Rating</div>
                <div className="text-sm font-medium">Based on {distributionData.total} reviews</div>
              </div>
              
              <div className="flex-1 space-y-2 min-w-[300px]">
                <div className="flex items-center justify-between">
                  <span className="text-sm">5 stars</span>
                  <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${distributionData[5]}%` }}></div>
                  </div>
                  <span className="text-sm">{distributionData[5]}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">4 stars</span>
                  <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${distributionData[4]}%` }}></div>
                  </div>
                  <span className="text-sm">{distributionData[4]}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">3 stars</span>
                  <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${distributionData[3]}%` }}></div>
                  </div>
                  <span className="text-sm">{distributionData[3]}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">2 stars</span>
                  <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${distributionData[2]}%` }}></div>
                  </div>
                  <span className="text-sm">{distributionData[2]}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">1 star</span>
                  <div className="w-2/3 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${distributionData[1]}%` }}></div>
                  </div>
                  <span className="text-sm">{distributionData[1]}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Trends Card */}
        <Card>
          <CardHeader>
            <CardTitle>Review Trends</CardTitle>
            <CardDescription>Monthly review activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="reviews" name="Reviews" stroke="#3b82f6" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="rating" name="Avg Rating" stroke="#f59e0b" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Latest customer feedback from Google Business Profile</CardDescription>
          </div>
          <Button>Manage All Reviews</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
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
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reviews available for this location.</p>
              </div>
            )}
          </div>
          {filteredReviews.length > 0 && (
            <Button className="mt-6 w-full" variant="outline">Load More Reviews</Button>
          )}
        </CardContent>
      </Card>
      
      {/* Location List (only shown when viewing all locations) */}
      {!activeLocation && locations.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Your Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map(location => {
              // Determine which location data to use
              const locId = location.id;
              const locStats = reviewStats[locId as keyof typeof reviewStats];
              
              return (
                <div key={location.id} className="border rounded-md p-4 hover:border-blue-500 transition-colors">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-50 rounded-full mr-3">
                      <MapPin size={18} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{location.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="font-medium mr-1">{locStats.rating}</span>
                        <RatingIcon />
                        <span className="text-xs text-gray-500 ml-1">({locStats.totalReviews} reviews)</span>
                      </div>
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
                          View Reviews
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional location review stats */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 pt-3 border-t">
                    <div>
                      <span className="block font-medium">New Reviews (30d):</span>
                      {locStats.newReviews}
                    </div>
                    <div>
                      <span className="block font-medium">Response Rate:</span>
                      {locStats.responseRate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
} 