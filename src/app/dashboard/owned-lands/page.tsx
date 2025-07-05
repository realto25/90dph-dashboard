'use client';

import { useEffect, useState } from 'react';

interface AssignedLand {
  id: string;
  landNumber: string;
  landSize: string;
  assignedAt: string;
  clientName: string;
  clientEmail: string;
  plotTitle: string;
}

function exportToCSV(data: AssignedLand[], filename = 'assigned-lands.csv') {
  if (!data.length) return;
  const headers = [
    'Land Number',
    'Land Size',
    'Plot Title',
    'Client Name',
    'Client Email',
    'Assigned At'
  ];
  const rows = data.map((land) => [
    land.landNumber,
    land.landSize,
    land.plotTitle,
    land.clientName,
    land.clientEmail,
    new Date(land.assignedAt).toLocaleString()
  ]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function OwnedLandsPage() {
  const [lands, setLands] = useState<AssignedLand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editLand, setEditLand] = useState<AssignedLand | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assigned-lands');
      if (!res.ok) throw new Error('Failed to fetch assigned lands');
      const data = await res.json();
      setLands(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assigned land?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/assigned-lands/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete assigned land');
      setLands((prev) => prev.filter((land) => land.id !== id));
    } catch (err: any) {
      alert(err.message || 'Unknown error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Assigned Lands to Clients</h1>
        <button
          className='rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600'
          onClick={() => exportToCSV(lands)}
          disabled={lands.length === 0}
        >
          Export CSV
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className='text-red-500'>{error}</div>}
      {!loading && !error && lands.length === 0 && (
        <div>No assigned lands found.</div>
      )}
      {!loading && !error && lands.length > 0 && (
        <table className='min-w-full border'>
          <thead>
            <tr>
              <th className='border px-4 py-2'>Land Number</th>
              <th className='border px-4 py-2'>Land Size</th>
              <th className='border px-4 py-2'>Plot Title</th>
              <th className='border px-4 py-2'>Client Name</th>
              <th className='border px-4 py-2'>Client Email</th>
              <th className='border px-4 py-2'>Assigned At</th>
              <th className='border px-4 py-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lands.map((land) => (
              <tr key={land.id}>
                <td className='border px-4 py-2'>{land.landNumber}</td>
                <td className='border px-4 py-2'>{land.landSize}</td>
                <td className='border px-4 py-2'>{land.plotTitle}</td>
                <td className='border px-4 py-2'>{land.clientName}</td>
                <td className='border px-4 py-2'>{land.clientEmail}</td>
                <td className='border px-4 py-2'>
                  {new Date(land.assignedAt).toLocaleString()}
                </td>
                <td className='flex gap-2 border px-4 py-2'>
                  <button
                    className='rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600'
                    onClick={() => setEditLand(land)}
                  >
                    Edit
                  </button>
                  <button
                    className='rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600'
                    onClick={() => handleDelete(land.id)}
                    disabled={deletingId === land.id}
                  >
                    {deletingId === land.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editLand && (
        <div className='bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div className='min-w-[300px] rounded bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-lg font-bold'>Edit Assigned Land</h2>
            <div className='mb-4'>{/* Edit form goes here */}</div>
            <div className='flex justify-end gap-2'>
              <button
                className='rounded bg-gray-300 px-3 py-1'
                onClick={() => setEditLand(null)}
              >
                Cancel
              </button>
              <button
                className='rounded bg-blue-500 px-3 py-1 text-white'
                onClick={() => setEditLand(null)}
              >
                Save (not implemented)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
