'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

export const description = 'An interactive bar chart';

export function BarGraph() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isClient, setIsClient] = React.useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/sales-stats');
        if (!res.ok) throw new Error('Failed to load sales data');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Sales data is not an array');
        setChartData(data);
      } catch (err: any) {
        setError(err.message || 'Unable to display statistics at this time');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Card className='h-full w-full border shadow-md'>
      <CardHeader>
        <CardTitle>Sales by Month</CardTitle>
        <CardDescription>
          Total sales (cost of land bought by clients) per month
        </CardDescription>
      </CardHeader>
      <CardContent className='flex h-[250px] items-center justify-center'>
        {loading ? (
          <div>Loading sales data...</div>
        ) : error ? (
          <div className='text-red-500'>
            <div>Error</div>
            <div>{error}</div>
            <button
              className='mt-2 rounded bg-blue-500 px-3 py-1 text-white'
              onClick={() => {
                setError(null);
                setLoading(true);
                // re-fetch
                (async () => {
                  try {
                    const res = await fetch('/api/sales-stats');
                    if (!res.ok) throw new Error('Failed to load sales data');
                    const data = await res.json();
                    if (!Array.isArray(data))
                      throw new Error('Sales data is not an array');
                    setChartData(data);
                    setError(null);
                  } catch (err: any) {
                    setError(
                      err.message || 'Unable to display statistics at this time'
                    );
                    setChartData([]);
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
            >
              Try again
            </button>
          </div>
        ) : chartData.length === 0 ? (
          <div>No sales data available.</div>
        ) : (
          <ChartContainer
            config={{}}
            className='mx-auto h-[250px] w-full max-w-[400px]'
          >
            <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
              />
              <ChartTooltip
                cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
                content={
                  <ChartTooltipContent
                    className='w-[150px]'
                    nameKey='totalSales'
                    labelFormatter={(value) => `Month: ${value}`}
                    formatter={(value) => `Sales: $${value}`}
                  />
                }
              />
              <Bar
                dataKey='totalSales'
                fill='url(#fillBar)'
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='0%'
                    stopColor='var(--primary)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='100%'
                    stopColor='var(--primary)'
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
