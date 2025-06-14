'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { TileLayer, useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';

// Lazy load leaflet map to avoid SSR issues
const DynamicMap = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

type Manager = {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: string;
};

type Office = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  managers: Manager[];
};

export default function AssignManagerToOffice() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [latlng, setLatlng] = useState<[number, number]>([12.9716, 77.5946]);
  const [manualLat, setManualLat] = useState(latlng[0].toString());
  const [manualLng, setManualLng] = useState(latlng[1].toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load managers
      const managersRes = await fetch('/api/users?role=MANAGER');
      if (managersRes.ok) {
        const managersData = await managersRes.json();
        setManagers(managersData);
      }

      // Load offices
      const officesRes = await fetch('/api/offices');
      if (officesRes.ok) {
        const officesData = await officesRes.json();
        setOffices(officesData);
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
    }
  };

  const handleCreateOffice = async () => {
    if (!officeName.trim()) {
      return toast.error('Please enter office name');
    }

    setIsSubmitting(true);
    try {
      const [latitude, longitude] = latlng;
      const res = await fetch('/api/offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: officeName.trim(),
          latitude,
          longitude
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        return toast.error(errorData.error || 'Failed to create office');
      }

      toast.success('Office created successfully!');
      setOfficeName('');
      setLatlng([12.9716, 77.5946]);
      setManualLat('12.9716');
      setManualLng('77.5946');

      // Reload offices
      await loadData();
    } catch (error) {
      toast.error('An error occurred while creating office');
      console.error('Error creating office:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignManager = async () => {
    if (!selectedManager || !selectedOffice) {
      return toast.error('Please select both manager and office');
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/managers/assign-office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: selectedManager,
          officeId: selectedOffice
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        return toast.error(errorData.error || 'Failed to assign manager');
      }

      toast.success('Manager assigned to office successfully!');
      setSelectedManager('');
      setSelectedOffice('');

      // Reload data to show updated assignments
      await loadData();
    } catch (error) {
      toast.error('An error occurred while assigning manager');
      console.error('Error assigning manager:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualLocationUpdate = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      setLatlng([lat, lng]);
    } else {
      toast.error('Please enter valid coordinates');
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatlng([latitude, longitude]);
        setManualLat(latitude.toString());
        setManualLng(longitude.toString());
      },
      (error) => {
        toast.error('Failed to get your location: ' + error.message);
      }
    );
  };

  const getAvailableManagers = () => {
    return managers.filter(
      (manager) =>
        !offices.some((office) =>
          office.managers.some((m) => m.clerkId === manager.clerkId)
        )
    );
  };

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Office Management</h1>
      </div>
      <Separator />

      <Tabs defaultValue='create' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='create'>Create Office</TabsTrigger>
          <TabsTrigger value='assign'>Assign Manager</TabsTrigger>
        </TabsList>

        <TabsContent value='create' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Create New Office</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='officeName'>Office Name</Label>
                <Input
                  id='officeName'
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  placeholder='Enter office name'
                />
              </div>

              <div className='space-y-2'>
                <Label>Office Location</Label>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='latitude'>Latitude</Label>
                    <Input
                      id='latitude'
                      type='number'
                      step='any'
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder='Enter latitude'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='longitude'>Longitude</Label>
                    <Input
                      id='longitude'
                      type='number'
                      step='any'
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      placeholder='Enter longitude'
                    />
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={handleManualLocationUpdate}
                  >
                    Update Map Location
                  </Button>
                  <Button variant='outline' onClick={handleCurrentLocation}>
                    Use Current Location
                  </Button>
                </div>
              </div>

              <div className='h-[400px] overflow-hidden rounded-lg border'>
                <DynamicMap
                  center={latlng}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                  <DraggableMarker latlng={latlng} setLatlng={setLatlng} />
                </DynamicMap>
              </div>

              <Button
                onClick={handleCreateOffice}
                disabled={isSubmitting}
                className='w-full'
              >
                {isSubmitting ? 'Creating...' : 'Create Office'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='assign' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Assign Manager to Office</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label>Select Manager</Label>
                <Select
                  value={selectedManager}
                  onValueChange={setSelectedManager}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a manager' />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableManagers().map((manager) => (
                      <SelectItem key={manager.clerkId} value={manager.clerkId}>
                        {manager.name} ({manager.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getAvailableManagers().length === 0 && (
                  <p className='text-muted-foreground text-sm'>
                    All managers are already assigned to offices
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>Select Office</Label>
                <Select
                  value={selectedOffice}
                  onValueChange={setSelectedOffice}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select an office' />
                  </SelectTrigger>
                  <SelectContent>
                    {offices.map((office) => (
                      <SelectItem key={office.id} value={office.id}>
                        {office.name} ({office.managers.length} managers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAssignManager}
                disabled={isSubmitting || !selectedManager || !selectedOffice}
                className='w-full'
              >
                {isSubmitting ? 'Assigning...' : 'Assign Manager'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Current Office Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className='h-[400px]'>
            <div className='grid gap-4'>
              {offices.map((office) => (
                <Card key={office.id}>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h4 className='font-semibold'>{office.name}</h4>
                        <p className='text-muted-foreground text-sm'>
                          Location: {office.latitude.toFixed(6)},{' '}
                          {office.longitude.toFixed(6)}
                        </p>
                      </div>
                      <Badge variant='secondary'>
                        {office.managers.length} Managers
                      </Badge>
                    </div>
                    <Separator className='my-4' />
                    <div>
                      <p className='mb-2 text-sm font-medium'>
                        Assigned Managers:
                      </p>
                      {office.managers.length > 0 ? (
                        <ul className='space-y-1'>
                          {office.managers.map((manager) => (
                            <li
                              key={manager.id}
                              className='text-muted-foreground text-sm'
                            >
                              {manager.name} ({manager.email})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className='text-muted-foreground text-sm'>
                          No managers assigned
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function DraggableMarker({
  latlng,
  setLatlng
}: {
  latlng: [number, number];
  setLatlng: (pos: [number, number]) => void;
}) {
  const map = useMapEvents({
    click(e) {
      setLatlng([e.latlng.lat, e.latlng.lng]);
    }
  });

  return null;
}
