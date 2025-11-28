import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

export async function getEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Please add your OpenRouter API key to .env.local');
  }

  // Check if API key looks like a URL (common mistake)
  if (process.env.OPENROUTER_API_KEY.startsWith('http')) {
    throw new Error('OPENROUTER_API_KEY should be your API key, not a URL. Get your key from https://openrouter.ai/keys');
  }

  const model = process.env.OPENROUTER_EMBEDDING_MODEL || 'BAAI/bge-m3';

  try {
    const response = await axios.post(
      `${OPENROUTER_API_URL}/embeddings`,
      {
        model: model,
        input: text,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data[0].embedding;
  } catch (error: any) {
    console.error('Error getting embedding:', error.response?.data || error.message);
    
    // Provide more helpful error messages
    if (error.response?.status === 401) {
      throw new Error('OpenRouter API key is invalid or missing. Please check your OPENROUTER_API_KEY in .env.local');
    }
    
    if (error.response?.data) {
      throw new Error(`OpenRouter API error: ${JSON.stringify(error.response.data)}`);
    }
    
    throw new Error(`Failed to get embedding from OpenRouter: ${error.message}`);
  }
}

export async function chatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Please add your OpenRouter API key to .env.local');
  }

  // Check if API key looks like a URL (common mistake)
  if (process.env.OPENROUTER_API_KEY.startsWith('http')) {
    throw new Error('OPENROUTER_API_KEY should be your API key, not a URL. Get your key from https://openrouter.ai/keys');
  }

  const model = process.env.OPENROUTER_CHAT_MODEL || 'meta-llama/llama-3.1-8b-instruct';

  try {
    const response = await axios.post(
      `${OPENROUTER_API_URL}/chat/completions`,
      {
        model: model,
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error in chat completion:', error.response?.data || error.message);
    
    // Provide more helpful error messages
    if (error.response?.status === 401) {
      throw new Error('OpenRouter API key is invalid or missing. Please check your OPENROUTER_API_KEY in .env.local');
    }
    
    if (error.response?.data) {
      throw new Error(`OpenRouter API error: ${JSON.stringify(error.response.data)}`);
    }
    
    throw new Error(`Failed to get chat completion from OpenRouter: ${error.message}`);
  }
}

