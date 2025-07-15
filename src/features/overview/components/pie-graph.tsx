'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

const chartConfig = {
  visitors: {
    label: 'Visitors'
  },
  chrome: {
    label: 'Chrome',
    color: 'var(--primary)'
  },
  safari: {
    label: 'Safari',
    color: 'var(--primary)'
  },
  firefox: {
    label: 'Firefox',
    color: 'var(--primary)'
  },
  edge: {
    label: 'Edge',
    color: 'var(--primary)'
  },
  other: {
    label: 'Other',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function PieGraph() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalVisitors, setTotalVisitors] = useState(0);

  useEffect(() => {
    async function fetchData() {
      // Example: Fetch visit requests and group by user role (replace with your real API logic)
      const res = await fetch('/api/visit-requests');
      const data = await res.json();
      if (!Array.isArray(data)) {
        setChartData([]);
        setTotalVisitors(0);
        // Optionally log or handle error
        return;
      }
      // Example transformation: group by user role
      const grouped: Record<string, { visitors: number; fill: string }> = {};
      data.forEach((item: any) => {
        const role = item.user?.role || 'GUEST';
        if (!grouped[role])
          grouped[role] = { visitors: 0, fill: 'var(--primary)' };
        grouped[role].visitors += 1;
      });
      const colors = [
        'var(--primary)',
        'var(--primary-light)',
        'var(--primary-lighter)',
        'var(--primary-dark)',
        'var(--primary-darker)'
      ];
      let i = 0;
      const chartArr = Object.entries(grouped).map(([role, obj]) => ({
        browser: role,
        visitors: obj.visitors,
        fill: colors[i++ % colors.length]
      }));
      setChartData(chartArr);
      setTotalVisitors(chartArr.reduce((acc, curr) => acc + curr.visitors, 0));
    }
    fetchData();
  }, []);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Pie Chart - Donut with Text</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Total visitors by user role for the last 6 months
          </span>
          <span className='@[540px]/card:hidden'>User role distribution</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='flex h-[250px] items-center justify-center'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto h-[250px] w-full max-w-[300px]'
        >
          <PieChart>
            <defs>
              {chartData.map((item, index) => (
                <linearGradient
                  key={item.browser}
                  id={`fill${item.browser}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stopColor='var(--primary)'
                    stopOpacity={1 - index * 0.15}
                  />
                  <stop
                    offset='100%'
                    stopColor='var(--primary)'
                    stopOpacity={0.8 - index * 0.15}
                  />
                </linearGradient>
              ))}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: `url(#fill${item.browser})`
              }))}
              dataKey='visitors'
              nameKey='browser'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Visitors
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        {chartData.length > 0 && (
          <div className='flex items-center gap-2 leading-none font-medium'>
            {chartData[0].browser} leads with{' '}
            {((chartData[0].visitors / totalVisitors) * 100).toFixed(1)}%{' '}
            <IconTrendingUp className='h-4 w-4' />
          </div>
        )}
        <div className='text-muted-foreground leading-none'>
          Based on real-time data
        </div>
      </CardFooter>
    </Card>
  );
}
