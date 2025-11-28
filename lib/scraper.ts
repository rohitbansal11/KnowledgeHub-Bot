import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeWebsite(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style, nav, footer, header').remove();
    
    // Get text content
    const text = $('body').text();
    
    // Clean up text
    const cleanedText = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    return cleanedText;
  } catch (error: any) {
    console.error('Error scraping website:', error.message);
    throw new Error(`Failed to scrape website: ${error.message}`);
  }
}

