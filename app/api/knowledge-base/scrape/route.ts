import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { scrapeWebsite } from '@/lib/scraper';
import { createVector } from '@/lib/vector';
import { ensureIndexExists } from '@/lib/pinecone';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure Pinecone index exists before scraping
    await ensureIndexExists();

    const { url, title } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Scrape website
    const content = await scrapeWebsite(url);

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'No content found on the website' },
        { status: 400 }
      );
    }

    // Create vector
    const knowledgeBaseItem = await createVector(
      user._id!,
      title || url,
      content,
      'website',
      url
    );

    return NextResponse.json(
      { message: 'Website scraped successfully', item: knowledgeBaseItem },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

