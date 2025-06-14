'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  manager: {
    name: string;
    email: string;
  };
};

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      const res = await fetch('/api/leave-requests');
      if (!res.ok) throw new Error('Failed to fetch leave requests');
      const data = await res.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error('Error loading leave requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      const res = await fetch('/api/leave-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (!res.ok) throw new Error('Failed to update leave request');

      toast.success('Leave request updated successfully');
      loadLeaveRequests();
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast.error('Failed to update leave request');
    }
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    const variants = {
      PENDING: 'secondary',
      APPROVED: 'default',
      REJECTED: 'destructive'
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Leave Requests</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className='h-[600px]'>
            <div className='space-y-4'>
              {isLoading ? (
                <p className='text-muted-foreground py-4 text-center'>
                  Loading leave requests...
                </p>
              ) : (
                leaveRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h4 className='font-semibold'>
                            {request.manager.name}
                          </h4>
                          <p className='text-muted-foreground text-sm'>
                            {request.manager.email}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      <Separator className='my-4' />

                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            Start Date:
                          </span>
                          <span>
                            {format(new Date(request.startDate), 'PPP')}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            End Date:
                          </span>
                          <span>
                            {format(new Date(request.endDate), 'PPP')}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>Reason:</span>
                          <span className='text-right'>{request.reason}</span>
                        </div>
                      </div>

                      {request.status === 'PENDING' && (
                        <div className='mt-4 flex justify-end gap-2'>
                          <Button
                            variant='outline'
                            onClick={() =>
                              handleStatusUpdate(request.id, 'APPROVED')
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant='destructive'
                            onClick={() =>
                              handleStatusUpdate(request.id, 'REJECTED')
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
              {leaveRequests.length === 0 && !isLoading && (
                <p className='text-muted-foreground py-4 text-center'>
                  No leave requests found
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
