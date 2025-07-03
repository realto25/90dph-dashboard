'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Camera, Loader2, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Plot {
  id: string;
  title: string;
  location: string;
  status: string;
  owner?: {
    id: string;
    name: string;
  } | null;
  cameras: {
    id: string;
    ipAddress: string;
    label: string | null;
  }[];
}

interface Land {
  id: string;
  number: string;
  size: string;
  status: string;
  plot: {
    title: string;
    location: string;
  };
  cameras: {
    id: string;
    ipAddress: string;
    label: string | null;
  }[];
}

interface CameraAssignment {
  id: string;
  type: 'plot' | 'land';
  title: string;
  location: string;
  size?: string;
  number?: string;
  status: string;
  camera: {
    id: string;
    ipAddress: string;
    label: string | null;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export default function AssignCameraPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [plots, setPlots] = useState<Plot[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<string>('');
  const [selectedLand, setSelectedLand] = useState<string>('');
  const [ipAddress, setIpAddress] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [assignments, setAssignments] = useState<CameraAssignment[]>([]);
  const [editingAssignment, setEditingAssignment] =
    useState<CameraAssignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cameraInputs, setCameraInputs] = useState([
    { ipAddress: '', label: '' }
  ]);

  // Fetch projects with retry
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetchWithRetry('/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error('Invalid projects data:', data);
          setProjects([]);
          toast.error('Invalid projects data received');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to fetch projects. Please try again.');
        setProjects([]);
      }
    };

