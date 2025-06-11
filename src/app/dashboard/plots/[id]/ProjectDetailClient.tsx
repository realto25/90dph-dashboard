'use client';

import AddPlotForm from '@/app/dashboard/plots/AddPlotForm';
import PlotList from '@/app/dashboard/plots/PlotList';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ProjectDetailClientProps {
  projectId: string;
}

export default function ProjectDetailClient({
  projectId
}: ProjectDetailClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Project Details</h1>

      <div className='mb-6 flex justify-end'>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant='default'
          className='px-6 py-2'
        >
          {showForm ? 'Cancel' : 'Add New Plot'}
        </Button>
      </div>

      {/* Form only appears when button is clicked */}
      {showForm && (
        <AddPlotForm
          projectId={projectId}
          onSuccess={() => {
            setShowForm(false);
          }}
        />
      )}

      {/* Show existing plots */}
      <PlotList projectId={projectId} />
    </div>
  );
}
