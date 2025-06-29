import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        plots: true
      }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = await prisma.project.create({
      data: {
        name: body.name,
        location: body.location,
        description: body.description,
        imageUrl: body.imageUrl
      }
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Error creating project' },
      { status: 500 }
    );
  }
}
