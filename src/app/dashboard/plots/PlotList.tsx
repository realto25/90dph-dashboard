'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Edit,
  IndianRupee,
  MapPin,
  MoreVertical,
  Ruler,
  Search,
  Trash2,
  View
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useThemeConfig } from '@/components/active-theme';
// import AssignCameraDialog from '@/components/AssignCameraDialog';
import AssignLandDialog from '@/components/AssignLandDialog';
import LandLayoutEditor from '@/components/LandLayoutEditor';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Grid,
  RefreshCw,
  SlidersHorizontal,
  Table as TableIcon
} from 'lucide-react';
import EditPlotForm from './EditPlotForm';

interface Plot {
  id: string;
  title: string;
  dimension: string;
  price: number;
  priceLabel: string;
  status: 'AVAILABLE' | 'ADVANCE' | 'SOLD';
  imageUrls: string[];
  location: string;
  latitude: number;
  longitude: number;
  facing: string;
  amenities: string[];
  mapEmbedUrl: string;
  createdAt: string;
  ownerId: string;
}

interface PlotListProps {
  projectId: string;
}

const PlotList = ({ projectId }: PlotListProps) => {
  const { activeTheme } = useThemeConfig();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);
  const [landLayoutPlotId, setLandLayoutPlotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Plot['status'] | 'ALL'>(
    'ALL'
  );
  const [sortBy, setSortBy] = useState<'price' | 'title' | 'status'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchPlots = async () => {
    try {
      const res = await fetch(`/api/plots?projectId=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch plots');
      const data = await res.json();
      setPlots(data);
    } catch (err) {
      toast.error('Error fetching plots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, [projectId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plot?')) return;

    try {
      const res = await fetch(`/api/plots/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Plot deleted');
      fetchPlots();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getThemeBasedStyles = () => {
    const baseStyles = {
      card: 'group relative overflow-hidden transition-all hover:shadow-lg',
      cardHover: 'hover:shadow-lg',
      statusBadge: {
        AVAILABLE:
          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        ADVANCE:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        SOLD: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      },
      price: 'text-green-600 dark:text-green-400',
      actionButton: {
        edit: 'hover:bg-accent text-accent-foreground',
        view: 'hover:bg-accent text-accent-foreground',
        delete:
          'hover:bg-destructive/90 text-destructive-foreground border-destructive/50 hover:border-destructive'
      }
    };

    const themeStyles = {
      default: {
        card: baseStyles.card,
        cardHover: baseStyles.cardHover,
        statusBadge: baseStyles.statusBadge,
        price: baseStyles.price,
        actionButton: baseStyles.actionButton
      },
      blue: {
        card: `${baseStyles.card} border-blue-200 dark:border-blue-800`,
        cardHover: `${baseStyles.cardHover} hover:border-blue-300 dark:hover:border-blue-700`,
        statusBadge: {
          AVAILABLE:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          ADVANCE:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          SOLD: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        },
        price: 'text-blue-600 dark:text-blue-400',
        actionButton: {
          edit: 'hover:bg-blue-100 text-blue-800 dark:hover:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          view: 'hover:bg-blue-100 text-blue-800 dark:hover:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          delete:
            'hover:bg-red-100 text-red-800 dark:hover:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
        }
      },
      green: {
        card: `${baseStyles.card} border-green-200 dark:border-green-800`,
        cardHover: `${baseStyles.cardHover} hover:border-green-300 dark:hover:border-green-700`,
        statusBadge: {
          AVAILABLE:
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          ADVANCE:
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          SOLD: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        },
        price: 'text-green-600 dark:text-green-400',
        actionButton: {
          edit: 'hover:bg-green-100 text-green-800 dark:hover:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
          view: 'hover:bg-green-100 text-green-800 dark:hover:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
          delete:
            'hover:bg-red-100 text-red-800 dark:hover:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
        }
      },
      amber: {
        card: `${baseStyles.card} border-amber-200 dark:border-amber-800`,
        cardHover: `${baseStyles.cardHover} hover:border-amber-300 dark:hover:border-amber-700`,
        statusBadge: {
          AVAILABLE:
            'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
          ADVANCE:
            'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
          SOLD: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
        },
        price: 'text-amber-600 dark:text-amber-400',
        actionButton: {
          edit: 'hover:bg-amber-100 text-amber-800 dark:hover:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          view: 'hover:bg-amber-100 text-amber-800 dark:hover:bg-amber-900/20 dark:text-green-400 border-amber-200 dark:border-amber-800',
          delete:
            'hover:bg-red-100 text-red-800 dark:hover:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
        }
      }
    };

    return (
      themeStyles[activeTheme.split('-')[0] as keyof typeof themeStyles] ||
      themeStyles.default
    );
  };

  const styles = getThemeBasedStyles();

  const filteredAndSortedPlots = plots
    .filter((plot) => {
      const matchesSearch =
        plot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plot.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' || plot.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'price':
          return (a.price - b.price) * order;
        case 'title':
          return a.title.localeCompare(b.title) * order;
        case 'status':
          return a.status.localeCompare(b.status) * order;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className='space-y-6 p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-[200px]' />
            <Skeleton className='h-4 w-[300px]' />
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-10 w-[100px]' />
            <Skeleton className='h-10 w-[100px]' />
          </div>
        </div>
        <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {[...Array(8)].map((_, i) => (
            <Card key={i} className='overflow-hidden'>
              <Skeleton className='aspect-video w-full' />
              <CardContent className='space-y-3 p-4'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
                <Skeleton className='h-4 w-1/4' />
                <div className='flex gap-2'>
                  <Skeleton className='h-8 w-1/2' />
                  <Skeleton className='h-8 w-1/2' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 pt-0'>
      {/* Header Section */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Plots Management
          </h1>
          <p className='text-muted-foreground text-sm'>
            Manage and organize your real estate plots efficiently
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => fetchPlots()}
            className='gap-2'
          >
            <RefreshCw className='h-4 w-4' />
            Refresh
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <SlidersHorizontal className='h-4 w-4' />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter & Sort Plots</SheetTitle>
                <SheetDescription>
                  Customize how you view and organize your plots
                </SheetDescription>
              </SheetHeader>
              <div className='mt-6 space-y-6'>
                <div className='space-y-2'>
                  <Label>Status Filter</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(value as Plot['status'] | 'ALL')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ALL'>All Status</SelectItem>
                      <SelectItem value='AVAILABLE'>Available</SelectItem>
                      <SelectItem value='ADVANCE'>Advance</SelectItem>
                      <SelectItem value='SOLD'>Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Sort By</Label>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as typeof sortBy)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='title'>Title</SelectItem>
                      <SelectItem value='price'>Price</SelectItem>
                      <SelectItem value='status'>Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Sort Order</Label>
                  <Select
                    value={sortOrder}
                    onValueChange={(value) =>
                      setSortOrder(value as typeof sortOrder)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='asc'>Ascending</SelectItem>
                      <SelectItem value='desc'>Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() =>
                    setViewMode(viewMode === 'grid' ? 'table' : 'grid')
                  }
                  className='h-9 w-9'
                >
                  {viewMode === 'grid' ? (
                    <TableIcon className='h-4 w-4' />
                  ) : (
                    <Grid className='h-4 w-4' />
                  )}
                  <span className='sr-only'>
                    Switch to {viewMode === 'grid' ? 'Table' : 'Grid'} View
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Switch to {viewMode === 'grid' ? 'Table' : 'Grid'} View
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Search and Stats */}
      <div className='mt-6 mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='relative flex-1 md:max-w-sm'>
          <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
          <Input
            placeholder='Search plots by title or location...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-8'
          />
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='px-3 py-2 text-sm'>
              {filteredAndSortedPlots.length} plots
            </Badge>
            <Separator orientation='vertical' className='h-6' />
            <Badge variant='outline' className='px-3 py-2 text-sm'>
              {plots.filter((p) => p.status === 'AVAILABLE').length} available
            </Badge>
            <Badge variant='outline' className='px-3 py-2 text-sm'>
              {plots.filter((p) => p.status === 'SOLD').length} sold
            </Badge>
          </div>
        </div>
      </div>

      <Separator className='my-6' />

      {/* Main Content */}
      {viewMode === 'grid' ? (
        <ScrollArea className='h-[calc(100vh-250px)] rounded-md border'>
          <div className='grid gap-6 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {filteredAndSortedPlots.map((plot) => (
              <Card
                key={plot.id}
                className={cn(
                  styles.card,
                  styles.cardHover,
                  'group relative overflow-hidden rounded-lg shadow-md transition-all duration-200'
                )}
              >
                <div className='relative'>
                  {plot.imageUrls?.[0] ? (
                    <div className='aspect-[16/9] w-full overflow-hidden'>
                      <img
                        src={plot.imageUrls[0]}
                        alt={plot.title}
                        className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  ) : (
                    <div className='bg-muted flex aspect-[16/9] w-full items-center justify-center'>
                      <BarChart3 className='text-muted-foreground/50 h-16 w-16' />
                    </div>
                  )}

                  <div className='absolute top-3 right-3 flex gap-2'>
                    <Badge className={styles.statusBadge[plot.status]}>
                      {plot.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className='flex flex-col gap-2 p-4'>
                  <CardTitle className='line-clamp-1 text-xl font-semibold'>
                    {plot.title}
                  </CardTitle>

                  <div className='text-muted-foreground flex items-center text-sm'>
                    <MapPin className='mr-1 h-4 w-4 shrink-0' />
                    <span className='line-clamp-1'>{plot.location}</span>
                  </div>

                  <div
                    className={cn(
                      'flex items-center text-lg font-bold',
                      styles.price
                    )}
                  >
                    <IndianRupee className='mr-1 h-4 w-4 shrink-0' />
                    {plot.price.toLocaleString()}
                  </div>

                  <div className='text-muted-foreground flex items-center text-sm'>
                    <Ruler className='mr-1 h-4 w-4 shrink-0' />
                    {plot.dimension}
                  </div>

                  <div className='mt-4'>
                    <AssignLandDialog plotId={plot.id} />
                    {/* <AssignCameraDialog plotId={plot.id} /> */}
                  </div>

                  {/* Action Buttons */}
                  <div className='mt-4 flex items-center justify-between gap-2 border-t pt-2'>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className={styles.actionButton.edit}
                            size='sm'
                            variant='outline'
                            onClick={() => setEditingPlotId(plot.id)}
                          >
                            <Edit className='mr-1 h-3 w-3' />
                            Edit
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Plot</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className={styles.actionButton.view}
                            size='sm'
                            variant='outline'
                            onClick={() => setLandLayoutPlotId(plot.id)}
                          >
                            <View className='mr-1 h-3 w-3' />
                            Lands
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add Lands</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className={styles.actionButton.delete}
                            size='sm'
                            variant='outline'
                            onClick={() => handleDelete(plot.id)}
                          >
                            <Trash2 className='mr-1 h-3 w-3' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Plot</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Card className={styles.card}>
          <ScrollArea className='h-[600px]'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plot</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Dimension</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedPlots.map((plot) => (
                  <TableRow key={plot.id}>
                    <TableCell className='font-medium'>{plot.title}</TableCell>
                    <TableCell>{plot.location}</TableCell>
                    <TableCell>{plot.dimension}</TableCell>
                    <TableCell>
                      <div className={cn('flex items-center', styles.price)}>
                        <IndianRupee className='mr-1 h-4 w-4' />
                        {plot.price.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={styles.statusBadge[plot.status]}>
                        {plot.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => setEditingPlotId(plot.id)}
                            className={styles.actionButton.edit}
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setLandLayoutPlotId(plot.id)}
                            className={styles.actionButton.view}
                          >
                            <View className='mr-2 h-4 w-4' />
                            View Layout
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={styles.actionButton.delete}
                            onClick={() => handleDelete(plot.id)}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      {/* Dialogs */}
      {editingPlotId && !landLayoutPlotId && (
        <EditPlotForm
          plotId={editingPlotId}
          isOpen={true}
          onClose={() => setEditingPlotId(null)}
          onSuccess={() => {
            fetchPlots();
            setEditingPlotId(null);
          }}
        />
      )}

      {landLayoutPlotId && !editingPlotId && (
        <Drawer open={true} onOpenChange={() => setLandLayoutPlotId(null)}>
          <DrawerContent className='bg-background fixed inset-0 z-50 flex h-screen w-screen flex-col p-0'>
            <DrawerHeader className='shrink-0 border-b p-6 pb-4'>
              <DrawerTitle className='text-xl font-semibold'>
                Manage Lands for Plot
              </DrawerTitle>
            </DrawerHeader>
            <div className='min-h-0 flex-1 overflow-y-auto p-4'>
              <LandLayoutEditor plotId={landLayoutPlotId} />
            </div>
            <DrawerFooter className='shrink-0'>
              <DrawerClose asChild>
                <Button variant='outline'>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default PlotList;
