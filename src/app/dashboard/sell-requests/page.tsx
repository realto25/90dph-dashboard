'use client';

import { useAuth } from '@/lib/auth';
import { Building2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface SellRequest {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  plot: {
    title: string;
    dimension: string;
    price: number;
    location: string;
    imageUrls: string[];
  };
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function SellRequestsPage() {
  const { userId, userRole, isLoading } = useAuth();
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchSellRequests = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/sell-requests', window.location.origin);
      if (statusFilter) {
        url.searchParams.append('status', statusFilter);
      }
      if (userRole === 'CLIENT') {
        url.searchParams.append('role', 'CLIENT');
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch sell requests');
      const data = await res.json();
      setSellRequests(data);
    } catch (error) {
      console.error('Error fetching sell requests:', error);
      toast.error('Failed to fetch sell requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && !isLoading) {
      fetchSellRequests();
    }
  }, [userId, statusFilter, isLoading]);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
      approved: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
      rejected: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
      completed: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
    };

    return (
      <Badge
        variant='secondary'
        className={statusStyles[status as keyof typeof statusStyles]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Sell Requests</h1>
        <div className='flex items-center space-x-4'>
          <Select
            value={statusFilter || undefined}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Requests</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='approved'>Approved</SelectItem>
              <SelectItem value='rejected'>Rejected</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            size='sm'
            onClick={fetchSellRequests}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            Sell Requests List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plot Details</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-muted-foreground text-center'
                    >
                      No sell requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  sellRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className='space-y-1'>
                          <p className='font-medium'>{request.plot.title}</p>
                          <p className='text-muted-foreground text-sm'>
                            {request.plot.dimension} - {request.plot.location}
                          </p>
                          <p className='text-muted-foreground text-sm'>
                            ₹{request.plot.price.toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <p className='font-medium'>{request.user.name}</p>
                          <p className='text-muted-foreground text-sm'>
                            {request.user.email}
                          </p>
                          {request.user.phone && (
                            <p className='text-muted-foreground text-sm'>
                              {request.user.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='max-w-[300px] truncate'>
                        {request.reason}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
