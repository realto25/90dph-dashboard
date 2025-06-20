'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { Loader2, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  clerkId: string;
}

export default function AdminsPage() {
  const { userRole, isLoading } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: '',
    email: '',
    role: UserRole.ADMIN,
    phone: '',
    clerkId: ''
  });

  // Fetch admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admins');
      const data = await response.json();
      if (data.success) setAdmins(data.data);
      else toast.error(data.error || 'Failed to fetch admins');
    } catch {
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'SUPERADMIN') fetchAdmins();
  }, [userRole]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingAdmin ? 'PUT' : 'POST';
      const url = '/api/admins';
      const body = editingAdmin
        ? { ...formData, id: editingAdmin.id }
        : { ...formData, clerkId: formData.clerkId || `temp_${Date.now()}` };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(
          `Admin ${editingAdmin ? 'updated' : 'created'} successfully`
        );
        setIsDialogOpen(false);
        fetchAdmins();
        resetForm();
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      const response = await fetch(`/api/admins?id=${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Admin deleted successfully');
        fetchAdmins();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete admin');
      }
    } catch {
      toast.error('An error occurred while deleting the admin');
    }
  };

  // Handle edit
  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      phone: admin.phone || '',
      clerkId: admin.clerkId
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: UserRole.ADMIN,
      phone: '',
      clerkId: ''
    });
    setEditingAdmin(null);
  };

  return (
    <div className='container mx-auto py-10'>
      {!isLoading && userRole !== 'SUPERADMIN' ? (
        <div className='flex h-full items-center justify-center'>
          <h2 className='text-xl font-semibold text-red-500'>
            You do not have access to manage admins.
          </h2>
        </div>
      ) : (
        <>
          <div className='mb-6 flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Admin Management</h1>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <UserPlus className='mr-2 h-4 w-4' />
              Add Admin
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAdmin ? 'Edit Admin' : 'Add Admin'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <Input
                  placeholder='Name'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
                <Input
                  placeholder='Email'
                  type='email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
                <Input
                  placeholder='Phone'
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, phone: e.target.value }))
                  }
                />
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData((f) => ({ ...f, role: value as UserRole }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    <SelectItem value={UserRole.SUPERADMIN}>
                      Super Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button type='submit' className='w-full'>
                  {editingAdmin ? 'Update' : 'Create'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <div className='rounded-md border'>
            {loading ? (
              <div className='flex justify-center py-10'>
                <Loader2 className='animate-spin' />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className='text-muted-foreground text-center'
                      >
                        No admins found
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>{admin.name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.phone}</TableCell>
                        <TableCell>{admin.role}</TableCell>
                        <TableCell>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEdit(admin)}
                            className='mr-2'
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleDelete(admin.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
