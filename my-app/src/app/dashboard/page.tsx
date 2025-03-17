"use client";

import { useUser } from '@clerk/nextjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, StarIcon, MessageCircleIcon, MapPin, MessageSquareIcon, ThumbsUpIcon, ChevronDown, CalendarIcon } from 'lucide-react';
import { useLocationStore } from '@/lib/store/location-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, isAfter, parseISO, isBefore, startOfDay, endOfDay, isSameDay } from "date-fns";
import { DateRange } from 'react-day-picker';
import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
    reply: "Thank you for your kind words, John! We're glad you had a great experience with our team.",
    location: "main"
  },
  {
    id: 2,
    author: "Jane Smith",
    rating: 4,
    date: "2023-07-10",
    content: "Great experience overall. The only reason I'm not giving 5 stars is because the response time could be a bit faster.",
    replied: false,
    reply: "",
    location: "arlington"
  },
  {
    id: 3,
    author: "Bob Johnson",
    rating: 5,
    date: "2023-07-05",
    content: "Top-notch service and quality. I've been a customer for years and have never been disappointed.",
    replied: true,
    reply: "We appreciate your continued support, Bob! It's loyal customers like you that keep us motivated to deliver excellence.",
    location: "dallas"
  },
  {
    id: 4,
    author: "Alice Brown",
    rating: 3,
    date: "2023-06-28",
    content: "Decent service, but there's definitely room for improvement in terms of communication.",
    replied: false,
    reply: "",
    location: "fortworth"
  },
  {
    id: 5,
    author: "Michael Wilson",
    rating: 5,
    date: "2023-06-20",
    content: "Absolutely fantastic! The attention to detail was impressive.",
    replied: true,
    reply: "Thank you, Michael! We pride ourselves on our attention to detail and we're glad it showed in your experience.",
    location: "main"
  },
  {
    id: 6,
    author: "Sarah Thompson",
    rating: 4,
    date: "2023-06-15",
    content: "Very satisfied with the service. The team was knowledgeable and fixed our roof issues quickly.",
    replied: true,
    reply: "Thank you for your feedback, Sarah! We're happy to hear our team resolved your roofing issues efficiently.",
    location: "arlington"
  },
  {
    id: 7,
    author: "David Clark",
    rating: 2,
    date: "2023-06-10",
    content: "The quality of work was okay, but I had issues with scheduling and had to reschedule twice.",
    replied: true,
    reply: "We apologize for the scheduling issues, David. We've since improved our scheduling system to prevent such inconveniences in the future.",
    location: "dallas"
  },
  {
    id: 8,
    author: "Emily Roberts",
    rating: 5,
    date: "2023-06-05",
    content: "Excellent customer service! They went above and beyond to explain the roofing process and answer all my questions.",
    replied: false,
    reply: "",
    location: "fortworth"
  },
  {
    id: 9,
    author: "Kevin Martinez",
    rating: 3,
    date: "2023-05-30",
    content: "The roof looks good, but there was some miscommunication about the timeline.",
    replied: false,
    reply: "",
    location: "main"
  },
  {
    id: 10,
    author: "Laura Wilson",
    rating: 5,
    date: "2023-05-25",
    content: "Couldn't be happier with my new roof! Fair pricing and excellent workmanship.",
    replied: true,
    reply: "Thank you Laura! We're glad you're happy with your new roof and appreciated our fair pricing.",
    location: "arlington"
  },
  {
    id: 11,
    author: "Mark Johnson",
    rating: 4,
    date: "2023-05-20",
    content: "Professional team that delivered quality work. Only giving 4 stars because of a slight delay in starting the project.",
    replied: false,
    reply: "",
    location: "dallas"
  },
  {
    id: 12,
    author: "Jennifer Adams",
    rating: 5,
    date: "2023-05-15",
    content: "Blue Sky Roofing did an amazing job on our commercial building. Highly recommend their services!",
    replied: true,
    reply: "Thank you for the recommendation, Jennifer! We're proud to have met your commercial roofing needs.",
    location: "fortworth"
  },
  {
    id: 13,
    author: "Thomas Wilson",
    rating: 5,
    date: "2023-05-10",
    content: "Exceptional service! I had a complex roofing issue that other companies wouldn't touch, but Blue Sky Roofing solved it perfectly.",
    replied: true,
    reply: "Thank you for your kind words, Thomas! We pride ourselves on tackling difficult projects that others might avoid.",
    location: "main"
  },
  {
    id: 14,
    author: "Rebecca Lane",
    rating: 4,
    date: "2023-05-05",
    content: "Great communication throughout the project. The team was always available to answer my questions and kept me updated on progress.",
    replied: false,
    reply: "",
    location: "arlington"
  },
  {
    id: 15,
    author: "Daniel Garcia",
    rating: 2,
    date: "2023-04-30",
    content: "The work was completed on time, but there were issues with cleanup afterward. Had to call them back to fix it.",
    replied: true,
    reply: "We apologize for the oversight with the cleanup, Daniel. We've implemented new quality control procedures to ensure this doesn't happen again.",
    location: "dallas"
  },
  {
    id: 16,
    author: "Samantha Wright",
    rating: 5,
    date: "2023-04-25",
    content: "I can't recommend Blue Sky Roofing enough! From the initial consultation to the final installation, everything was perfect.",
    replied: true,
    reply: "We're delighted to hear about your positive experience, Samantha! Thank you for the recommendation.",
    location: "fortworth"
  },
  {
    id: 17,
    author: "Ethan Cooper",
    rating: 3,
    date: "2023-04-20",
    content: "The roofing work was good quality, but the project took longer than initially quoted. Better time estimation would be appreciated.",
    replied: false,
    reply: "",
    location: "main"
  },
  {
    id: 18,
    author: "Olivia Bennett",
    rating: 5,
    date: "2023-04-15",
    content: "Blue Sky Roofing helped me with an emergency repair after a storm. They were quick to respond and fixed everything perfectly.",
    replied: true,
    reply: "We understand how stressful emergency situations can be, Olivia. We're glad we could help resolve your roofing emergency promptly!",
    location: "arlington"
  }
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.FC<{ size?: number; className?: string }>;
  trend: 'up' | 'down';
  isLoading?: boolean;
}

