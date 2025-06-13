'use client';

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
import { Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BuyRequest {
  id: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  land: {
    id: string;
    number: string;
    size: string;
    price: number;
    plot: {
      title: string;
      location: string;
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function BuyRequestsPage() {
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchBuyRequests = async () => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/buy-requests?status=${statusFilter}`
        : '/api/buy-requests';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch buy requests');
      const data = await res.json();
      setBuyRequests(data);
    } catch (error) {
      console.error('Error fetching buy requests:', error);
      toast.error('Failed to fetch buy requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyRequests();
  }, [statusFilter]);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/buy-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update request status');

      toast.success('Request status updated successfully');
      fetchBuyRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      PENDING: 'secondary',
      APPROVED: 'default',
      REJECTED: 'destructive',
      COMPLETED: 'outline'
    };

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Buy Requests</h1>
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
              <SelectItem value='PENDING'>Pending</SelectItem>
              <SelectItem value='APPROVED'>Approved</SelectItem>
              <SelectItem value='REJECTED'>Rejected</SelectItem>
              <SelectItem value='COMPLETED'>Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            size='sm'
            onClick={fetchBuyRequests}
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
          <CardTitle>Buy Requests List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : buyRequests.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>
              No buy requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Land Details</TableHead>
                  <TableHead>User Details</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buyRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='font-medium'>
                          {request.land.plot.title} - {request.land.number}
                        </div>
                        <div className='text-muted-foreground text-sm'>
                          Size: {request.land.size}
                        </div>
                        <div className='text-muted-foreground text-sm'>
                          Price: ₹{request.land.price.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='font-medium'>{request.user.name}</div>
                        <div className='text-muted-foreground text-sm'>
                          {request.user.email}
                        </div>
                        {request.user.phone && (
                          <div className='text-muted-foreground text-sm'>
                            {request.user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='max-w-xs truncate'>
                      {request.message}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.status === 'PENDING' && (
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleStatusChange(request.id, 'APPROVED')
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleStatusChange(request.id, 'REJECTED')
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {request.status === 'APPROVED' && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            handleStatusChange(request.id, 'COMPLETED')
                          }
                        >
                          Mark Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
