/* eslint-disable */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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
import axios from 'axios';
import { CheckCircle2, Clock, QrCode, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Manager {
  id: string;
  name: string;
  email: string;
  clerkId: string;
}

interface VisitRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  qrCode?: string;
  plotId: string;
  plot?: {
    id: string;
    title: string;
    location?: string;
    project?: {
      id: string;
      name: string;
    };
  };
  assignedManager?: Manager;
  createdAt: string;
  rejectionReason?: string | null;
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
  APPROVED: { color: 'bg-green-500', icon: CheckCircle2, label: 'Approved' },
  REJECTED: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' }
};

export default function VisitRequestsPage() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchManagers();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axios.get('/api/users?role=MANAGER');
      setManagers(response.data);
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error('Failed to fetch managers');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/visit-requests');

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid visit requests response: Expected an array');
      }

      setRequests(response.data);
    } catch (error: any) {
      console.error('Error fetching data:', error.message || error);
      setError(error.message || 'Failed to fetch data');
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const response = await axios.patch(`/api/visit-requests`, {
        id: requestId,
        status: 'APPROVED'
      });
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? response.data : req))
      );
      toast.success('Visit request approved successfully');
    } catch (error: any) {
      console.error('Error approving request:', error.message || error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const response = await axios.patch(`/api/visit-requests`, {
        id: requestId,
        status: 'REJECTED'
      });
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? response.data : req))
      );
      toast.success('Visit request rejected successfully');
    } catch (error: any) {
      console.error('Error rejecting request:', error.message || error);
      toast.error('Failed to reject request');
    }
  };

  const handleAssignManager = async (requestId: string, managerId: string) => {
    try {
      const response = await axios.patch(`/api/visit-requests`, {
        id: requestId,
        managerId
      });
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? response.data : req))
      );
      toast.success('Manager assigned successfully');
    } catch (error: any) {
      console.error('Error assigning manager:', error.message || error);
      toast.error('Failed to assign manager');
    }
  };

  if (loading) {
    return <div className='p-6 text-center'>Loading...</div>;
  }

  return (
    <div className='space-y-6 p-6'>
      {error && <div className='text-center text-red-500'>{error}</div>}
      <Card>
        <CardHeader>
          <CardTitle>Visit Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className='text-center text-gray-500'>
              No visit requests found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Plot</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => {
                  const statusKey =
                    req.status in statusConfig
                      ? (req.status as keyof typeof statusConfig)
                      : 'PENDING';
                  const StatusIcon = statusConfig[statusKey].icon;

                  return (
                    <TableRow key={req.id}>
                      <TableCell className='font-medium'>{req.name}</TableCell>
                      <TableCell>
                        {req.plot?.title || `Plot ${req.plotId}`}
                        {req.plot?.project?.name && (
                          <span className='ml-2 text-sm text-gray-500'>
                            ({req.plot.project.name})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(req.date).toLocaleDateString()} {req.time}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className={`${statusConfig[statusKey].color} text-white`}
                        >
                          <StatusIcon className='mr-1 h-3 w-3' />
                          {statusConfig[statusKey].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={req.assignedManager?.id}
                          onValueChange={(value) =>
                            handleAssignManager(req.id, value)
                          }
                        >
                          <SelectTrigger className='w-[200px]'>
                            <SelectValue placeholder='Select manager' />
                          </SelectTrigger>
                          <SelectContent>
                            {managers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                {manager.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className='space-x-2'>
                        {req.status === 'PENDING' && (
                          <>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleApprove(req.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleReject(req.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {req.status === 'APPROVED' && req.qrCode && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => setSelectedQR(req.qrCode!)}
                              >
                                <QrCode className='mr-1 h-4 w-4' />
                                View QR
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>QR Code</DialogTitle>
                              </DialogHeader>
                              <div className='flex justify-center p-4'>
                                <img
                                  src={req.qrCode}
                                  alt='QR Code'
                                  className='h-48 w-48'
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {req.status === 'REJECTED' && (
                          <Badge variant='secondary'>
                            Rejected{' '}
                            {req.rejectionReason
                              ? `(${req.rejectionReason})`
                              : ''}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
