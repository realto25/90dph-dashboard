'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AssignLandDialog({ plotId }: { plotId: string }) {
  const [lands, setLands] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedLand, setSelectedLand] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLands = async () => {
    try {
      const res = await fetch(`/api/lands?plotId=${plotId}`);
      const data = await res.json();
      setLands(data.filter((l: any) => !l.ownerId));
    } catch (error) {
      console.error('Error fetching lands:', error);
      toast.error('Failed to fetch lands');
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/users?role=CLIENT');
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
      } else {
        console.error('Invalid clients data:', data);
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
      setClients([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedLand || !selectedClient) return;

    setLoading(true);
    try {
      const res = await fetch('/api/assign-land', {
        method: 'POST',
        body: JSON.stringify({
          landId: selectedLand,
          clientId: selectedClient
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        toast.success('Land assigned successfully!');
        setSelectedLand('');
        setSelectedClient('');
        fetchLands(); // refresh
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to assign land');
      }
    } catch (error) {
      console.error('Error assigning land:', error);
      toast.error('Failed to assign land');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
    fetchClients();
  }, [plotId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='default' disabled={loading}>
          {loading ? 'Assigning...' : 'Assign Land'}
        </Button>
      </DialogTrigger>
      <DialogContent className='space-y-4'>
        <div>
          <label>Available Lands</label>
          <Select value={selectedLand} onValueChange={setSelectedLand}>
            <SelectTrigger>
              <SelectValue placeholder='Select a land' />
            </SelectTrigger>
            <SelectContent>
              {lands.map((land) => (
                <SelectItem key={land.id} value={land.id}>
                  {land.number} - ₹{land.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label>Clients</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder='Select a client' />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(clients) &&
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAssign}
          disabled={!selectedLand || !selectedClient || loading}
        >
          {loading ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
