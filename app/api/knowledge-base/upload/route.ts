import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createVector } from '@/lib/vector';
import { ensureIndexExists } from '@/lib/pinecone';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure Pinecone index exists before uploading
    await ensureIndexExists();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Read file content - support all text file formats
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Get file extension
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    let content: string;
    
    try {
      // Try UTF-8 first (most common)
      content = buffer.toString('utf-8');
      
      // Check if the content appears to be valid text
      // Binary files often contain null bytes or non-printable characters
      if (buffer.includes(0x00) && buffer.length > 0 && buffer.indexOf(0x00) < buffer.length * 0.1) {
        // If file contains null bytes early on, it might be binary
        // But allow some null bytes for certain text formats
        const nullByteCount = buffer.filter(b => b === 0x00).length;
        if (nullByteCount > buffer.length * 0.05) {
          throw new Error('File appears to be binary. Please upload a text file.');
        }
      }
      
      // Handle specific file formats
      if (fileExtension === '.json') {
        // Validate JSON structure
        try {
          JSON.parse(content);
        } catch {
          // Not valid JSON, but still extract as text
          console.warn('File has .json extension but is not valid JSON. Extracting as text.');
        }
      } else if (fileExtension === '.csv') {
        // CSV files are already text, no special handling needed
      } else if (fileExtension === '.xml' || fileExtension === '.html') {
        // XML/HTML files are text-based
      }
      
    } catch (error: any) {
      // If UTF-8 fails, try other encodings
      if (error.message.includes('binary')) {
        throw error;
      }
      
      // Try latin1 as fallback
      try {
        content = buffer.toString('latin1');
      } catch {
        // Try utf16le
        try {
          content = buffer.toString('utf16le');
        } catch {
          return NextResponse.json(
            { error: 'Unable to read file. Please ensure it is a text file.' },
            { status: 400 }
          );
        }
      }
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'File is empty or contains no readable text' },
        { status: 400 }
      );
    }

    // Create vector
    const knowledgeBaseItem = await createVector(
      user._id!,
      title || file.name,
      content,
      'file',
      undefined,
      file.name
    );

    return NextResponse.json(
      { message: 'File uploaded successfully', item: knowledgeBaseItem },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

