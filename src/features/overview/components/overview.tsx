import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { AreaGraph } from './area-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';

export default function OverViewPage() {
  // State for analytics
  const [userCount, setUserCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [managerCount, setManagerCount] = useState(0);
  const [buyRequestCount, setBuyRequestCount] = useState(0);
  const [sellRequestCount, setSellRequestCount] = useState(0);
  const [visitRequestCount, setVisitRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      // Fetch all users
      const usersRes = await fetch('/api/all-users');
      const usersData = await usersRes.json();
      setUserCount(usersData.data.length);
      setClientCount(
        usersData.data.filter((u: any) => u.role === 'CLIENT').length
      );
      setManagerCount(
        usersData.data.filter((u: any) => u.role === 'MANAGER').length
      );

      // Fetch buy requests
      const buyRes = await fetch('/api/buy-requests');
      const buyData = await buyRes.json();
      setBuyRequestCount(Array.isArray(buyData) ? buyData.length : 0);

      // Fetch sell requests
      const sellRes = await fetch('/api/sell-requests');
      const sellData = await sellRes.json();
      setSellRequestCount(Array.isArray(sellData) ? sellData.length : 0);

      // Fetch visit requests
      const visitRes = await fetch('/api/visit-requests');
      const visitData = await visitRes.json();
      setVisitRequestCount(Array.isArray(visitData) ? visitData.length : 0);

      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className='p-8 text-center'>Loading analytics...</div>;
  }

  return (
    <PageContainer>
      <div className='scrollbar-hide flex flex-1 flex-col space-y-8 overflow-y-auto p-4'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='h-full'>
            <CardHeader>
              <CardDescription>Total Users</CardDescription>
              <CardTitle className='text-2xl font-semibold'>
                {userCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {clientCount} Clients, {managerCount} Managers
              </div>
            </CardFooter>
          </Card>
          <Card className='h-full'>
            <CardHeader>
              <CardDescription>Buy Requests</CardDescription>
              <CardTitle className='text-2xl font-semibold'>
                {buyRequestCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
          <Card className='h-full'>
            <CardHeader>
              <CardDescription>Sell Requests</CardDescription>
              <CardTitle className='text-2xl font-semibold'>
                {sellRequestCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingDown />
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
          <Card className='h-full'>
            <CardHeader>
              <CardDescription>Visit Requests</CardDescription>
              <CardTitle className='text-2xl font-semibold'>
                {visitRequestCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
        </div>
        <div className='mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
          <AreaGraph />
          <PieGraph />
          <RecentSales />
        </div>
      </div>
    </PageContainer>
  );
}
