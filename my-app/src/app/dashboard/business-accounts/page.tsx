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
import { ArrowUpDown } from "lucide-react";

interface BusinessAccount {
  id: string;
  name: string;
  accountNumber: string | null;
  type: string;
  role: string;
  fullResource: string;
}

export default function BusinessAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Define table columns
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
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded text-xs ${
              type === 'LOCATION_GROUP' 
                ? 'bg-green-100 text-green-800' 
                : type === 'PERSONAL'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {getAccountTypeLabel(type)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
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
              onClick={() => handleViewDetails(account)}
            >
              View Details
            </Button>
          </div>
        )
      },
    },
  ];

  // Initialize the table
  const table = useReactTable({
    data: accounts,
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

  async function fetchBusinessAccounts() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/google/business-accounts');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch business accounts');
      }
      
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      } else {
        setError('No accounts found or unexpected response format');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error fetching accounts');
      console.error('Error fetching business accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleViewDetails(account: BusinessAccount) {
    alert(`View details for account: ${account.name}`);
    // In a real implementation, this would navigate to a details page
    // e.g., router.push(`/dashboard/business-accounts/${account.id}`);
  }

  useEffect(() => {
    fetchBusinessAccounts();
  }, []);

  function getAccountTypeLabel(type: string) {
    switch (type) {
      case 'PERSONAL':
        return 'Personal Account';
      case 'LOCATION_GROUP':
        return 'Business Account';
      case 'USER_GROUP':
        return 'User Group';
      default:
        return type;
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Google Business Accounts</CardTitle>
          <CardDescription>
            View and manage your connected Google Business accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Your Business Accounts</h3>
              <Button onClick={fetchBusinessAccounts} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh Accounts'}
              </Button>
            </div>

            {error && (
              <Alert className="bg-red-50 border-red-200 text-red-800">
                <h4 className="font-medium">Error Loading Accounts</h4>
                <p className="text-sm mt-1">{error}</p>
              </Alert>
            )}

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
            )}
            
            <div className="text-sm mt-6">
              <h4 className="font-medium mb-1">What you can do with business accounts:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>View and manage business locations</li>
                <li>Monitor business profile performance</li>
                <li>Respond to customer reviews</li>
                <li>Update business information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 