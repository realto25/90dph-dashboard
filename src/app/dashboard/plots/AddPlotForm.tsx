// app/plots/AddPlotForm.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Plus, RefreshCw, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UploadDropzone } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  dimension: z.string().min(2, { message: 'Dimension is required.' }),
  totalArea: z.string().min(1, { message: 'Total area is required.' }),
  price: z.string().min(1, { message: 'Price is required.' }),
  priceLabel: z.string().min(2, { message: 'Price label is required.' }),
  status: z.enum(['AVAILABLE', 'ADVANCE', 'SOLD']),
  location: z.string().min(2, { message: 'Location is required.' }),
  latitude: z.string().min(1, { message: 'Latitude is required.' }),
  longitude: z.string().min(1, { message: 'Longitude is required.' }),
  facing: z.string().min(1, { message: 'Facing is required.' }),
  mapEmbedUrl: z.string().min(1, { message: 'Map embed URL is required.' }),
  qrUrl: z.string().optional(),
  description: z.string().min(5, { message: 'Description is required.' })
});

type PlotFormValues = z.infer<typeof formSchema>;

interface AddPlotFormProps {
  projectId: string;
  onSuccess?: () => void;
}

const AddPlotForm = ({ projectId, onSuccess }: AddPlotFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [amenities, setAmenities] = useState(['']);

  const form = useForm<PlotFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      dimension: '',
      totalArea: '',
      price: '',
      priceLabel: '',
      status: 'AVAILABLE',
      location: '',
      latitude: '',
      longitude: '',
      facing: '',
      mapEmbedUrl: '',
      qrUrl: '',
      description: ''
    }
  });

  const handleImageUpload = async (files: { url: string }[]) => {
    if (files && files.length > 0) {
      const newUrls = files.map((file) => file.url);
      setUploadedImageUrls((prev) => [...prev, ...newUrls]);
      toast.success(
        `Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`
      );
    }
  };

  const handleAmenityChange = (index: number, value: string) => {
    setAmenities((prev) => {
      const newAmenities = [...prev];
      newAmenities[index] = value;
      return newAmenities;
    });
  };

  const addAmenityField = () => {
    setAmenities((prev) => [...prev, '']);
  };

  const removeAmenityField = (index: number) => {
    if (amenities.length > 1) {
      setAmenities((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleMapEmbedUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Extract the src URL if a full iframe code is pasted
    const srcMatch = value.match(/src="([^"]+)"/);
    const mapUrl = srcMatch ? srcMatch[1] : value;
    form.setValue('mapEmbedUrl', mapUrl);
  };

  const onSubmit = async (values: PlotFormValues) => {
    if (uploadedImageUrls.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setLoading(true);

      // Validate latitude, longitude, and total area
      const latitude = parseFloat(values.latitude);
      const longitude = parseFloat(values.longitude);
      const totalArea = parseFloat(values.totalArea);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Please enter valid latitude and longitude values');
      }

      if (isNaN(totalArea) || totalArea <= 0) {
        throw new Error('Please enter a valid total area');
      }

      // Filter out empty amenities
      const filteredAmenities = amenities.filter(
        (amenity) => amenity.trim() !== ''
      );

      const response = await fetch('/api/plots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          imageUrls: uploadedImageUrls,
          amenities: filteredAmenities,
          price: parseInt(values.price),
          latitude,
          longitude,
          totalArea,
          projectId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          const errorMessage =
            data.details?.[0]?.message || data.error || 'Validation error';
          throw new Error(errorMessage);
        }
        throw new Error(data.error || 'Failed to create plot');
      }

      toast.success('Plot created successfully!');
      form.reset();
      setUploadedImageUrls([]);
      setAmenities(['']);
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (error) {
      console.error('Error creating plot:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create plot. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getThemeStyles = () => {
    const baseStyles = {
      card: 'border-0 shadow-lg',
      header: 'border-b',
      input: 'bg-background',
      button: {
        primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
        secondary:
          'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
      }
    };

    const themeStyles = {
      light: {
        ...baseStyles,
        card: 'border-0 shadow-lg bg-card',
        header: 'border-b bg-muted/50',
        input: 'bg-background'
      },
      dark: {
        ...baseStyles,
        card: 'border-0 shadow-lg bg-card dark:bg-gray-900',
        header: 'border-b bg-muted/50 dark:bg-gray-800/50',
        input: 'bg-background dark:bg-gray-800'
      }
    };

    return themeStyles[theme as keyof typeof themeStyles] || themeStyles.light;
  };

  const styles = getThemeStyles();

  return (
    <Card className={cn(styles.card, 'mb-8')}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Building2 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          Add New Plot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='dimension'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimension</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='e.g., 30x40' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='totalArea'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Area (M/KM)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        {...field}
                        placeholder='e.g. 2 KM'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input type='number' min='0' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='priceLabel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Label</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='e.g., Starting from 50L' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='AVAILABLE'>Available</SelectItem>
                        <SelectItem value='ADVANCE'>Advance</SelectItem>
                        <SelectItem value='SOLD'>Sold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='facing'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facing</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='e.g., North' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='latitude'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='e.g., 12.9716' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='longitude'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='e.g., 77.5946' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='mapEmbedUrl'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>Google Maps Embed URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={handleMapEmbedUrlChange}
                        placeholder='Paste Google Maps embed URL or iframe code here'
                      />
                    </FormControl>
                    <FormMessage />
                    {field.value && (
                      <div className='mt-2 h-[300px] w-full overflow-hidden rounded-md border'>
                        <iframe
                          src={field.value}
                          width='100%'
                          height='100%'
                          style={{ border: 0 }}
                          allowFullScreen
                          loading='lazy'
                          referrerPolicy='no-referrer-when-downgrade'
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='qrUrl'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>QR Code URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter QR code URL' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className='min-h-[100px]'
                        placeholder='Enter plot description...'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload Section */}
            <div className='space-y-4'>
              <FormLabel>Plot Images</FormLabel>
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
                config={{
                  mode: 'auto',
                  appendOnPaste: true
                }}
                onUploadBegin={() => {
                  toast.loading('Uploading images...');
                }}
                onUploadProgress={(progress) => {
                  if (progress === 100) {
                    toast.dismiss();
                  }
                }}
              />
              {uploadedImageUrls.length > 0 && (
                <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
                  {uploadedImageUrls.map((url, index) => (
                    <div
                      key={index}
                      className='relative aspect-square overflow-hidden rounded-lg border'
                    >
                      <img
                        src={url}
                        alt={`Plot image ${index + 1}`}
                        className='h-full w-full object-cover'
                      />
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        className='absolute top-2 right-2 h-6 w-6'
                        onClick={() => {
                          setUploadedImageUrls((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                          toast.success('Image removed');
                        }}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {uploadedImageUrls.length > 0 && (
                <div className='text-muted-foreground text-sm'>
                  {uploadedImageUrls.length} image
                  {uploadedImageUrls.length > 1 ? 's' : ''} uploaded
                </div>
              )}
            </div>

            {/* Amenities Section */}
            <div className='space-y-4'>
              <FormLabel>Amenities</FormLabel>
              <p className='text-sm text-gray-400'>
                Add amenity one by one in the field
              </p>
              {amenities.map((amenity, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <div className='flex-1'>
                    <Input
                      value={amenity}
                      onChange={(e) =>
                        handleAmenityChange(index, e.target.value)
                      }
                      placeholder='e.g., Park, Gym, Pool'
                    />
                  </div>
                  {amenities.length > 1 && (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={() => removeAmenityField(index)}
                      className='text-red-600 hover:text-red-700'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type='button'
                variant='outline'
                onClick={addAmenityField}
                className='w-full'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Another Amenity
              </Button>
            </div>

            <Button
              type='submit'
              disabled={loading}
              className={cn(styles.button.primary, 'w-full gap-2')}
            >
              {loading ? (
                <>
                  <RefreshCw className='h-4 w-4 animate-spin' />
                  Creating Plot...
                </>
              ) : (
                <>
                  <Building2 className='h-4 w-4' />
                  Create Plot
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddPlotForm;
