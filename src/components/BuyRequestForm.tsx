'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

interface Land {
  id: string;
  number: string;
  size: string;
  price: number;
  plot: {
    title: string;
    location: string;
  };
}

interface BuyRequestFormProps {
  lands: Land[];
  userId: string;
  onSuccess?: () => void;
}

export function BuyRequestForm({
  lands,
  userId,
  onSuccess
}: BuyRequestFormProps) {
  const [selectedLand, setSelectedLand] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLand) {
      toast.error('Please select a land');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/buy-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landId: selectedLand,
          userId,
          message
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to submit request');
      }

      toast.success('Buy request submitted successfully');
      setSelectedLand(null);
      setMessage('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting buy request:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit request'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Buy Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='land'>Select Land</Label>
            <Select
              value={selectedLand || undefined}
              onValueChange={setSelectedLand}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a land' />
              </SelectTrigger>
              <SelectContent>
                {lands.map((land) => (
                  <SelectItem key={land.id} value={land.id}>
                    Land {land.number} - {land.size} sq ft
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='message'>Message</Label>
            <Textarea
              id='message'
              placeholder='Enter your message...'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <Button type='submit' disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
