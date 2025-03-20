import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define interfaces for the API response types
interface DailyValue {
  date?: {
    year: number;
    month: number;
    day: number;
  };
  value: string;
}

interface DailyMetricTimeSeries {
  metric: string;
  dailyValues: DailyValue[];
}

interface MetricSeries {
  dailyMetricTimeSeries?: DailyMetricTimeSeries;
}

/**
 * API endpoint to fetch business performance metrics for a specific account
 * This uses the Business Performance API to get metrics like views, searches, etc.
 */
export async function GET(request: Request) {
  try {
    // Get account ID from query parameter
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing accountId query parameter' },
        { status: 400 }
      );
    }
    
    // Ensure the user is authenticated
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - No user session found' },
        { status: 401 }
      );
    }
    
    // Make direct request to Clerk API for the Google OAuth token
    const response = await fetch(
      `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/google`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to retrieve Google OAuth token', 
          status: response.status,
          statusText: response.statusText 
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0 || !data[0].token) {
      return NextResponse.json(
        { error: 'No Google OAuth token found' },
        { status: 400 }
      );
    }
    
    const oauthToken = data[0].token;
    
    // Construct the account resource name
    const accountResource = `accounts/${accountId}`;
    
    // Get current date and date 30 days ago for metrics time range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    // Try to fetch performance metrics using Business Performance API
    try {
      // Fetch metrics data using the Business Performance API
      const metricsResponse = await fetch(
        `https://businessprofileperformance.googleapis.com/v1/${accountResource}:fetchMultiDailyMetricsTimeSeries`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${oauthToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dailyMetrics: [
              "BUSINESS_IMPRESSIONS_DESKTOP",
              "BUSINESS_IMPRESSIONS_MOBILE",
              "BUSINESS_CONVERSATIONS",
              "BUSINESS_DIRECTION_REQUESTS",
              "BUSINESS_BOOKINGS",
              "BUSINESS_WEBSITE_CLICKS",
              "BUSINESS_PHONE_CALLS"
            ],
            timeRange: {
              startDate: {
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,  // JavaScript months are 0-indexed
                day: startDate.getDate()
              },
              endDate: {
                year: endDate.getFullYear(),
                month: endDate.getMonth() + 1,
                day: endDate.getDate()
              }
            }
          })
        }
      );

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        
        // Calculate totals for each metric
        const metricTotals = {
          impressions: 0,
          searches: 0,
          conversations: 0,
          directionRequests: 0,
          bookings: 0,
          websiteClicks: 0,
          phoneCalls: 0
        };
        
        // Process the metrics data to sum up all values
        if (metricsData.multiDailyMetricsTimeSeries) {
          metricsData.multiDailyMetricsTimeSeries.forEach((metricSeries: MetricSeries) => {
            if (metricSeries.dailyMetricTimeSeries?.dailyValues) {
              const total = metricSeries.dailyMetricTimeSeries.dailyValues.reduce(
                (sum: number, day: DailyValue) => sum + (parseInt(day.value) || 0), 
                0
              );
              
              // Map the metric type to our total object
              const metricType = metricSeries.dailyMetricTimeSeries.metric;
              if (metricType.includes('IMPRESSIONS')) {
                metricTotals.impressions += total;
              } else if (metricType.includes('SEARCHES')) {
                metricTotals.searches += total;
              } else if (metricType.includes('CONVERSATIONS')) {
                metricTotals.conversations += total;
              } else if (metricType.includes('DIRECTION_REQUESTS')) {
                metricTotals.directionRequests += total;
              } else if (metricType.includes('BOOKINGS')) {
                metricTotals.bookings += total;
              } else if (metricType.includes('WEBSITE_CLICKS')) {
                metricTotals.websiteClicks += total;
              } else if (metricType.includes('PHONE_CALLS')) {
                metricTotals.phoneCalls += total;
              }
            }
          });
        }
        
        return NextResponse.json({
          success: true,
          message: 'Successfully retrieved business performance metrics',
          accountId,
          metrics: metricTotals,
          timeRange: {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
          },
          rawData: metricsData
        });
      } else {
        // Performance API request failed
        const errorData = await metricsResponse.json().catch(() => ({}));
        
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch business performance metrics',
          accountId,
          details: errorData,
          status: metricsResponse.status,
          message: 'Business Performance API endpoint failed. Make sure the API is enabled and you have proper permissions.'
        }, { status: metricsResponse.status });
      }
    } catch (metricsError) {
      return NextResponse.json({
        success: false,
        error: 'Error processing business performance metrics',
        message: metricsError instanceof Error ? metricsError.message : 'Unknown error',
        accountId
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching business performance metrics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 