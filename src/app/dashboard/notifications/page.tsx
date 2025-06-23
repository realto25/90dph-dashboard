'use client';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react';

const roles = [
  { label: 'Guest', value: 'GUEST' },
  { label: 'Client', value: 'CLIENT' },
  { label: 'Manager', value: 'MANAGER' }
];

type Notification = {
  id: string;
  targetRole?: string | null;
  title?: string | null;
  message: string;
  createdAt: string;
};

export default function NotificationsPage() {
  const [role, setRole] = useState(roles[0].value);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setTableLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, title, targetRole: role })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage('');
        setTitle('');
      } else {
        setError(data.error || 'Failed to send notification');
      }
    } catch (e) {
      setError('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (n: Notification) => {
    setEditId(n.id);
    setEditMessage(n.message);
    setEditTitle(n.title || '');
  };

  const handleEditSave = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, message: editMessage, title: editTitle })
    });
    setEditId(null);
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notification?')) return;
    await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
    fetchNotifications();
  };

  // Group notifications by role, title, and message, showing only the most recent per group
  const groupedNotifications = React.useMemo(() => {
    const map = new Map<string, Notification>();
    for (const n of notifications) {
      const key = `${n.targetRole || '-'}|${n.title || '-'}|${n.message}`;
      // Only keep the most recent notification for each group
      if (
        !map.has(key) ||
        new Date(n.createdAt) > new Date(map.get(key)!.createdAt)
      ) {
        map.set(key, n);
      }
    }
    return Array.from(map.values());
  }, [notifications]);

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center p-4'>
      <Card className='bg-background text-foreground border-border animate-fade-in mb-8 w-full max-w-lg border shadow-lg'>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
          <CardDescription>
            Notify users by role. The notification will appear in their app
            based on their role.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='mb-1 block font-medium' htmlFor='role'>
              Select Role
            </label>
            <select
              id='role'
              className='bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 transition focus:ring-2 focus:outline-none'
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='mb-1 block font-medium' htmlFor='title'>
              Title <span className='text-muted-foreground'>(optional)</span>
            </label>
            <Input
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Notification title'
            />
          </div>
          <div>
            <label className='mb-1 block font-medium' htmlFor='message'>
              Message
            </label>
            <Textarea
              id='message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Enter notification message...'
            />
          </div>
        </CardContent>
        <CardFooter className='flex flex-col items-stretch gap-2'>
          <Button
            onClick={handleSend}
            disabled={loading || !message}
            className='w-full'
          >
            {loading ? (
              <span className='animate-pulse'>Sending...</span>
            ) : (
              'Send Notification'
            )}
          </Button>
          {success && (
            <div className='animate-fade-in text-center text-green-600'>
              Notification sent!
            </div>
          )}
          {error && (
            <div className='animate-fade-in text-center text-red-600'>
              {error}
            </div>
          )}
        </CardFooter>
      </Card>
      <div className='w-full max-w-4xl'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableLoading ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : groupedNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center'>
                  No notifications sent yet.
                </TableCell>
              </TableRow>
            ) : (
              groupedNotifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>{n.targetRole || '-'}</TableCell>
                  <TableCell>
                    {editId === n.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className='h-8'
                      />
                    ) : (
                      n.title || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === n.id ? (
                      <Textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className='h-8 min-h-8'
                      />
                    ) : (
                      n.message
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(n.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className='flex justify-end gap-2'>
                    {editId === n.id ? (
                      <>
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() => handleEditSave(n.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => setEditId(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size='icon'
                          variant='ghost'
                          onClick={() => handleEdit(n)}
                          title='Edit'
                        >
                          <Icons.userPen className='h-4 w-4' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          onClick={() => handleDelete(n.id)}
                          title='Delete'
                        >
                          <Icons.trash className='h-4 w-4 text-red-500' />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Add fade-in animation
// In your global CSS (e.g., globals.css), add:
// @keyframes fade-in { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: none; } }
// .animate-fade-in { animation: fade-in 0.5s cubic-bezier(.4,0,.2,1) both; }
