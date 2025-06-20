'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectClick = (projectId: string) => {
    router.push(`plots/${projectId}`);
  };

  return (
    <div className='p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Projects</h1>
        <Button onClick={() => setShowForm(!showForm)}>+ New Project</Button>
      </div>

      {showForm && <AddProjectForm onSuccess={fetchProjects} />}

      <div className='mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project) => (
          <div
            key={project.id}
            className='cursor-pointer rounded-xl border border-gray-200 p-4 shadow-md transition hover:shadow-lg'
            onClick={() => handleProjectClick(project.id)}
          >
            <img
              src={project.imageUrl || 'https://via.placeholder.com/150'}
              alt={project.name}
              className='mb-4 h-40 w-full rounded-md object-cover'
            />
            <h2 className='text-xl font-semibold'>{project.name}</h2>
            <p className='mb-2 text-sm text-gray-500'>{project.location}</p>
            <p className='text-sm text-gray-600'>{project.description}</p>
            <div className='mt-2'>
              <span className='rounded-full bg-green-600 px-2 py-1 text-xs text-white'>
                {project.plots.length} Plots
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
