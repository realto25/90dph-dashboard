import { delay } from '@/constants/mock-api';
import { BarGraph } from '@/features/overview/components/bar-graph';
import { RecentSales } from '@/features/overview/components/recent-sales';

export default async function Sales() {
  await delay(3000);
  return (
    <>
      <RecentSales />
      <div className='mt-6'>
        <BarGraph />
      </div>
    </>
  );
}
