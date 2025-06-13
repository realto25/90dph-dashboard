'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Plot {
  id: string;
  title: string;
  owner: {
    id: string;
    name: string;
  } | null;
  camera?: {
    ipAddress: string;
    label: string | null;
  } | null;
}

export default function AssignCameraDialog({ plotId }: { plotId: string }) {
  const [plot, setPlot] = useState<Plot | null>(null);
  const [ipAddress, setIpAddress] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPlot = async () => {
    try {
      const res = await fetch(`/api/plots/${plotId}`);
      const data = await res.json();
      setPlot(data);
      if (data.camera) {
        setIpAddress(data.camera.ipAddress);
        setLabel(data.camera.label || '');
      }
    } catch (error) {
      console.error('Error fetching plot:', error);
      toast.error('Failed to fetch plot details');
    }
  };

  const handleAssign = async () => {
    if (!ipAddress) {
      toast.error('IP Address is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/assign-camera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotId,
          ipAddress,
          label: label || null
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to assign camera');
      }

      toast.success('Camera assigned successfully!');
      fetchPlot(); // Refresh plot data
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign camera');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlot();
  }, [plotId]);

  if (!plot) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Camera className='h-4 w-4' />
          {plot.camera ? 'Update Camera' : 'Assign Camera'}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <div className='space-y-4'>
          <div>
            <h2 className='text-lg font-semibold'>Camera Assignment</h2>
            <p className='text-muted-foreground text-sm'>
              Assign camera to plot: {plot.title}
            </p>
            {plot.owner && (
              <p className='text-muted-foreground text-sm'>
                Owner: {plot.owner.name}
              </p>
            )}
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='ipAddress'>IP Address</Label>
              <Input
                id='ipAddress'
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder='e.g., 192.168.1.100'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='label'>Label (Optional)</Label>
              <Input
                id='label'
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder='e.g., Front Gate Camera'
              />
            </div>
          </div>

          <Button
            onClick={handleAssign}
            disabled={loading || !ipAddress}
            className='w-full'
          >
            {loading
              ? 'Assigning...'
              : plot.camera
                ? 'Update Camera'
                : 'Assign Camera'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
