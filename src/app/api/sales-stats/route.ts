import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all SOLD lands with their price and createdAt
    const lands = await prisma.land.findMany({
      where: { status: 'SOLD' },
      select: {
        price: true,
        createdAt: true
      }
    });

    // Group by month and sum prices
    const salesByMonth: Record<string, number> = {};
    for (const land of lands || []) {
      const date = new Date(land.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      salesByMonth[month] = (salesByMonth[month] || 0) + (land.price || 0);
    }

    // Convert to array sorted by month
    const result = Object.entries(salesByMonth)
      .map(([month, totalSales]) => ({ month, totalSales }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Always return an array, even if empty
    return NextResponse.json(result || []);
  } catch (error) {
    console.error('[SALES_STATS_GET]', error);
    // Return an empty array on error, not just a 500
    return NextResponse.json([], { status: 200 });
  }
}
