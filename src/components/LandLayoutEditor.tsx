'use client';
import { useThemeConfig } from '@/components/active-theme';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Edit,
  LayoutGrid,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Land {
  id?: string;
  number: string;
  size: string;
  price: number;
  status: 'AVAILABLE' | 'SOLD' | 'ADVANCE';
  x: number;
  y: number;
  plotId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GridConfig {
  rows: number;
  cols: number;
  totalLands: number;
}

interface FormData {
  number: string;
  size: string;
  price: string;
  status: Land['status'];
}

export default function LandLayoutEditor({
  plotId = 'plot-1'
}: {
  plotId?: string;
}) {
  const [lands, setLands] = useState<Land[]>([]);
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    rows: 5,
    cols: 10,
    totalLands: 50
  });
  const [selectedCell, setSelectedCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [formData, setFormData] = useState<FormData>({
    number: '',
    size: '',
    price: '',
    status: 'AVAILABLE'
  });
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
    land: Land;
  } | null>(null);
  const [showGridConfig, setShowGridConfig] = useState(false);
  const [tempGridConfig, setTempGridConfig] = useState<GridConfig>({
    rows: 5,
    cols: 10,
    totalLands: 50
  });
  const { activeTheme } = useThemeConfig();
  const [zoom, setZoom] = useState(1);
  const [showLegend, setShowLegend] = useState(true);
  const [gridSize, setGridSize] = useState({ width: 800, height: 400 });

  // Load lands from database
  useEffect(() => {
    loadLands();
  }, [plotId]);

  const loadLands = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lands?plotId=${plotId}`);
      if (response.ok) {
        const data = await response.json();
        setLands(data);
      } else {
        setMessage({ type: 'error', text: 'Failed to load lands' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading lands' });
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (x: number, y: number) => {
    const existingLand = lands.find((l) => l.x === x && l.y === y);
    if (existingLand) {
      setEditingLand(existingLand);
      setFormData({
        number: existingLand.number,
        size: existingLand.size,
        price: existingLand.price.toString(),
        status: existingLand.status as Land['status']
      });
    } else {
      setEditingLand(null);
      setFormData({
        number: `L${String(x * gridConfig.cols + y + 1).padStart(3, '0')}`,
        size: '',
        price: '',
        status: 'AVAILABLE'
      });
    }
    setSelectedCell({ x, y });
  };

  const handleSubmit = async () => {
    if (
      !selectedCell ||
      !formData.number ||
      !formData.size ||
      !formData.price
    ) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    const landData: Land = {
      ...formData,
      price: Number(formData.price),
      x: selectedCell.x,
      y: selectedCell.y,
      plotId,
      id: editingLand?.id
    };

    try {
      setLoading(true);
      const url = editingLand ? `/api/lands/${editingLand.id}` : '/api/lands';
      const method = editingLand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(landData)
      });

      if (response.ok) {
        const savedLand = await response.json();
        if (editingLand) {
          setLands((prev) =>
            prev.map((land) => (land.id === editingLand.id ? savedLand : land))
          );
          setMessage({ type: 'success', text: 'Land updated successfully!' });
        } else {
          setLands((prev) => [...prev, savedLand]);
          setMessage({ type: 'success', text: 'Land added successfully!' });
        }

        // Reset form
        resetForm();
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.message || 'Failed to save land'
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving land' });
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
      status: land.status as Land['status']
    });
    setSelectedCell({ x: land.x, y: land.y });
  };

  const handleDelete = async (landId: string) => {
    if (!confirm('Are you sure you want to delete this land?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/lands/${landId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLands((prev) => prev.filter((land) => land.id !== landId));
        setMessage({ type: 'success', text: 'Land deleted successfully!' });
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.message || 'Failed to delete land'
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting land' });
    } finally {
      setLoading(false);
    }
  };

  const handleGridConfigUpdate = () => {
    setGridConfig(tempGridConfig);
    setShowGridConfig(false);
    setMessage({ type: 'success', text: 'Grid configuration updated!' });
  };

  const getThemeBasedStyles = () => {
    const baseStyles = {
      grid: {
        cell: 'border-2 text-xs text-center flex items-center justify-center cursor-pointer transition-all duration-200 relative',
        empty:
          'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
        selected: 'ring-2 ring-offset-2 ring-primary',
        status: {
          AVAILABLE:
            'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
          ADVANCE:
            'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700',
          SOLD: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
        }
      },
      card: 'bg-card border-border',
      button: {
        primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
        secondary:
          'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
        destructive:
          'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
      }
    };

    const themeStyles = {
      default: baseStyles,
      blue: {
        ...baseStyles,
        grid: {
          ...baseStyles.grid,
          status: {
            AVAILABLE:
              'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
            ADVANCE:
              'bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
            SOLD: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
          }
        }
      },
      green: {
        ...baseStyles,
        grid: {
          ...baseStyles.grid,
          status: {
            AVAILABLE:
              'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
            ADVANCE:
              'bg-green-400 hover:bg-green-500 dark:bg-green-500 dark:hover:bg-green-600',
            SOLD: 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
          }
        }
      },
      amber: {
        ...baseStyles,
        grid: {
          ...baseStyles.grid,
          status: {
            AVAILABLE:
              'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700',
            ADVANCE:
              'bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600',
            SOLD: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800'
          }
        }
      }
    };

    return (
      themeStyles[activeTheme.split('-')[0] as keyof typeof themeStyles] ||
      themeStyles.default
    );
  };

  const styles = getThemeBasedStyles();

  const getColor = (x: number, y: number) => {
    const land = lands.find((l) => l.x === x && l.y === y);
    const isSelected = selectedCell?.x === x && selectedCell?.y === y;

    if (isSelected) return styles.grid.selected;

    if (land) {
      return styles.grid.status[land.status];
    }

    return styles.grid.empty;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      AVAILABLE: 'bg-green-100 text-green-800',
      SOLD: 'bg-red-100 text-red-800',
      ADVANCE: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    if (message) clearMessage();
  }, [message]);

  const generateGridCells = () => {
    const cells = [];
    let landCount = 0;

    for (let y = 0; y < gridConfig.rows; y++) {
      for (let x = 0; x < gridConfig.cols; x++) {
        if (landCount >= gridConfig.totalLands) break;

        const land = lands.find((l) => l.x === x && l.y === y);
        cells.push(
          <div
            key={`${x}-${y}`}
            onClick={() => handleCellClick(x, y)}
            onMouseEnter={() => land && setHoveredCell({ x, y, land })}
            onMouseLeave={() => setHoveredCell(null)}
            className={`relative flex h-10 w-16 cursor-pointer items-center justify-center border-2 text-center text-xs transition-all duration-200 ${getColor(
              x,
              y
            )}`}
            title={
              land ? `${land.number} - ${land.status}` : `Empty (${x}, ${y})`
            }
          >
            {land?.number || `${x}-${y}`}
          </div>
        );
        landCount++;
      }
      if (landCount >= gridConfig.totalLands) break;
    }
    return cells;
  };

  const resetForm = () => {
    setFormData({
      number: '',
      size: '',
      price: '',
      status: 'AVAILABLE'
    });
    setEditingLand(null);
    setSelectedCell(null);
  };

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
        <div className='grid gap-6 lg:grid-cols-12'>
          <div className='lg:col-span-7'>
            <Card>
              <CardHeader>
                <Skeleton className='h-6 w-[200px]' />
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-10 gap-1'>
                  {[...Array(50)].map((_, i) => (
                    <Skeleton key={i} className='h-10 w-16' />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='lg:col-span-5'>
            <Card>
              <CardHeader>
                <Skeleton className='h-6 w-[200px]' />
              </CardHeader>
              <CardContent className='space-y-4'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Land Layout Editor
          </h1>
          <p className='text-muted-foreground text-sm'>
            Manage and organize lands within plot {plotId}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowLegend(!showLegend)}
                  className='gap-2'
                >
                  <LayoutGrid className='h-4 w-4' />
                  {showLegend ? 'Hide Legend' : 'Show Legend'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Legend</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setZoom(1)}
                  className='gap-2'
                >
                  <RefreshCw className='h-4 w-4' />
                  Reset Zoom
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Zoom Level</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <Settings className='h-4 w-4' />
                Configure Grid
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Grid Configuration</SheetTitle>
                <SheetDescription>
                  Customize the grid layout for your lands
                </SheetDescription>
              </SheetHeader>
              <div className='mt-6 space-y-6'>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='rows'>Rows</Label>
                    <Input
                      id='rows'
                      type='number'
                      value={tempGridConfig.rows}
                      onChange={(e) =>
                        setTempGridConfig({
                          ...tempGridConfig,
                          rows: Number(e.target.value)
                        })
                      }
                      min='1'
                      max='20'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='cols'>Columns</Label>
                    <Input
                      id='cols'
                      type='number'
                      value={tempGridConfig.cols}
                      onChange={(e) =>
                        setTempGridConfig({
                          ...tempGridConfig,
                          cols: Number(e.target.value)
                        })
                      }
                      min='1'
                      max='20'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='totalLands'>Total Lands</Label>
                    <Input
                      id='totalLands'
                      type='number'
                      value={tempGridConfig.totalLands}
                      onChange={(e) =>
                        setTempGridConfig({
                          ...tempGridConfig,
                          totalLands: Number(e.target.value)
                        })
                      }
                      min='1'
                      max={tempGridConfig.rows * tempGridConfig.cols}
                    />
                  </div>
                </div>
                <Button onClick={handleGridConfigUpdate} className='w-full'>
                  <Save className='mr-2 h-4 w-4' />
                  Update Grid
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid gap-6 lg:grid-cols-12'>
        {/* Grid Section */}
        <div className='lg:col-span-7'>
          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>Land Layout Grid</CardTitle>
                <div className='flex items-center gap-2'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        >
                          <ZoomOut className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Zoom Out</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className='text-muted-foreground text-sm'>
                    {Math.round(zoom * 100)}%
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                        >
                          <ZoomIn className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Zoom In</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <div
                  className='mx-auto grid w-max gap-1 transition-transform duration-200'
                  style={{
                    gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center top'
                  }}
                >
                  {generateGridCells()}
                </div>
              </div>
              {showLegend && (
                <div className='mt-4 flex flex-wrap justify-center gap-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={cn(
                        'h-4 w-4 rounded',
                        styles.grid.status.AVAILABLE
                      )}
                    />
                    <span>Available</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={cn(
                        'h-4 w-4 rounded',
                        styles.grid.status.ADVANCE
                      )}
                    />
                    <span>Advance</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={cn('h-4 w-4 rounded', styles.grid.status.SOLD)}
                    />
                    <span>Sold</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className={cn('h-4 w-4 rounded', styles.grid.empty)} />
                    <span>Empty</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Section */}
        <div className='lg:col-span-5'>
          <Card className='flex h-full flex-col'>
            <CardHeader className='flex-shrink-0 pb-2'>
              <CardTitle className='text-lg'>
                {editingLand ? 'Edit Land Details' : 'Add New Land'}
              </CardTitle>
            </CardHeader>
            <CardContent className='flex-1 overflow-y-auto'>
              <div className='space-y-4 p-2'>
                {selectedCell && (
                  <div className='rounded bg-blue-50 p-2 text-sm text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'>
                    Selected Position: ({selectedCell.x}, {selectedCell.y})
                  </div>
                )}

                <div className='grid gap-4'>
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

                <Button
                  onClick={handleSubmit}
                  className='mt-4 w-full'
                  disabled={!selectedCell || loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                      Saving...
                    </>
                  ) : editingLand ? (
                    <>
                      <Save className='mr-2 h-4 w-4' />
                      Update Land
                    </>
                  ) : (
                    <>
                      <Plus className='mr-2 h-4 w-4' />
                      Add Land
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <div className='lg:col-span-12'>
          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>
                  Land Records ({lands.length})
                </CardTitle>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline'>
                    {lands.filter((l) => l.status === 'AVAILABLE').length}{' '}
                    Available
                  </Badge>
                  <Badge variant='outline'>
                    {lands.filter((l) => l.status === 'SOLD').length} Sold
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className='h-[400px]'>
                <div className='-mx-4 overflow-x-auto sm:mx-0'>
                  <div className='inline-block min-w-full align-middle'>
                    <table className='divide-border min-w-full divide-y'>
                      <thead>
                        <tr className='bg-muted/50'>
                          <th className='border-border border px-4 py-2 text-left font-medium'>
                            Land Number
                          </th>
                          <th className='border-border border px-4 py-2 text-left font-medium'>
                            Size
                          </th>
                          <th className='border-border border px-4 py-2 text-left font-medium'>
                            Price
                          </th>
                          <th className='border-border border px-4 py-2 text-left font-medium'>
                            Status
                          </th>
                          <th className='border-border border px-4 py-2 text-left font-medium'>
                            Position
                          </th>
                          <th className='border-border border px-4 py-2 text-left font-medium'>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-border divide-y'>
                        {lands.map((land) => (
                          <tr
                            key={land.id}
                            className='hover:bg-muted/50 transition-colors'
                          >
                            <td className='border-border border px-4 py-2 font-medium'>
                              {land.number}
                            </td>
                            <td className='border-border border px-4 py-2'>
                              {land.size}
                            </td>
                            <td className='border-border border px-4 py-2'>
                              ₹{land.price.toLocaleString()}
                            </td>
                            <td className='border-border border px-4 py-2'>
                              {getStatusBadge(land.status)}
                            </td>
                            <td className='border-border border px-4 py-2'>
                              ({land.x}, {land.y})
                            </td>
                            <td className='border-border border px-4 py-2'>
                              <div className='flex gap-2'>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={() => handleEdit(land)}
                                        disabled={loading}
                                      >
                                        <Edit className='h-4 w-4' />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Land</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={() => handleDelete(land.id!)}
                                        className='text-destructive hover:text-destructive/90'
                                        disabled={loading}
                                      >
                                        <Trash2 className='h-4 w-4' />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete Land</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className='fixed right-4 bottom-4 z-50 max-w-md'>
          <Alert
            className={cn(
              message.type === 'error'
                ? 'bg-destructive/15 border-destructive/50'
                : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50',
              'transition-all duration-200'
            )}
          >
            <AlertCircle
              className={cn(
                'h-4 w-4',
                message.type === 'error'
                  ? 'text-destructive'
                  : 'text-green-600 dark:text-green-400'
              )}
            />
            <AlertDescription
              className={cn(
                message.type === 'error'
                  ? 'text-destructive'
                  : 'text-green-700 dark:text-green-300'
              )}
            >
              {message.text}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
