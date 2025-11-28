import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createVector } from '@/lib/vector';
import { ensureIndexExists } from '@/lib/pinecone';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure Pinecone index exists before pasting
    await ensureIndexExists();

    const { title, content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Create vector from pasted text
    const knowledgeBaseItem = await createVector(
      user._id!,
      title || 'Pasted Text',
      content.trim(),
      'file', // Using 'file' as source type for pasted text
      undefined,
      undefined
    );

    return NextResponse.json(
      { message: 'Text saved successfully', item: knowledgeBaseItem },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Paste error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

