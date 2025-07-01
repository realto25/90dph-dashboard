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

export default function AttendanceListPage() {
  const { data, error, isLoading } = useSWR('/api/attendance', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading attendance data.</div>;

  return (
    <Card className='p-6'>
      <h2 className='mb-4 text-xl font-bold'>Attendance List</h2>
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
