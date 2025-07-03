'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

interface Camera {
  id: string;
  type: string;
  title: string;
  location: string;
  size?: string;
  number?: string;
  ipAddress: string;
  label?: string;
  project?: {
    name: string;
    location: string;
  };
}

export default function CamerasDashboardPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  useEffect(() => {
    fetchAllCameras();
  }, []);

  const fetchAllCameras = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cameras');
      if (!res.ok) throw new Error('Failed to fetch cameras');
      const data = await res.json();
      setCameras(data);
    } catch (error) {
      setCameras([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto py-8'>
      <h1 className='mb-8 text-3xl font-bold'>All Assigned Cameras</h1>
      {loading ? (
        <div className='flex h-64 items-center justify-center'>
          <span className='text-lg'>Loading cameras...</span>
        </div>
      ) : cameras.length === 0 ? (
        <div className='text-muted-foreground text-center'>
          No cameras assigned.
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {cameras.map((camera) => (
            <Dialog key={camera.id}>
              <DialogTrigger asChild>
                <Card
                  className='cursor-pointer border border-gray-200 shadow-lg transition-transform hover:scale-[1.03]'
                  onClick={() => setSelectedCamera(camera)}
                >
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      {camera.label ? (
                        <Badge variant='secondary'>{camera.label}</Badge>
                      ) : null}
                      <span>{camera.title}</span>
                    </CardTitle>
                    <div className='mt-1 text-xs text-gray-500'>
                      {camera.project?.name}{' '}
                      {camera.project?.location
                        ? `- ${camera.project.location}`
                        : ''}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='mb-2 flex aspect-video items-center justify-center overflow-hidden rounded-md bg-black'>
                      <img
                        src={camera.ipAddress}
                        alt={camera.label || camera.title}
                        className='h-full w-full object-contain'
                        onError={(e) =>
                          (e.currentTarget.src = '/assets/camera-offline.png')
                        }
                      />
                    </div>
                    <div className='text-xs text-gray-600'>
                      <span className='font-semibold'>Location:</span>{' '}
                      {camera.location}
                    </div>
                    {camera.size && (
                      <div className='text-xs text-gray-600'>
                        <span className='font-semibold'>Size:</span>{' '}
                        {camera.size}
                      </div>
                    )}
                    {camera.number && (
                      <div className='text-xs text-gray-600'>
                        <span className='font-semibold'>Number:</span>{' '}
                        {camera.number}
                      </div>
                    )}
                    <div className='mt-2 text-xs text-gray-600'>
                      <span className='font-semibold'>IP:</span>{' '}
                      {camera.ipAddress}
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>
                    {selectedCamera?.label ? (
                      <Badge variant='secondary'>{selectedCamera.label}</Badge>
                    ) : null}
                    <span className='ml-2'>{selectedCamera?.title}</span>
                  </DialogTitle>
                </DialogHeader>
                <div className='mb-2 flex aspect-video items-center justify-center overflow-hidden rounded-md bg-black'>
                  <img
                    src={selectedCamera?.ipAddress}
                    alt={selectedCamera?.label || selectedCamera?.title}
                    className='h-full w-full object-contain'
                    onError={(e) =>
                      (e.currentTarget.src = '/assets/camera-offline.png')
                    }
                  />
                </div>
                <div className='text-xs text-gray-600'>
                  <span className='font-semibold'>Location:</span>{' '}
                  {selectedCamera?.location}
                </div>
                {selectedCamera?.size && (
                  <div className='text-xs text-gray-600'>
                    <span className='font-semibold'>Size:</span>{' '}
                    {selectedCamera.size}
                  </div>
                )}
                {selectedCamera?.number && (
                  <div className='text-xs text-gray-600'>
                    <span className='font-semibold'>Number:</span>{' '}
                    {selectedCamera.number}
                  </div>
                )}
                <div className='mt-2 text-xs text-gray-600'>
                  <span className='font-semibold'>IP:</span>{' '}
                  {selectedCamera?.ipAddress}
                </div>
                <DialogClose asChild>
                  <button className='mt-4 rounded bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300'>
                    Close
                  </button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
