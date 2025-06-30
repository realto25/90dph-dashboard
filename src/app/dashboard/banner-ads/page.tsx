'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadDropzone } from '@/lib/uploadthing';
import { IconEye, IconEyeOff, IconTrash } from '@tabler/icons-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BannerAd {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function BannerAdsPage() {
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchBannerAds();
  }, []);

  const fetchBannerAds = async () => {
    try {
      const response = await fetch('/api/banner-ads');
      if (response.ok) {
        const data = await response.json();
        setBannerAds(data);
      }
    } catch (error) {
      console.error('Error fetching banner ads:', error);
      toast.error('Failed to fetch banner ads');
    }
  };

  const handleImageUpload = async (files: { url: string }[]) => {
    if (files && files.length > 0) {
      setUploadedImageUrl(files[0].url);
      setFormData((prev) => ({ ...prev, imageUrl: files[0].url }));
      toast.success('Image uploaded successfully!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.imageUrl) {
      toast.error('Title and image are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/banner-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Banner ad created successfully!');
        setFormData({ title: '', description: '', imageUrl: '' });
        setUploadedImageUrl('');
        fetchBannerAds();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create banner ad');
      }
    } catch (error) {
      console.error('Error creating banner ad:', error);
      toast.error('Failed to create banner ad');
    } finally {
      setLoading(false);
    }
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/banner-ads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        toast.success(
          `Banner ${currentStatus ? 'deactivated' : 'activated'} successfully!`
        );
        fetchBannerAds();
      } else {
        toast.error('Failed to update banner status');
      }
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner ad?')) {
      return;
    }

    try {
      const response = await fetch(`/api/banner-ads/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Banner ad deleted successfully!');
        fetchBannerAds();
      } else {
        toast.error('Failed to delete banner ad');
      }
    } catch (error) {
      console.error('Error deleting banner ad:', error);
      toast.error('Failed to delete banner ad');
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Banner Ads Management</h1>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Create Banner Ad Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Banner Ad</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <Label htmlFor='title'>Title *</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder='Enter banner title'
                  required
                />
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value
                    }))
                  }
                  placeholder='Enter banner description'
                  rows={3}
                />
              </div>

              <div>
                <Label>Banner Image *</Label>
                <div className='space-y-4'>
                  <UploadDropzone
                    endpoint='imageUploader'
                    onClientUploadComplete={(res) => {
                      if (res) {
                        handleImageUpload(res);
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`ERROR! ${error.message}`);
                    }}
                    className='ut-label:text-lg ut-allowed-content:ut-uploading:text-red-300'
                  />
                  {uploadedImageUrl && (
                    <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                      <Image
                        src={uploadedImageUrl}
                        alt='Banner preview'
                        fill
                        className='object-cover'
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button type='submit' disabled={loading} className='w-full'>
                {loading ? 'Creating...' : 'Create Banner Ad'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Banner Ads List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Banner Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {bannerAds.length === 0 ? (
                <p className='text-muted-foreground py-8 text-center'>
                  No banner ads found
                </p>
              ) : (
                bannerAds.map((banner) => (
                  <div
                    key={banner.id}
                    className='space-y-3 rounded-lg border p-4'
                  >
                    <div className='relative aspect-video w-full overflow-hidden rounded-lg'>
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className='object-cover'
                      />
                    </div>

                    <div>
                      <h3 className='font-semibold'>{banner.title}</h3>
                      {banner.description && (
                        <p className='text-muted-foreground mt-1 text-sm'>
                          {banner.description}
                        </p>
                      )}
                      <p className='text-muted-foreground mt-2 text-xs'>
                        Created:{' '}
                        {new Date(banner.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          toggleBannerStatus(banner.id, banner.isActive)
                        }
                      >
                        {banner.isActive ? (
                          <>
                            <IconEyeOff className='mr-1 h-4 w-4' />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <IconEye className='mr-1 h-4 w-4' />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => deleteBanner(banner.id)}
                      >
                        <IconTrash className='mr-1 h-4 w-4' />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
