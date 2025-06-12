import { DataTable } from '@/components/ui/data-table';
import { prisma } from '@/lib/prisma';
import { columns } from './columns';

export default async function FeedbackPage() {
  const feedbacks = await prisma.feedback.findMany({
    include: {
      visitRequest: {
        include: {
          plot: {
            include: {
              project: true
            }
          }
        }
      },
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formatted = feedbacks.map((fb) => ({
    id: fb.id,
    visitRequestId: fb.visitRequestId,
    rating: fb.rating,
    experience: fb.experience,
    suggestions: fb.suggestions,
    purchaseInterest:
      fb.purchaseInterest === null
        ? 'Not specified'
        : fb.purchaseInterest
          ? 'Yes'
          : 'No',
    plot: fb.visitRequest.plot.title,
    date: fb.createdAt.toLocaleDateString()
  }));

  return (
    <div className='space-y-4 p-6'>
      <h2 className='text-2xl font-semibold tracking-tight'>Feedbacks</h2>
      <DataTable columns={columns} data={formatted} />
    </div>
  );
}
