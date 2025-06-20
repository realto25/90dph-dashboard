import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
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
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
          <div className='hidden items-center space-x-2 md:flex'>
            <Button>Download</Button>
          </div>
        </div>
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics' disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
              <Card className='@container/card'>
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
              <Card className='@container/card'>
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
              <Card className='@container/card'>
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
              <Card className='@container/card'>
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
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
              <div className='col-span-4'>
                <BarGraph />
              </div>
              <Card className='col-span-4 md:col-span-3'>
                <RecentSales />
              </Card>
              <div className='col-span-4'>
                <AreaGraph />
              </div>
              <div className='col-span-4 md:col-span-3'>
                <PieGraph />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
