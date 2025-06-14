'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SubmitLeaveRequest() {
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Please sign in to submit a leave request');
      return;
    }

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          ...formData
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit leave request');
      }

      toast.success('Leave request submitted successfully');
      router.push('/dashboard/leave-requests');
    } catch (error) {
      toast.error('Failed to submit leave request');
      console.error('Error submitting leave request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Submit Leave Request
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Leave Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startDate'>Start Date</Label>
                <Input
                  id='startDate'
                  type='date'
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='endDate'>End Date</Label>
                <Input
                  id='endDate'
                  type='date'
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  min={
                    formData.startDate || new Date().toISOString().split('T')[0]
                  }
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='reason'>Reason for Leave</Label>
              <Textarea
                id='reason'
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder='Please provide a reason for your leave request'
                rows={4}
              />
            </div>

            <Button type='submit' disabled={isSubmitting} className='w-full'>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