    fetchProjects();
  }, []);

  // Reset selections when project changes
  useEffect(() => {
    setSelectedClient('');
    setSelectedPlot('');
    setSelectedLand('');
    setPlots([]);
    setLands([]);
    setAssignments([]);
  }, [selectedProject]);

  // Fetch clients with retry
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetchWithRetry('/api/users?role=CLIENT');
        const data = await res.json();
        if (Array.isArray(data)) {
          setClients(data);
        } else {
          console.error('Invalid clients data:', data);
          setClients([]);
          toast.error('Invalid clients data received');
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to fetch clients. Please try again.');
        setClients([]);
      }
    };

    fetchClients();
  }, []);

  // Fetch data with retry
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedClient || !selectedProject) {
        setPlots([]);
        setLands([]);
        setAssignments([]);
        return;
      }

      setFetchingData(true);
      try {
        // Fetch plots and lands in parallel
        const [plotsRes, landsRes] = await Promise.all([
          fetchWithRetry(
            `/api/plots?projectId=${selectedProject}&ownerId=${selectedClient}`
          ),
          fetchWithRetry(`/api/assign-land-camera?ownerId=${selectedClient}`)
        ]);

        const [plotsData, landsData] = await Promise.all([
          plotsRes.json(),
          landsRes.json()
        ]);

        if (Array.isArray(plotsData) && Array.isArray(landsData)) {
          setPlots(plotsData);
          setLands(landsData);

          // Combine and format assignments
          const formattedAssignments: CameraAssignment[] = [
            ...plotsData.flatMap((plot: any) =>
              (plot.cameras || []).map((camera: any) => ({
                id: camera.id,
                type: 'plot' as const,
                title: plot.title,
                location: plot.location,
                status: plot.status,
                camera,
                owner: plot.owner!
              }))
            ),
            ...landsData.flatMap((land: any) =>
              (land.cameras || []).map((camera: any) => ({
                id: camera.id,
                type: 'land' as const,
                title: land.plot.title,
                location: land.plot.location,
                size: land.size,
                number: land.number,
                status: land.status,
                camera,
                owner: { id: selectedClient, name: '', email: '' }
              }))
            )
          ];

          // Fill in owner details for lands
          const client = clients.find((c) => c.id === selectedClient);
          if (client) {
            formattedAssignments.forEach((assignment) => {
              if (assignment.type === 'land') {
                assignment.owner = client;
              }
            });
          }

          setAssignments(formattedAssignments);
        } else {
          throw new Error('Invalid data received from server');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data. Please try again.');
        setPlots([]);
        setLands([]);
        setAssignments([]);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [selectedClient, selectedProject, clients]);

  const handleAssign = async () => {
    if (
      (!selectedPlot && !selectedLand) ||
      cameraInputs.some((cam) => !cam.ipAddress)
    ) {
      toast.error('Please select a plot/land and enter all IP addresses');
      return;
    }

    setLoading(true);
    try {
      if (editingAssignment) {
        // Only allow editing one camera at a time
        const cam = cameraInputs[0];
        const endpoint =
          editingAssignment.type === 'plot'
            ? '/api/assign-camera'
            : '/api/assign-land-camera';
        const res = await fetchWithRetry(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingAssignment.camera.id,
            ipAddress: cam.ipAddress,
            label: cam.label
          })
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to update camera');
        }
        toast.success('Camera updated successfully!');
      } else {
        const endpoint = selectedPlot
          ? '/api/assign-camera'
          : '/api/assign-land-camera';
        const id = selectedPlot || selectedLand;
        const idField = selectedPlot ? 'plotId' : 'landId';
        const cameras = cameraInputs.map((cam) => ({
          ipAddress: cam.ipAddress,
          label: cam.label || null
        }));
        const res = await fetchWithRetry(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [idField]: id, cameras })
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to assign cameras');
        }
        toast.success('Cameras assigned successfully!');
      }
      setIsDialogOpen(false);
      setCameraInputs([{ ipAddress: '', label: '' }]);
      setEditingAssignment(null);
      refreshData();
    } catch (error: any) {
      toast.error(
        error.message || 'Failed to save camera(s). Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment: CameraAssignment) => {
    setEditingAssignment(assignment);
    setCameraInputs([
      {
        ipAddress: assignment.camera.ipAddress,
        label: assignment.camera.label || ''
      }
    ]);
    if (assignment.type === 'plot') {
      setSelectedPlot(assignment.id);
      setSelectedLand('');
    } else {
      setSelectedLand(assignment.id);
      setSelectedPlot('');
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (assignment: CameraAssignment) => {
    if (!confirm('Are you sure you want to delete this camera assignment?'))
      return;

    try {
      const endpoint =
        assignment.type === 'plot'
          ? '/api/assign-camera'
          : '/api/assign-land-camera';
      const res = await fetchWithRetry(
        `${endpoint}?id=${assignment.camera.id}`,
        {
          method: 'DELETE'
        }
      );

      if (!res.ok) {
        throw new Error('Failed to delete camera assignment');
      }

      toast.success('Camera assignment deleted successfully');
      refreshData();
    } catch (error) {
      console.error('Error deleting camera:', error);
      toast.error('Failed to delete camera assignment. Please try again.');
    }
  };

  const refreshData = async () => {
    if (!selectedClient || !selectedProject) return;

    setFetchingData(true);
    try {
      // Fetch plots and lands in parallel
      const [plotsRes, landsRes] = await Promise.all([
        fetchWithRetry(
          `/api/plots?projectId=${selectedProject}&ownerId=${selectedClient}`
        ),
        fetchWithRetry(`/api/assign-land-camera?ownerId=${selectedClient}`)
      ]);

      const [plotsData, landsData] = await Promise.all([
        plotsRes.json(),
        landsRes.json()
      ]);

      if (Array.isArray(plotsData) && Array.isArray(landsData)) {
        setPlots(plotsData);
        setLands(landsData);

        // Update assignments
        const formattedAssignments: CameraAssignment[] = [
          ...plotsData.flatMap((plot: any) =>
            (plot.cameras || []).map((camera: any) => ({
              id: camera.id,
              type: 'plot' as const,
              title: plot.title,
              location: plot.location,
              status: plot.status,
              camera,
              owner: plot.owner!
            }))
          ),
          ...landsData.flatMap((land: any) =>
            (land.cameras || []).map((camera: any) => ({
              id: camera.id,
              type: 'land' as const,
              title: land.plot.title,
              location: land.plot.location,
              size: land.size,
              number: land.number,
              status: land.status,
              camera,
              owner: { id: selectedClient, name: '', email: '' }
            }))
          )
        ];

        const client = clients.find((c) => c.id === selectedClient);
        if (client) {
          formattedAssignments.forEach((assignment) => {
            if (assignment.type === 'land') {
              assignment.owner = client;
            }
          });
        }

        setAssignments(formattedAssignments);
      } else {
        throw new Error('Invalid data received from server');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data. Please try again.');
    } finally {
      setFetchingData(false);
    }
  };

  const openDialog = () => {
    setEditingAssignment(null);
    setCameraInputs([{ ipAddress: '', label: '' }]);
    setIsDialogOpen(true);
  };

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Camera Assignment</h1>
        <Button
          variant='outline'
          size='sm'
          onClick={refreshData}
          disabled={fetchingData || !selectedClient || !selectedProject}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${fetchingData ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Camera Assignment</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label>Project</Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a project' />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(projects) &&
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Client</Label>
              <Select
                value={selectedClient}
                onValueChange={setSelectedClient}
                disabled={!selectedProject}
              >
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

            <div className='space-y-2'>
              <Label>Assign New Camera</Label>
              <Dialog
                open={isDialogOpen}
                onOpenChange={(v) => {
                  if (v) openDialog();
                  else setIsDialogOpen(false);
                }}
              >
                <DialogTrigger asChild>
                  <Button className='w-full'>
                    <Camera className='mr-2 h-4 w-4' />
                    Assign Camera
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAssignment
                        ? 'Edit Camera'
                        : 'Assign New Camera(s)'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <Label>Type</Label>
                      <Select
                        value={selectedPlot ? 'plot' : 'land'}
                        onValueChange={(value) => {
                          if (editingAssignment) return;
                          setSelectedPlot('');
                          setSelectedLand('');
                          if (value === 'plot') {
                            setSelectedPlot(plots[0]?.id || '');
                          } else {
                            setSelectedLand(lands[0]?.id || '');
                          }
                        }}
                        disabled={!!editingAssignment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='plot'>Plot</SelectItem>
                          <SelectItem value='land'>Land</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label>Select {selectedPlot ? 'Plot' : 'Land'}</Label>
                      <Select
                        value={selectedPlot || selectedLand}
                        onValueChange={(value) => {
                          if (editingAssignment) return;
                          if (selectedPlot) {
                            setSelectedPlot(value);
                          } else {
                            setSelectedLand(value);
                          }
                        }}
                        disabled={!!editingAssignment}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select a ${selectedPlot ? 'plot' : 'land'}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedPlot
                            ? plots.map((plot) => (
                                <SelectItem key={plot.id} value={plot.id}>
                                  {plot.title} - {plot.location}
                                </SelectItem>
                              ))
                            : lands.map((land) => (
                                <SelectItem key={land.id} value={land.id}>
                                  {land.number} - {land.plot.title} ({land.size}
                                  )
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {cameraInputs.map((cam, idx) => (
                      <div className='flex items-end gap-4' key={idx}>
                        <div className='flex-1'>
                          <Label>IP Address</Label>
                          <Input
                            placeholder='e.g., http://192.168.1.100:8080/video'
                            value={cam.ipAddress}
                            onChange={(e) => {
                              const newInputs = [...cameraInputs];
                              newInputs[idx].ipAddress = e.target.value;
                              setCameraInputs(newInputs);
                            }}
                          />
                        </div>
                        <div className='flex-1'>
                          <Label>Label (Optional)</Label>
                          <Input
                            placeholder='e.g., Entrance'
                            value={cam.label}
                            onChange={(e) => {
                              const newInputs = [...cameraInputs];
                              newInputs[idx].label = e.target.value;
                              setCameraInputs(newInputs);
                            }}
                          />
                        </div>
                        {!editingAssignment && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() =>
                              setCameraInputs(
                                cameraInputs.filter((_, i) => i !== idx)
                              )
                            }
                            disabled={cameraInputs.length === 1}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    ))}
                    {!editingAssignment && (
                      <Button
                        type='button'
                        variant='outline'
                        className='mt-2 w-full'
                        onClick={() =>
                          setCameraInputs([
                            ...cameraInputs,
                            { ipAddress: '', label: '' }
                          ])
                        }
                      >
                        + Add Camera
                      </Button>
                    )}
                    <Button
                      onClick={handleAssign}
                      disabled={
                        loading ||
                        (!selectedPlot && !selectedLand) ||
                        cameraInputs.some((cam) => !cam.ipAddress)
                      }
                      className='mt-4 w-full'
                    >
                      {loading ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          {editingAssignment ? 'Updating...' : 'Assigning...'}
                        </>
                      ) : (
                        <>
                          <Camera className='mr-2 h-4 w-4' />
                          {editingAssignment
                            ? 'Update Camera'
                            : 'Assign Camera(s)'}
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {assignments.length > 0 && (
            <div className='mt-6'>
              <h3 className='mb-4 text-lg font-semibold'>Assigned Cameras</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Camera Label</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={`${assignment.type}-${assignment.id}`}>
                      <TableCell>
                        <Badge
                          variant={
                            assignment.type === 'plot' ? 'default' : 'secondary'
                          }
                        >
                          {assignment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{assignment.location}</TableCell>
                      <TableCell>
                        {assignment.type === 'land' && (
                          <div className='text-sm'>
                            <div>Number: {assignment.number}</div>
                            <div>Size: {assignment.size}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignment.camera.label || 'No label'}
                      </TableCell>
                      <TableCell className='font-mono text-sm'>
                        {assignment.camera.ipAddress}
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <div>{assignment.owner.name}</div>
                          <div className='text-muted-foreground'>
                            {assignment.owner.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex space-x-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleEdit(assignment)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(assignment)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
