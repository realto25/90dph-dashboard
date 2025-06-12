import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const sessionClerkId = session?.userId;
    const body = await req.json();
    const {
      visitRequestId,
      clerkId,
      rating,
      experience,
      suggestions,
      purchaseInterest
    } = body;

    console.log('Feedback submission data:', {
      visitRequestId,
      clerkId,
      rating,
      experience,
      suggestions,
      purchaseInterest,
      sessionClerkId
    });

    // 🔍 Validate required fields
    if (
      !visitRequestId?.trim() ||
      !clerkId?.trim() ||
      typeof rating !== 'number' ||
      !experience?.trim() ||
      !suggestions?.trim()
    ) {
      console.error('Missing required fields:', {
        visitRequestId,
        clerkId,
        rating,
        experience,
        suggestions
      });
      return NextResponse.json(
        { error: 'Missing required feedback fields.' },
        { status: 400 }
      );
    }

    // Validate rating is a number between 1-5
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5.' },
        { status: 400 }
      );
    }

    // 🔐 Validate visit request exists
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id: visitRequestId },
      include: {
        user: true,
        plot: {
          include: {
            project: true
          }
        }
      }
    });

    if (!visitRequest) {
      console.error('Visit request not found:', visitRequestId);
      return NextResponse.json(
        { error: 'Invalid visit request ID. Visit request not found.' },
        { status: 404 }
      );
    }

    console.log('Found visit request:', {
      id: visitRequest.id,
      userId: visitRequest.userId,
      status: visitRequest.status
    });

    // Get the user by clerkId
    const user = await prisma.user.findFirst({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      console.error('User not found for clerkId:', clerkId);
      return NextResponse.json(
        { error: 'User not found. Please sign in again.' },
        { status: 401 }
      );
    }

    // Check if feedback already exists for this visit request and user
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        visitRequestId,
        userId: user.id
      }
    });

    if (existingFeedback) {
      console.error('Feedback already exists for visit:', visitRequestId);
      return NextResponse.json(
        { error: 'Feedback has already been submitted for this visit.' },
        { status: 409 }
      );
    }

    // Create feedback data object with proper type conversion
    const feedbackData = {
      visitRequestId,
      userId: user.id,
      rating: ratingNum,
      experience: experience.trim(),
      suggestions: suggestions.trim(),
      purchaseInterest:
        purchaseInterest === null ? null : Boolean(purchaseInterest)
    };

    console.log('Creating feedback with data:', feedbackData);

    // ✅ Create feedback with transaction to ensure data consistency
    const feedback = await prisma.$transaction(async (tx) => {
      // Create the feedback
      const newFeedback = await tx.feedback.create({
        data: feedbackData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          visitRequest: {
            select: {
              id: true,
              name: true,
              email: true,
              date: true,
              time: true,
              status: true,
              plot: {
                select: {
                  id: true,
                  title: true,
                  project: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Update visit request status to COMPLETED if not already
      if (visitRequest.status !== 'COMPLETED') {
        await tx.visitRequest.update({
          where: { id: visitRequestId },
          data: { status: 'COMPLETED' }
        });
      }

      return newFeedback;
    });

    console.log('Feedback created successfully:', feedback.id);

    return NextResponse.json(
      {
        message: 'Feedback submitted successfully',
        feedback
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Feedback creation error:', err);

    // Enhanced error logging
    if (err && typeof err === 'object') {
      console.error('Error details:', {
        name: 'name' in err ? String(err.name) : 'Unknown',
        message: 'message' in err ? String(err.message) : 'Unknown error',
        code: 'code' in err ? String(err.code) : 'Unknown code',
        stack: 'stack' in err ? String(err.stack) : 'No stack trace'
      });

      // Handle specific Prisma errors
      if ('code' in err) {
        const prismaError = err as any;

        if (prismaError.code === 'P2002') {
          return NextResponse.json(
            { error: 'Feedback already exists for this visit.' },
            { status: 409 }
          );
        } else if (prismaError.code === 'P2003') {
          return NextResponse.json(
            { error: 'Invalid reference - visit request or user not found.' },
            { status: 400 }
          );
        } else if (prismaError.code === 'P2025') {
          return NextResponse.json(
            { error: 'Record not found.' },
            { status: 404 }
          );
        }
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to create feedback. Please try again.',
        details:
          process.env.NODE_ENV === 'development' ? String(err) : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId?.trim()) {
      return NextResponse.json(
        { error: 'Clerk ID is required' },
        { status: 400 }
      );
    }

    // Get user by clerkId
    const user = await prisma.user.findFirst({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: {
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            clerkId: true
          }
        },
        visitRequest: {
          select: {
            id: true,
            status: true,
            plot: {
              select: {
                id: true,
                title: true,
                location: true,
                project: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
