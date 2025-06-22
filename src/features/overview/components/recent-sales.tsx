'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useEffect, useState } from 'react';

export function RecentSales() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    async function fetchClients() {
      const res = await fetch('/api/all-users');
      const data = await res.json();
      // Filter for CLIENT role and sort by createdAt desc
      const clients = (data.data || [])
        .filter((u: any) => u.role === 'CLIENT')
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5); // Show only the 5 most recent clients
      setClients(clients);
    }
    fetchClients();
  }, []);

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Clients</CardTitle>
        <CardDescription>New clients who joined recently.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {clients.map((client, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                {/* Optionally use a generated avatar or fallback */}
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.name || client.email)}`}
                  alt='Avatar'
                />
                <AvatarFallback>
                  {(client.name || client.email || '')
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>
                  {client.name || 'No Name'}
                </p>
                <p className='text-muted-foreground text-sm'>{client.email}</p>
                <p className='text-muted-foreground text-xs'>
                  Joined {new Date(client.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
