'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Calendar, Edit, MapPin, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddProjectForm from './AddProjectForm';

interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  plots: Plot[];
  createdAt: string;
}

interface Plot {
  id: string;
  title: string;
  status: string;
}

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectClick = (projectId: string) => {
    router.push(`plots/${projectId}`);
  };

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = async (
    e: React.MouseEvent,
    projectId: string
  ) => {
    e.stopPropagation();
    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete project'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProject(null);
    fetchProjects();
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className='p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Projects</h1>
        <Button
          onClick={() => {
            setEditingProject(null);
            setShowForm(!showForm);
          }}
          className='flex items-center gap-2'
        >
          <Building2 className='h-4 w-4' />
          {showForm ? 'Cancel' : '+ New Project'}
        </Button>
      </div>

      {showForm && (
        <AddProjectForm
          onSuccess={handleFormSuccess}
          project={editingProject}
          onCancel={handleCancelEdit}
        />
      )}

      <div className='mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project) => (
          <Card
            key={project.id}
            className='group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg'
            onClick={() => handleProjectClick(project.id)}
          >
            <div className='relative'>
              <img
                src={project.imageUrl || 'https://via.placeholder.com/150'}
                alt={project.name}
                className='h-48 w-full rounded-t-lg object-cover'
              />

              {/* Action buttons overlay */}
              <div className='absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <Button
                  size='sm'
                  variant='secondary'
                  className='bg-background/90 hover:bg-background border-border/50 hover:border-border h-8 w-8 border p-0 shadow-sm'
                  onClick={(e) => handleEditProject(e, project)}
                >
                  <Edit className='text-foreground h-4 w-4' />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size='sm'
                      variant='destructive'
                      className='bg-destructive/90 hover:bg-destructive border-destructive/50 hover:border-destructive h-8 w-8 border p-0 shadow-sm'
                      onClick={(e) => e.stopPropagation()}
                      disabled={loading}
                    >
                      <Trash2 className='text-destructive-foreground h-4 w-4' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{project.name}"? This
                        action cannot be undone.
                        {project.plots.length > 0 && (
                          <span className='mt-2 block font-medium text-red-600'>
                            ⚠️ This project has {project.plots.length} plot(s)
                            and cannot be deleted.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        disabled={project.plots.length > 0 || loading}
                        className='bg-red-500 hover:bg-red-600'
                      >
                        {loading ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <CardContent className='p-4'>
              <h2 className='mb-2 line-clamp-1 text-xl font-semibold'>
                {project.name}
              </h2>

              <div className='text-muted-foreground space-y-2 text-sm'>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4' />
                  <span className='line-clamp-1'>{project.location}</span>
                </div>

                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>

              <p className='mt-3 line-clamp-2 text-sm text-gray-600'>
                {project.description}
              </p>

              <div className='mt-4 flex items-center justify-between'>
                <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300'>
                  {project.plots.length} Plot
                  {project.plots.length !== 1 ? 's' : ''}
                </span>

                <div className='text-muted-foreground text-xs'>
                  Click to view details
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !showForm && (
        <div className='py-12 text-center'>
          <Building2 className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
          <h3 className='text-muted-foreground mb-2 text-lg font-medium'>
            No projects yet
          </h3>
          <p className='text-muted-foreground mb-4 text-sm'>
            Get started by creating your first project.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Building2 className='mr-2 h-4 w-4' />
            Create Project
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
