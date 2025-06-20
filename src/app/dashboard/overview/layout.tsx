'use client';

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
import { useAuth } from '@/lib/auth';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const { userRole, isLoading: authLoading } = useAuth();

  // Analytics state
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [plotCount, setPlotCount] = useState(0);
  const [plotAvailable, setPlotAvailable] = useState(0);
  const [plotSold, setPlotSold] = useState(0);
  const [plotReserved, setPlotReserved] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [clientNew, setClientNew] = useState(0);
  const [managerCount, setManagerCount] = useState(0);
  const [managerOffices, setManagerOffices] = useState(0);
  const [visitRequestCount, setVisitRequestCount] = useState(0);
  const [visitPending, setVisitPending] = useState(0);
  const [visitCompleted, setVisitCompleted] = useState(0);
  const [visitRejected, setVisitRejected] = useState(0);
  const [buyRequestCount, setBuyRequestCount] = useState(0);
  const [buyPending, setBuyPending] = useState(0);
  const [buyApproved, setBuyApproved] = useState(0);
  const [buyRejected, setBuyRejected] = useState(0);
  const [sellRequestCount, setSellRequestCount] = useState(0);
  const [sellPending, setSellPending] = useState(0);
  const [sellApproved, setSellApproved] = useState(0);
  const [sellRejected, setSellRejected] = useState(0);
  const [leaveRequestCount, setLeaveRequestCount] = useState(0);
  const [leavePending, setLeavePending] = useState(0);
  const [leaveApproved, setLeaveApproved] = useState(0);
  const [leaveRejected, setLeaveRejected] = useState(0);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      // Projects
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();
      if (Array.isArray(projectsData)) {
        setProjectCount(projectsData.length);
      } else {
        setProjectCount(0);
      }

      // Plots
      const plotsRes = await fetch('/api/plots');
      const plotsData = await plotsRes.json();
      if (Array.isArray(plotsData)) {
        setPlotCount(plotsData.length);
        setPlotAvailable(
          plotsData.filter((p: any) => p.status === 'AVAILABLE').length
        );
        setPlotSold(plotsData.filter((p: any) => p.status === 'SOLD').length);
        setPlotReserved(
          plotsData.filter((p: any) => p.status === 'RESERVED').length
        );
      } else {
        setPlotCount(0);
        setPlotAvailable(0);
        setPlotSold(0);
        setPlotReserved(0);
      }

      // Users
      const usersRes = await fetch('/api/all-users');
      const usersData = await usersRes.json();
      if (Array.isArray(usersData.data)) {
        setClientCount(
          usersData.data.filter((u: any) => u.role === 'CLIENT').length
        );
        setManagerCount(
          usersData.data.filter((u: any) => u.role === 'MANAGER').length
        );
        const now = new Date();
        const thisMonth = now.getMonth();
        setClientNew(
          usersData.data.filter(
            (u: any) =>
              u.role === 'CLIENT' &&
              new Date(u.createdAt).getMonth() === thisMonth
          ).length
        );
      } else {
        setClientCount(0);
        setManagerCount(0);
        setClientNew(0);
      }

      setManagerOffices(0); // TODO: Replace with real endpoint if available

      // Visit Requests
      const visitRes = await fetch('/api/visit-requests');
      const visitData = await visitRes.json();
      if (Array.isArray(visitData)) {
        setVisitRequestCount(visitData.length);
        setVisitPending(
          visitData.filter((v: any) => v.status === 'PENDING').length
        );
        setVisitCompleted(
          visitData.filter((v: any) => v.status === 'COMPLETED').length
        );
        setVisitRejected(
          visitData.filter((v: any) => v.status === 'REJECTED').length
        );
      } else {
        setVisitRequestCount(0);
        setVisitPending(0);
        setVisitCompleted(0);
        setVisitRejected(0);
      }

      // Buy Requests
      const buyRes = await fetch('/api/buy-requests');
      const buyData = await buyRes.json();
      if (Array.isArray(buyData)) {
        setBuyRequestCount(buyData.length);
        setBuyPending(
          buyData.filter((b: any) => b.status === 'PENDING').length
        );
        setBuyApproved(
          buyData.filter((b: any) => b.status === 'APPROVED').length
        );
        setBuyRejected(
          buyData.filter((b: any) => b.status === 'REJECTED').length
        );
      } else {
        setBuyRequestCount(0);
        setBuyPending(0);
        setBuyApproved(0);
        setBuyRejected(0);
      }

      // Sell Requests
      const sellRes = await fetch('/api/sell-requests');
      const sellData = await sellRes.json();
      if (Array.isArray(sellData)) {
        setSellRequestCount(sellData.length);
        setSellPending(
          sellData.filter((s: any) => s.status === 'PENDING').length
        );
        setSellApproved(
          sellData.filter((s: any) => s.status === 'APPROVED').length
        );
        setSellRejected(
          sellData.filter((s: any) => s.status === 'REJECTED').length
        );
      } else {
        setSellRequestCount(0);
        setSellPending(0);
        setSellApproved(0);
        setSellRejected(0);
      }

      // Leave Requests
      setLeaveRequestCount(0); // TODO: Replace with real endpoint if available
      setLeavePending(0);
      setLeaveApproved(0);
      setLeaveRejected(0);

      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  if (authLoading || loading) {
    return <div className='p-8 text-center'>Loading analytics...</div>;
  }

  if (userRole !== 'SUPERADMIN') {
    return (
      <PageContainer>
        <div className='flex h-full flex-1 items-center justify-center'>
          <h2 className='text-xl font-semibold text-red-500'>
            You do not have access to view analytics.
          </h2>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Projects</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {projectCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +2
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Active Projects <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Across multiple locations
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Plots</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {plotCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +15
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {plotAvailable} Available <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {plotSold} Sold, {plotReserved} Reserved
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Clients</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {clientCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +28
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Active Clients <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {clientNew} New this month
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Managers</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {managerCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +3
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Active Managers <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Across {managerOffices} offices
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Visit Requests</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {visitRequestCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +12
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {visitPending} Pending <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {visitCompleted} Completed, {visitRejected} Rejected
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Buy Requests</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {buyRequestCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +8
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {buyPending} Pending <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {buyApproved} Approved, {buyRejected} Rejected
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Sell Requests</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {sellRequestCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +5
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {sellPending} Pending <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {sellApproved} Approved, {sellRejected} Rejected
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Leave Requests</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {leaveRequestCount}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingDown />
                  -5
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {leavePending} Pending <IconTrendingDown className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {leaveApproved} Approved, {leaveRejected} Rejected
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