// Stat card component with loading state
const StatCard = ({ title, value, change, icon: Icon, trend, isLoading = false }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {isLoading ? (
          <div className="h-8 w-16 mt-1 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <p className="text-2xl font-semibold mt-1">{value}</p>
        )}
        <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {isLoading ? (
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              {trend === 'up' ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />}
              <span className="text-sm ml-1">{change}</span>
            </>
          )}
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
    <StarIcon className="h-6 w-6 text-yellow-500 fill-yellow-500" />
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const { locations, activeLocationId, setActiveLocation } = useLocationStore();
  const [filteredReviews, setFilteredReviews] = useState(sampleReviews);
  const [activeTab, setActiveTab] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // New state variables for enhanced features
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<(typeof sampleReviews)[0] | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  // Date range states
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [reviewMetrics, setReviewMetrics] = useState({
    rating: 0,
    totalReviews: 0,
    newReviews: 0,
    responseRate: 0
  });
  
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
  
  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle location selection
  const handleLocationChange = (id: string | null) => {
    setActiveLocation(id);
    setDropdownOpen(false);
  };
  
  // Function to fetch reviews data based on date range
  const fetchReviewsData = async (from: Date, to: Date) => {
    setIsLoadingData(true);
    
    try {
      // Make sure we start from the beginning of the "from" day and end at the end of the "to" day
      const fromDate = startOfDay(from);
      const toDate = endOfDay(to);
      
      // This would be an actual API call to Google Business Profile API
      // Simulating API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter reviews by date range
      const locationKey = 
        activeLocationId === '1' ? 'main' : 
        activeLocationId === '2' ? 'arlington' : 
        activeLocationId === '3' ? 'dallas' : 
        activeLocationId === '4' ? 'fortworth' : null;
      
      // Filter all reviews by date and location (if applicable)
      const filteredByDate = sampleReviews.filter(review => {
        const reviewDate = parseISO(review.date);
        
        // Check if review is within date range using proper date comparison
        const isInDateRange = 
          (isAfter(reviewDate, fromDate) || isSameDay(reviewDate, fromDate)) && 
          (isBefore(reviewDate, toDate) || isSameDay(reviewDate, toDate));
        
        if (locationKey) {
          return review.location === locationKey && isInDateRange;
        }
        
        return isInDateRange;
      });
      
      // Calculate metrics from filtered reviews
      let totalRating = 0;
      filteredByDate.forEach(review => {
        totalRating += review.rating;
      });
      
      const averageRating = filteredByDate.length > 0 
        ? (totalRating / filteredByDate.length).toFixed(1) 
        : "0.0";
      
      const repliedCount = filteredByDate.filter(review => review.replied).length;
      const responseRate = filteredByDate.length > 0 
        ? Math.round((repliedCount / filteredByDate.length) * 100) 
        : 0;
      
      // Update metrics
      setReviewMetrics({
        rating: parseFloat(averageRating),
        totalReviews: filteredByDate.length,
        newReviews: filteredByDate.length, // In real app, you'd calculate new reviews differently
        responseRate: responseRate
      });
      
      setFilteredReviews(filteredByDate);
      setVisibleReviews(5); // Reset visible reviews when date changes
      
    } catch (error) {
      console.error("Error fetching reviews data:", error);
      // Error notification would go here
    } finally {
      setIsLoadingData(false);
    }
  };
  
  // Apply date range when it changes
  useEffect(() => {
    if (activeLocationId && dateRange.from && dateRange.to) {
      fetchReviewsData(dateRange.from, dateRange.to);
    }
  }, [dateRange, activeLocationId, fetchReviewsData]);
  
  // Make sure we handle the date range selection properly
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range) return;
    
    // If only the from date is selected, don't update the state yet
    if (range.from && !range.to) {
      setDateRange({ ...dateRange, from: range.from });
      return;
    }
    
    // When both dates are selected
    if (range.from && range.to) {
      // Set the full date range
      setDateRange(range);
      // Close the popover only when both dates are selected
      setDateRangeOpen(false);
    }
  };
  
  // Filter reviews based on active location and search query
  useEffect(() => {
    let filtered = filteredReviews;
    
    // Filter by search query if one exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.content.toLowerCase().includes(query) || 
        review.author.toLowerCase().includes(query)
      );
    }
    
    // Only update if search query changes
    if (searchQuery.trim()) {
      setFilteredReviews(filtered);
      // Reset visible reviews count when filter changes
      setVisibleReviews(5);
    }
  }, [searchQuery, filteredReviews]);
  
  // Get filtered reviews based on the active tab
  const getTabReviews = () => {
    switch (activeTab) {
      case "negative":
        return filteredReviews.filter(review => review.rating <= 3);
      case "unreplied":
        return filteredReviews.filter(review => !review.replied);
      case "all":
      default:
        return filteredReviews;
    }
  };
  
  const tabReviews = getTabReviews().slice(0, visibleReviews);
  const hasMoreReviews = getTabReviews().length > visibleReviews;
  
  // Load more reviews handler
  const handleLoadMore = () => {
    setVisibleReviews(prev => prev + 5);
  };
  
  // Open reply dialog
  const handleOpenReplyDialog = (review: typeof sampleReviews[0]) => {
    setCurrentReview(review);
    setReplyText(review.reply || "");
    setReplyDialogOpen(true);
  };
  
  // Submit review reply
  const handleSubmitReply = async () => {
    if (!currentReview || !replyText.trim()) return;
    
    setIsSubmittingReply(true);
    
    try {
      // This would be an API call to Google Business Profile in a real implementation
      // Simulating API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the review in our local state
      // In a real implementation, we would fetch the updated data from the API
      // For the demo, manually update our sample data
      sampleReviews.forEach((review, index) => {
        if (review.id === currentReview.id) {
          sampleReviews[index] = { ...review, replied: true, reply: replyText };
        }
      });
      
      // Update filtered reviews
      setFilteredReviews(prevFiltered => {
        return prevFiltered.map(review => 
          review.id === currentReview.id
            ? { ...review, replied: true, reply: replyText }
            : review
        );
      });
      
      // Close the dialog
      setReplyDialogOpen(false);
      setCurrentReview(null);
      setReplyText("");
      
      // Show success notification (would be implemented with a toast system in real app)
      console.log("Reply submitted successfully");
    } catch (error) {
      console.error("Error submitting reply:", error);
      // Show error notification
    } finally {
      setIsSubmittingReply(false);
    }
  };
  
  // Format date range for display
  const formattedDateRange = () => {
    if (!dateRange.from) {
      return "Select date range";
    }
    
    if (dateRange.from && !dateRange.to) {
      return `From ${format(dateRange.from, 'MMM d, yyyy')}`;
    }
    
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
    }
    
    return "Select date range";
  };
  
  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Review Management Dashboard {user && `- Welcome, ${user.firstName || 'User'}`}
          </h1>
          
          <p className="text-gray-600 mt-1">
            {activeLocation 
              ? `Managing reviews for ${activeLocation.name}`
              : "Managing reviews for all locations"}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
          {/* Date Range Selector */}
          <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                disabled={isLoadingData}
              >
                <CalendarIcon size={16} />
                <span>{formattedDateRange()}</span>
                {isLoadingData && (
                  <div className="animate-spin ml-1 h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
              <div className="p-3 border-t border-gray-200 flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setDateRange({
                        from: subDays(today, 7),
                        to: today
                      });
                    }}
                  >
                    Last 7 days
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setDateRange({
                        from: subDays(today, 30),
                        to: today
                      });
                    }}
                  >
                    Last 30 days
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    setDateRange({
                      from: subDays(today, 90),
                      to: today
                    });
                  }}
                >
                  Last 90 days
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Location Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center p-2 border rounded-md bg-white shadow-sm hover:bg-gray-50 transition-colors"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center">
                <MapPin size={16} className="mr-1 text-blue-500" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{activeLocation ? activeLocation.name : "All Locations"}</span>
                  {activeLocation && (
                    <span className="text-xs text-gray-500 truncate max-w-[240px]">
                      {activeLocation.address}
                    </span>
                  )}
                </div>
                <ChevronDown size={16} className="ml-1" />
              </div>
            </button>
            
            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white shadow-lg rounded-md overflow-hidden z-20 border">
                {/* All Locations option */}
                <button
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${!activeLocationId ? 'bg-orange-50 text-orange-600' : ''}`}
                  onClick={() => handleLocationChange(null)}
                >
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2 text-blue-500" />
                    <span className="font-medium">All Locations</span>
                  </div>
                </button>
                
                {/* Individual locations */}
                {locations.map(location => (
                  <button
                    key={location.id}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${activeLocationId === location.id ? 'bg-orange-50 text-orange-600' : ''}`}
                    onClick={() => handleLocationChange(location.id)}
                  >
                    <div className="flex">
                      <MapPin size={16} className="mr-2 text-blue-500 flex-shrink-0 mt-1" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{location.name}</span>
                        <span className="text-xs text-gray-500 truncate">{location.address}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Overall Rating" 
          value={reviewMetrics.rating ? reviewMetrics.rating.toString() : stats.rating} 
          change={stats.ratingChange} 
          icon={StarIcon} 
          trend={stats.ratingTrend} 
          isLoading={isLoadingData}
        />
        <StatCard 
          title="Total Reviews" 
          value={reviewMetrics.totalReviews ? reviewMetrics.totalReviews.toString() : stats.totalReviews} 
          change={`${reviewMetrics.totalReviews} in selected period`} 
          icon={MessageSquareIcon} 
          trend={stats.totalReviewsTrend} 
          isLoading={isLoadingData}
        />
        <StatCard 
          title="New Reviews" 
          value={reviewMetrics.newReviews ? reviewMetrics.newReviews.toString() : stats.newReviews} 
          change={`During ${dateRange.from ? format(dateRange.from, 'MMM d') : ''} - ${dateRange.to ? format(dateRange.to, 'MMM d') : ''}`} 
          icon={MessageCircleIcon} 
          trend={stats.totalReviewsTrend} 
          isLoading={isLoadingData}
        />
        <StatCard 
          title="Response Rate" 
          value={reviewMetrics.responseRate ? `${reviewMetrics.responseRate}%` : stats.responseRate} 
          change={stats.responseRateChange} 
          icon={ThumbsUpIcon} 
          trend={stats.responseRateTrend} 
          isLoading={isLoadingData}
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
                  {reviewMetrics.rating ? reviewMetrics.rating.toString() : stats.rating} <RatingIcon />
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
      
      {/* Reviews with Tabs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>Latest feedback from Google Business Profile</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search reviews by content or author..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchQuery && (
                <Button 
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="all">All Reviews ({filteredReviews.length})</TabsTrigger>
              <TabsTrigger value="negative">Negative Reviews ({filteredReviews.filter(r => r.rating <= 3).length})</TabsTrigger>
              <TabsTrigger value="unreplied">Unreplied ({filteredReviews.filter(r => !r.replied).length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {renderReviews(tabReviews, handleOpenReplyDialog, hasMoreReviews, handleLoadMore)}
            </TabsContent>
            
            <TabsContent value="negative" className="space-y-4">
              {renderReviews(tabReviews, handleOpenReplyDialog, hasMoreReviews, handleLoadMore)}
            </TabsContent>
            
            <TabsContent value="unreplied" className="space-y-4">
              {renderReviews(tabReviews, handleOpenReplyDialog, hasMoreReviews, handleLoadMore)}
            </TabsContent>
          </Tabs>
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
                        <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
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
      
      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setReplyDialogOpen(false);
          setCurrentReview(null);
          setReplyText("");
        }
      }}>
        {currentReview && (
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Reply to {currentReview.author}&apos;s Review</DialogTitle>
            </DialogHeader>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center mb-2">
                <div className="font-medium">{currentReview.author}</div>
                <div className="ml-2 flex items-center">
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i}
                        className={`h-4 w-4 ${i < currentReview.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{currentReview.date}</span>
                </div>
              </div>
              <p className="text-sm">{currentReview.content}</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-1">
                Your Reply
              </label>
              <Textarea
                id="reply"
                className="resize-none"
                rows={5}
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              ></Textarea>
              <p className="text-xs text-gray-500 mt-1">
                Your reply will be public and visible to anyone who can see this review on Google.
              </p>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setReplyDialogOpen(false);
                  setCurrentReview(null);
                  setReplyText("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReply}
                disabled={isSubmittingReply || !replyText.trim()}
              >
                {isSubmittingReply ? "Submitting..." : "Submit Reply"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

// Helper function to render reviews
function renderReviews(
  reviews: typeof sampleReviews, 
  onReplyClick: (review: typeof sampleReviews[0]) => void,
  hasMoreReviews: boolean,
  onLoadMore: () => void
) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews available for this filter.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-6">
        {reviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium">{review.author}</div>
                  <div className="flex items-center">
                    <div className="flex space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">{review.date}</span>
                  </div>
                </div>
                <div>
                  <Button 
                    variant={review.replied ? "outline" : "default"} 
                    size="sm"
                    onClick={() => onReplyClick(review)}
                  >
                    {review.replied ? "View Reply" : "Reply"}
                  </Button>
                </div>
              </div>
              <p className="text-sm mt-3">{review.content}</p>
              
              {/* Review Reply (if exists) */}
              {review.replied && review.reply && (
                <div className="mt-4 pt-3 pl-4 border-l-2 border-blue-200 bg-blue-50/50 rounded-sm pb-3 pr-3">
                  <p className="text-xs font-semibold text-blue-600">Your response:</p>
                  <p className="text-sm text-gray-700 mt-1">{review.reply}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {hasMoreReviews && (
        <Button className="mt-6 w-full" variant="outline" onClick={onLoadMore}>
          Load More Reviews
        </Button>
      )}
    </>
  );
} 