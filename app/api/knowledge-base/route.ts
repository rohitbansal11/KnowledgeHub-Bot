import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserVectors, updateVector, deleteVector } from '@/lib/vector';

// GET - Get all knowledge base items
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vectors = await getUserVectors(user._id!);
    return NextResponse.json({ items: vectors }, { status: 200 });
  } catch (error: any) {
    console.error('Get vectors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a knowledge base item
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vectorId, title, content } = await request.json();

    if (!vectorId || !title || !content) {
      return NextResponse.json(
        { error: 'vectorId, title, and content are required' },
        { status: 400 }
      );
    }

    const updated = await updateVector(vectorId, user._id!, title, content);
    return NextResponse.json(
      { message: 'Item updated successfully', item: updated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a knowledge base item
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vectorId = searchParams.get('vectorId');

    if (!vectorId) {
      return NextResponse.json(
        { error: 'vectorId is required' },
        { status: 400 }
      );
    }

    await deleteVector(vectorId, user._id!);
    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

