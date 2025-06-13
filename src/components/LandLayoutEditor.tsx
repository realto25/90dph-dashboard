'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { UploadDropzone } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Edit,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Land {
  id?: string;
  number: string;
  size: string;
  price: number;
  status: 'AVAILABLE' | 'SOLD' | 'ADVANCE';
  imageUrl?: string;
  plotId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  number: string;
  size: string;
  price: string;
  status: Land['status'];
  imageUrl?: string;
}

export default function LandLayoutEditor({
  plotId = 'plot-1'
}: {
  plotId?: string;
}) {
  const [lands, setLands] = useState<Land[]>([]);
  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [formData, setFormData] = useState<FormData>({
    number: '',
    size: '',
    price: '',
    status: 'AVAILABLE',
    imageUrl: ''
  });
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLands = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lands?plotId=${plotId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Land[] = await response.json();
      setLands(data);
    } catch (error: any) {
      console.error('Error fetching lands:', error);
      setMessage({
        type: 'error',
        text: `Failed to fetch lands: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, [plotId]);

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async () => {
    if (!formData.number || !formData.size || !formData.price) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    const landData: Omit<Land, 'id' | 'createdAt' | 'updatedAt'> = {
      number: formData.number,
      size: formData.size,
      price: Number(formData.price),
      status: formData.status,
      imageUrl: formData.imageUrl,
      plotId
    };

    setLoading(true);
    try {
      const method = editingLand ? 'PATCH' : 'POST';
      const url = editingLand
        ? `/api/lands?id=${editingLand.id}`
        : '/api/lands';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(landData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      setMessage({
        type: 'success',
        text: `Land ${editingLand ? 'updated' : 'added'} successfully!`
      });
      resetForm();
      fetchLands();
    } catch (error: any) {
      console.error(
        `Error ${editingLand ? 'updating' : 'adding'} land:`,
        error
      );
      setMessage({
        type: 'error',
        text: `Failed to ${editingLand ? 'update' : 'add'} land: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (landId: string) => {
    if (!confirm('Are you sure you want to delete this land?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/lands?id=${landId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      setMessage({ type: 'success', text: 'Land deleted successfully!' });
      fetchLands();
    } catch (error: any) {
      console.error('Error deleting land:', error);
      setMessage({
        type: 'error',
        text: `Failed to delete land: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (land: Land) => {
    setEditingLand(land);
    setFormData({
      number: land.number,
      size: land.size,
      price: land.price.toString(),
      status: land.status,
      imageUrl: land.imageUrl
    });
  };

  const resetForm = () => {
    setFormData({
      number: '',
      size: '',
      price: '',
      status: 'AVAILABLE',
      imageUrl: ''
    });
    setEditingLand(null);
  };

  const handleImageUpload = async (files: { url: string }[]) => {
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, imageUrl: files[0].url }));
      toast.success('Image uploaded successfully!');
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='container mx-auto space-y-6 p-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Land Management
            </h1>
            <p className='text-muted-foreground'>
              Manage lands for plot {plotId}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid gap-6'>
          {/* Image Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Plot Image</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.imageUrl ? (
                <div className='relative aspect-video w-full max-w-2xl overflow-hidden rounded-lg'>
                  <Image
                    src={formData.imageUrl}
                    alt='Plot preview'
                    fill
                    className='object-cover'
                  />
                  <Button
                    variant='destructive'
                    size='icon'
                    className='absolute top-2 right-2'
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, imageUrl: '' }))
                    }
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ) : (
                <UploadDropzone
                  endpoint='imageUploader'
                  onClientUploadComplete={(res) => {
                    if (res) {
                      handleImageUpload(res);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Error uploading image: ${error.message}`);
                  }}
                  className='ut-label:text-lg ut-allowed-content:ut-uploading:text-red-300'
                />
              )}
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                {editingLand ? (
                  <>
                    <Edit className='h-5 w-5' />
                    Edit Land Details
                  </>
                ) : (
                  <>
                    <Plus className='h-5 w-5' />
                    Add New Land
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='number'>Land Number</Label>
                    <Input
                      id='number'
                      value={formData.number}
                      onChange={(e) =>
                        setFormData({ ...formData, number: e.target.value })
                      }
                      placeholder='e.g., L001'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='size'>Land Size</Label>
                    <Input
                      id='size'
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({ ...formData, size: e.target.value })
                      }
                      placeholder='e.g., 1000 sq ft'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='price'>Price (₹)</Label>
                    <Input
                      id='price'
                      type='number'
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder='e.g., 50000'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='status'>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as Land['status']
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='AVAILABLE'>Available</SelectItem>
                        <SelectItem value='ADVANCE'>Advance</SelectItem>
                        <SelectItem value='SOLD'>Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='flex gap-2 pt-4'>
                  <Button
                    onClick={handleSubmit}
                    className='flex-1'
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                      </>
                    ) : editingLand ? (
                      <>
                        <Save className='mr-2 h-4 w-4' />
                        Update
                      </>
                    ) : (
                      <>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Land
                      </>
                    )}
                  </Button>

                  {editingLand && (
                    <Button
                      variant='outline'
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lands Table */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>Land Records ({lands.length})</span>
                <div className='flex gap-2'>
                  <Badge variant='outline' className='text-green-600'>
                    {lands.filter((l) => l.status === 'AVAILABLE').length}{' '}
                    Available
                  </Badge>
                  <Badge variant='outline' className='text-red-600'>
                    {lands.filter((l) => l.status === 'SOLD').length} Sold
                  </Badge>
                  <Badge variant='outline' className='text-yellow-600'>
                    {lands.filter((l) => l.status === 'ADVANCE').length} Advance
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className='h-[400px]'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Land #</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lands.map((land) => (
                      <TableRow key={land.id}>
                        <TableCell className='font-medium'>
                          {land.number}
                        </TableCell>
                        <TableCell>{land.size}</TableCell>
                        <TableCell>₹{land.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant='outline'
                            className={cn(
                              land.status === 'AVAILABLE' &&
                                'border-green-200 bg-green-50 text-green-700',
                              land.status === 'SOLD' &&
                                'border-red-200 bg-red-50 text-red-700',
                              land.status === 'ADVANCE' &&
                                'border-yellow-200 bg-yellow-50 text-yellow-700'
                            )}
                          >
                            {land.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-2'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleEdit(land)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='text-red-600 hover:text-red-700'
                              onClick={() => handleDelete(land.id!)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {lands.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className='text-muted-foreground py-8 text-center'
                        >
                          No land records found. Add your first land using the
                          form above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toast Messages */}
      {message && (
        <div className='fixed right-4 bottom-4 z-50 max-w-md'>
          <Alert
            className={cn(
              'border-l-4 shadow-lg transition-all duration-300',
              message.type === 'error'
                ? 'border-l-red-500 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                : 'border-l-green-500 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
            )}
          >
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{message.text}</AlertDescription>
            <Button
              variant='ghost'
              size='icon'
              className='absolute top-2 right-2 h-6 w-6'
              onClick={() => setMessage(null)}
            >
              <X className='h-4 w-4' />
            </Button>
          </Alert>
        </div>
      )}
    </div>
  );
}
