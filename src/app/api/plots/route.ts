import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { z } from 'zod';

// Validation schema for plot creation
const plotSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  dimension: z.string().min(1, 'Dimension is required'),
  price: z.number().min(0, 'Price must be positive'),
  priceLabel: z.string().min(1, 'Price label is required'),
  status: z.enum(['AVAILABLE', 'ADVANCE', 'SOLD']),
  imageUrls: z.array(z.string().url('Invalid image URL')),
  location: z.string().min(1, 'Location is required'),
  latitude: z.number(),
  longitude: z.number(),
  facing: z.string().min(1, 'Facing is required'),
  amenities: z.array(z.string()),
  description: z.string().min(1, 'Description is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  mapEmbedUrl: z.string().optional(),
  totalArea: z.number()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (projectId) {
      const plots = await prisma.plot.findMany({
        where: {
          projectId: projectId
        },
        include: {
          project: true
        }
      });
      return NextResponse.json(plots);
    } else {
      // Return all plots for analytics
      const plots = await prisma.plot.findMany({
        include: {
          project: true
        }
      });
      return NextResponse.json(plots);
    }
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json(
      { error: 'Error fetching plots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = plotSchema.parse({
      ...body,
      price: parseInt(body.price),
      latitude: parseFloat(body.latitude),
      longitude: parseFloat(body.longitude),
      totalArea: parseFloat(body.totalArea)
    });

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create the plot without qrData
    const plot = await prisma.plot.create({
      data: validatedData
    });

    // Generate QR code as a PNG data URL from the plot's id
    const qrUrl = await QRCode.toDataURL(plot.id);
    const updatedPlot = await prisma.plot.update({
      where: { id: plot.id },
      data: { qrUrl }
    });

    return NextResponse.json(updatedPlot);
  } catch (error) {
    console.error('Error creating plot:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Error creating plot' }, { status: 500 });
  }
}
