'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, FileText, MapPin, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { UploadDropzone } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  location: z.string().min(2, { message: 'Location is required.' }),
  imageUrl: z.string().url({ message: 'Please upload a project image.' }),
  description: z
    .string()
    .min(5, { message: 'Description must be at least 5 characters.' })
});

type ProjectFormValues = z.infer<typeof formSchema>;

export default function AddProjectForm({
  onSuccess
}: {
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      imageUrl: '',
      description: ''
    }
  });

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

    const themeStyles: Record<string, typeof baseStyles> = {
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

  const handleImageUpload = async (files: { url: string }[]) => {
    if (files && files.length > 0) {
      setUploadedImageUrl(files[0].url);
      form.setValue('imageUrl', files[0].url);
      toast.success('Image uploaded successfully!');
    }
  };

  const onSubmit = async (values: ProjectFormValues) => {
    if (!uploadedImageUrl) {
      toast.error('Please upload a project image');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          imageUrl: uploadedImageUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      toast.success('Project created successfully!');
      form.reset();
      setUploadedImageUrl('');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn(styles.card, 'mb-8 transition-colors duration-200')}>
      <CardHeader
        className={cn(styles.header, 'transition-colors duration-200')}
      >
        <CardTitle className='flex items-center gap-2 text-xl font-semibold'>
          <Building2 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          Add New Project
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground flex items-center gap-2'>
                      <Building2 className='text-muted-foreground h-4 w-4' />
                      Project Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Chennai Project'
                        {...field}
                        className={cn(
                          styles.input,
                          'transition-colors duration-200'
                        )}
                      />
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
                    <FormLabel className='text-foreground flex items-center gap-2'>
                      <MapPin className='text-muted-foreground h-4 w-4' />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Chennai, TN'
                        {...field}
                        className={cn(
                          styles.input,
                          'transition-colors duration-200'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='imageUrl'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel className='text-foreground flex items-center gap-2'>
                      <FileText className='text-muted-foreground h-4 w-4' />
                      Project Image
                    </FormLabel>
                    <FormControl>
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
                          <div className='bg-muted relative aspect-video w-full overflow-hidden rounded-lg border'>
                            <img
                              src={uploadedImageUrl}
                              alt='Project preview'
                              className='object-cover'
                            />
                          </div>
                        )}
                      </div>
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
                    <FormLabel className='text-foreground flex items-center gap-2'>
                      <FileText className='text-muted-foreground h-4 w-4' />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter project description...'
                        {...field}
                        className={cn(
                          styles.input,
                          'min-h-[100px] transition-colors duration-200'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type='submit'
              disabled={loading}
              className={cn(
                styles.button.primary,
                'w-full gap-2 transition-colors duration-200'
              )}
            >
              {loading ? (
                <>
                  <RefreshCw className='h-4 w-4 animate-spin' />
                  Creating Project...
                </>
              ) : (
                <>
                  <Building2 className='h-4 w-4' />
                  Create Project
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
