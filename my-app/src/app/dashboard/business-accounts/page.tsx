"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ColumnDef,
  ColumnFiltersState,
  SortingState, 
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, Search, Store, AlertTriangle, Ban, Bell, Trash, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import React from 'react';

interface BusinessAccount {
  id: string;
  name: string;
  accountNumber: string | null;
  type: string;
  role: string;
  fullResource: string;
  verificationState?: string;
  reviewCount?: number;
  performance?: {
    impressions: number;
    searches: number;
    conversations: number;
    directionRequests: number;
    bookings: number;
    websiteClicks: number;
    phoneCalls: number;
  }
}

interface BusinessLocation {
  name: string;
  title?: string;
  locationName?: string;
  storeCode?: string;
  address?: {
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    addressLines?: string[];
    regionCode?: string;
  };
  primaryPhone?: string;
  websiteUri?: string;
  regularHours?: {
    periods?: Array<{
      openDay?: string;
      openTime?: string;
      closeDay?: string;
      closeTime?: string;
    }>;
  };
  primaryCategory?: {
    displayName?: string;
    categoryId?: string;
  };
  labels?: string[];
  profile?: {
    description?: string;
  };
}

export default function BusinessAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BusinessAccount | null>(null);
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return accounts;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    
    return accounts.filter(account => {
      // Search in name
      if (account.name?.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Search in account number
      if (account.accountNumber?.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Search in verification state
      if (account.verificationState?.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Search in type
      if (account.type?.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      return false;
    });
  }, [accounts, searchQuery]);

  // Define table columns - only the ones specified by the user
  const columns: ColumnDef<BusinessAccount>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Account Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "accountNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Account Number
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("accountNumber") || "N/A"}</div>,
    },
    {
      accessorKey: "verificationState",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Verification State
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const state = row.getValue("verificationState") as string;
        return (
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded text-xs ${
              state === 'VERIFIED' 
                ? 'bg-green-100 text-green-800' 
                : state === 'UNVERIFIED'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {getVerificationStateLabel(state)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "reviewCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reviews
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const value = row.getValue("reviewCount");
        return (
          <div className="text-right font-medium">
            {value !== undefined ? Number(value).toLocaleString() : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "performance.impressions",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Impressions
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const value = row.getValue("performance.impressions");
        return (
          <div className="text-right font-medium">
            {value ? Number(value).toLocaleString() : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "performance.searches",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Searches
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const value = row.getValue("performance.searches");
        return (
          <div className="text-right font-medium">
            {value ? Number(value).toLocaleString() : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "performance.websiteClicks",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Website Clicks
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const value = row.getValue("performance.websiteClicks");
        return (
          <div className="text-right font-medium">
            {value ? Number(value).toLocaleString() : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "performance.phoneCalls",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Phone Calls
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const value = row.getValue("performance.phoneCalls");
        return (
          <div className="text-right font-medium">
            {value ? Number(value).toLocaleString() : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "performance.directionRequests",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Direction Requests
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const value = row.getValue("performance.directionRequests");
        return (
          <div className="text-right font-medium">
            {value ? Number(value).toLocaleString() : "—"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const account = row.original;
        return (
          <div className="text-right">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewLocations(account)}
            >
              View Locations
            </Button>
          </div>
        )
      },
    },
  ];

  // Define location table columns
  const locationColumns: ColumnDef<BusinessLocation>[] = [
    {
      accessorKey: "locationName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Location Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const location = row.original;
        return <div className="font-medium">{location.locationName || location.title || "Unnamed Location"}</div>
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const location = row.original;
        const address = location.address;
        if (!address) return <div>No address available</div>;
        
        const addressParts = [];
        if (address.addressLines && address.addressLines.length > 0) {
          addressParts.push(...address.addressLines);
        }
        
        const cityStateZip = [];
        if (address.locality) cityStateZip.push(address.locality);
        if (address.administrativeArea) cityStateZip.push(address.administrativeArea);
        if (address.postalCode) cityStateZip.push(address.postalCode);
        
        if (cityStateZip.length > 0) {
          addressParts.push(cityStateZip.join(', '));
        }
        
        return <div>{addressParts.join(', ') || 'Address not available'}</div>;
      },
    },
    {
      accessorKey: "primaryCategory",
      header: "Category",
      cell: ({ row }) => {
        const location = row.original;
        return <div>{location.primaryCategory?.displayName || "Uncategorized"}</div>;
      },
    },
    {
      accessorKey: "primaryPhone",
      header: "Phone",
      cell: ({ row }) => {
        const location = row.original;
        return <div>{location.primaryPhone || "No phone"}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const location = row.original;
        return (
          <div className="text-right">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewLocationDetails(location)}
            >
              Details
            </Button>
          </div>
        )
      },
    },
  ];

  // Initialize the account table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    enableSorting: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Initialize the locations table
  const locationTable = useReactTable({
    data: locations,
    columns: locationColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  // Set pagination to show more rows per page
  useEffect(() => {
    table.setPageSize(100); // Show 100 records by default to display more accounts
  }, [table]);

  // Calculate account statistics
  const accountStats = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return null;
    
    const total = accounts.length;
    const unverified = accounts.filter(a => a.verificationState !== 'VERIFIED').length;
    const suspended = accounts.filter(a => a.type === 'SUSPENDED' || a.verificationState === 'SUSPENDED').length;
    
    // We don't have a direct way to determine these from API data, but we can approximate
    const googleUpdates = accounts.filter(a => a.type === 'PERSONAL').length; // Assuming PERSONAL accounts are those with Google updates
    const permanentlyClosed = 0; // This would require additional API calls to determine
    const duplicates = 0; // This would require additional API calls to determine
    
    return {
      total,
      unverified,
      suspended,
      googleUpdates,
      permanentlyClosed,
      duplicates,
    };
  }, [accounts]);

  async function fetchBusinessAccounts() {
    setLoading(true);
    setError(null);
    
    try {
      // Initialize an array to hold all fetched accounts
      let allAccounts: BusinessAccount[] = [];
      let nextPageToken = "";
      let firstPage = true;
      
      // Keep fetching pages until there's no more nextPageToken
      do {
        const pageUrl = firstPage 
          ? '/api/google/business-accounts?pageSize=100' 
          : `/api/google/business-accounts?pageSize=100&pageToken=${nextPageToken}`;
        
        const response = await fetch(pageUrl);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch business accounts');
        }
        
        if (data.success && data.accounts) {
          // Add this page of accounts to our collection
          allAccounts = [...allAccounts, ...data.accounts];
          
          // Update nextPageToken for the next iteration
          nextPageToken = data.nextPageToken || "";
          firstPage = false;
          
          console.log(`Fetched ${data.accounts.length} accounts. Total so far: ${allAccounts.length}`);
          
          // If we have a next page token, continue fetching
          if (!data.nextPageToken) {
            console.log("No more pages to fetch");
            break;
          }
        } else {
          setError('No accounts found or unexpected response format');
          break;
        }
      } while (nextPageToken);
      
      if (allAccounts.length > 0) {
        // Store accounts temporarily
        const fetchedAccounts = allAccounts;
        console.log(`Successfully fetched all ${fetchedAccounts.length} accounts`);
        
        // Fetch performance metrics and review counts for each account
        await Promise.all(
          fetchedAccounts.map(async (account: BusinessAccount) => {
            try {
              setLoadingPerformance(true);
              
              // Fetch performance metrics
              const perfResponse = await fetch(`/api/google/business-performance?accountId=${account.id}`);
              const perfData = await perfResponse.json();
              
              if (perfResponse.ok && perfData.success) {
                account.performance = perfData.metrics;
              }
              
              // Fetch reviews count for the first location of each account
              try {
                // First we need to get a location ID for this account
                const locationsResponse = await fetch(`/api/google/business-locations?accountId=${account.id}&pageSize=50`); // Request more locations
                const locationsData = await locationsResponse.json();
                
                if (locationsResponse.ok && locationsData.success && locationsData.locations && locationsData.locations.length > 0) {
                  // Get the first location's ID from its name property (e.g., "accounts/123/locations/456")
                  const locationIdMatch = locationsData.locations[0].name.match(/locations\/([^/]+)$/);
                  
                  if (locationIdMatch && locationIdMatch[1]) {
                    const locationId = locationIdMatch[1];
                    
                    // Now fetch the reviews count for this location
                    // Our updated API now supports both new and legacy Google API endpoints
                    const reviewsResponse = await fetch(`/api/google/business-reviews?accountId=${account.id}&locationId=${locationId}&pageSize=1`);
                    const reviewsData = await reviewsResponse.json();
                    
                    if (reviewsResponse.ok && reviewsData.success) {
                      account.reviewCount = reviewsData.totalReviewCount || 0;
                      console.log(`Reviews count for ${account.name}: ${account.reviewCount}`);
                    } else {
                      console.warn(`Failed to fetch reviews count for ${account.name}:`, reviewsData.error || 'Unknown error');
                    }
                  }
                }
              } catch (reviewsError) {
                console.error(`Error fetching reviews for account ${account.id}:`, reviewsError);
                // Don't fail if reviews count fetch fails
              }
              
            } catch (err) {
              console.error(`Error fetching data for account ${account.id}:`, err);
              // Don't fail the entire operation if one account fetch fails
            }
          })
        );
        
        // Set the final accounts with performance data and review counts
        setAccounts(fetchedAccounts);
      } else {
        setError('No accounts found or unexpected response format');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error fetching accounts');
      console.error('Error fetching business accounts:', error);
    } finally {
      setLoading(false);
      setLoadingPerformance(false);
    }
  }

  async function fetchLocations(account: BusinessAccount) {
    setLoadingLocations(true);
    setLocationError(null);
    
    try {
      const response = await fetch(`/api/google/business-locations?accountId=${account.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch locations');
      }
      
      if (data.success && data.locations) {
        setLocations(data.locations);
      } else {
        setLocationError('No locations found or unexpected response format');
        setLocations([]);
      }
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Unknown error fetching locations');
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  }

  function handleViewLocations(account: BusinessAccount) {
    setSelectedAccount(account);
    fetchLocations(account);
  }
  
  function handleBackToAccounts() {
    setSelectedAccount(null);
    setLocations([]);
    setLocationError(null);
  }

  function handleViewLocationDetails(location: BusinessLocation) {
    // In a real implementation, this could navigate to a detailed view
    // or open a modal with all location details
    alert(`Location details: ${location.locationName || location.title || 'Unnamed Location'}`);
    console.log('Location details:', location);
  }

  useEffect(() => {
    fetchBusinessAccounts();
  }, []);

  function getVerificationStateLabel(state: string) {
    switch (state) {
      case 'VERIFIED':
        return 'Verified';
      case 'UNVERIFIED':
        return 'Unverified';
      case 'VERIFICATION_REQUESTED':
        return 'Verification Requested';
      case 'VERIFICATION_PENDING':
        return 'Verification Pending';
      default:
        return state || 'Unknown';
    }
  }

  // Add this function to render statistics
  function renderAccountStats() {
    if (!accountStats) return null;
    
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-2">
            <Store className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{accountStats.total}</div>
          <div className="text-sm text-gray-500">Total businesses</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold">{accountStats.unverified}</div>
          <div className="text-sm text-gray-500">Unverified</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 mb-2">
            <Ban className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold">{accountStats.suspended}</div>
          <div className="text-sm text-gray-500">Suspended</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 mb-2">
            <Bell className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold">{accountStats.googleUpdates}</div>
          <div className="text-sm text-gray-500">Google updates</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">
            <Trash className="h-5 w-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold">{accountStats.permanentlyClosed}</div>
          <div className="text-sm text-gray-500">Permanently closed</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mb-2">
            <Copy className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold">{accountStats.duplicates}</div>
          <div className="text-sm text-gray-500">Duplicate</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            {selectedAccount ? (
              <>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    onClick={handleBackToAccounts}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <div>
                    <CardTitle>{selectedAccount.name}</CardTitle>
                    <CardDescription>
                      Viewing locations for this business account
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLocations(selectedAccount)}
                  disabled={loadingLocations}
                >
                  {loadingLocations ? 'Refreshing...' : 'Refresh Locations'}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <CardTitle>Google Business Profile Metrics</CardTitle>
                  <CardDescription>
                    View your business accounts with performance metrics
                  </CardDescription>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!selectedAccount ? (
            // Accounts view
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Business Accounts & Performance</h3>
                <Button onClick={fetchBusinessAccounts} disabled={loading || loadingPerformance}>
                  {loading || loadingPerformance ? 'Refreshing...' : 'Refresh Data'}
                </Button>
              </div>

              {error && (
                <Alert className="bg-red-50 border-red-200 text-red-800">
                  <h4 className="font-medium">Error Loading Accounts</h4>
                  <p className="text-sm mt-1">{error}</p>
                </Alert>
              )}

              {/* Show account statistics */}
              {!loading && renderAccountStats()}

              {/* Search input */}
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <TableHead key={header.id}>
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() && "selected"}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                              No accounts found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                      Showing {table.getFilteredRowModel().rows.length} of{" "}
                      {accounts.length} account(s)
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Rows per page: 
                      </span>
                      <select
                        className="h-8 w-16 rounded border border-input bg-background"
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                      >
                        {[10, 20, 50, 100, 200, 500].map((pageSize) => (
                          <option key={pageSize} value={pageSize}>
                            {pageSize}
                          </option>
                        ))}
                      </select>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-sm mt-6">
                <h4 className="font-medium mb-1">Performance Metrics (Last 30 Days):</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="font-medium">Impressions:</span> Total views of your business profile on Google Search and Maps</li>
                  <li><span className="font-medium">Searches:</span> Number of times your business appeared in search results</li>
                  <li><span className="font-medium">Website Clicks:</span> Users who clicked through to your website from your Business Profile</li>
                  <li><span className="font-medium">Phone Calls:</span> Users who clicked to call your business from your Business Profile</li>
                  <li><span className="font-medium">Direction Requests:</span> Users who requested directions to your location from Google Maps</li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  These metrics are sourced from the Google Business Profile Performance API. Make sure this API and the My Business Business Information API are enabled in your Google Cloud project.
                </p>
              </div>
            </div>
          ) : (
            // Locations view
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Locations for {selectedAccount.name}
                </h3>
              </div>

              {locationError && (
                <Alert className="bg-red-50 border-red-200 text-red-800">
                  <h4 className="font-medium">Error Loading Locations</h4>
                  <p className="text-sm mt-1">{locationError}</p>
                </Alert>
              )}

              {loadingLocations ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        {locationTable.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <TableHead key={header.id}>
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {locationTable.getRowModel().rows?.length ? (
                          locationTable.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() && "selected"}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={locationColumns.length} className="h-24 text-center">
                              No locations found for this account.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                      Showing {locationTable.getRowModel().rows.length} location(s)
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => locationTable.previousPage()}
                        disabled={!locationTable.getCanPreviousPage()}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => locationTable.nextPage()}
                        disabled={!locationTable.getCanNextPage()}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-sm mt-6">
                <h4 className="font-medium mb-1">Available Location Data:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Business name and contact information</li>
                  <li>Physical address and service areas</li>
                  <li>Business categories and attributes</li>
                  <li>Operating hours and special hours</li>
                  <li>Photos and media</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 