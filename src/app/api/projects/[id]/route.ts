import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        plots: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        location: body.location,
        description: body.description,
        imageUrl: body.imageUrl
      },
      include: {
        plots: true
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Error updating project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    // Check if project has plots
    const projectWithPlots = await prisma.project.findUnique({
      where: { id },
      include: {
        plots: true
      }
    });

    if (!projectWithPlots) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (projectWithPlots.plots.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete project with existing plots' },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Error deleting project' },
      { status: 500 }
    );
  }
}
