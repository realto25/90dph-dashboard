'use client';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function exportAttendanceToCSV(data: any[], filename = 'attendance-list.csv') {
  if (!data || !data.length) return;
  const headers = ['Manager', 'Office', 'Date', 'Status'];
  const rows = data.map((attendance) => [
    attendance.managerName || attendance.managerId,
    attendance.office?.name || '-',
    new Date(attendance.createdAt).toLocaleDateString(),
    attendance.status
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

export default function AttendanceListPage() {
  const { data, error, isLoading } = useSWR('/api/attendance', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading attendance data.</div>;

  return (
    <Card className='p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-bold'>Attendance List</h2>
        <button
          className='rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600'
          onClick={() => exportAttendanceToCSV(data)}
          disabled={!data || data.length === 0}
        >
          Export CSV
        </button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Manager</TableHead>
            <TableHead>Office</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((attendance: any) => (
              <TableRow key={attendance.id}>
                <TableCell>
                  {attendance.managerName || attendance.managerId}
                </TableCell>
                <TableCell>{attendance.office?.name || '-'}</TableCell>
                <TableCell>
                  {new Date(attendance.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{attendance.status}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className='text-center'>
                No attendance records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
