import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('Please add your Pinecone API key to .env.local');
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX_NAME || 'knowledgehub-bot';

// Function to ensure index exists, create if it doesn't
export async function ensureIndexExists() {
  try {
    // First, try to describe the index to see if it exists
    try {
      const indexDescription = await pinecone.describeIndex(indexName);
      if (indexDescription.status?.ready) {
        // Index exists and is ready
        return;
      } else {
        console.log(`Index "${indexName}" exists but is not ready yet. Waiting...`);
        // Wait for it to be ready
        let ready = false;
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds
        
        while (!ready && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            const desc = await pinecone.describeIndex(indexName);
            if (desc.status?.ready) {
              ready = true;
              console.log(`Index "${indexName}" is now ready!`);
            }
          } catch (e) {
            // Continue waiting
          }
          attempts++;
        }
        
        if (!ready) {
          throw new Error(`Index "${indexName}" is not ready. Please wait a few minutes and try again.`);
        }
        return;
      }
    } catch (describeError: any) {
      // Index doesn't exist (404 or similar), create it
      if (describeError.message?.includes('404') || describeError.message?.includes('not found')) {
        console.log(`Index "${indexName}" not found. Creating it...`);
        
        // BGE-M3 embedding model uses 1024 dimensions
        const dimension = 1024;
        
        try {
          await pinecone.createIndex({
            name: indexName,
            dimension: dimension,
            metric: 'cosine',
            spec: {
              serverless: {
                cloud: 'aws',
                region: 'us-east-1',
              },
            },
          });
          
          console.log(`Index "${indexName}" created successfully. Waiting for it to be ready...`);
          
          // Wait for index to be ready (polling)
          let ready = false;
          let attempts = 0;
          const maxAttempts = 60; // 60 seconds
          
          while (!ready && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            try {
              const indexDescription = await pinecone.describeIndex(indexName);
              if (indexDescription.status?.ready) {
                ready = true;
                console.log(`Index "${indexName}" is ready!`);
              }
            } catch (e) {
              // Index not ready yet, continue polling
            }
            attempts++;
          }
          
          if (!ready) {
            throw new Error(`Index "${indexName}" was created but is not ready yet. Please wait a few minutes and try again, or create it manually at https://app.pinecone.io`);
          }
        } catch (createError: any) {
          // If error is about index already existing, that's fine - it might have been created between checks
          if (createError.message?.includes('already exists') || createError.message?.includes('Conflict')) {
            console.log(`Index "${indexName}" already exists (created by another process).`);
            // Wait a bit and check if it's ready
            await new Promise(resolve => setTimeout(resolve, 2000));
            const desc = await pinecone.describeIndex(indexName);
            if (!desc.status?.ready) {
              throw new Error(`Index "${indexName}" exists but is not ready. Please wait a few minutes.`);
            }
          } else {
            throw createError;
          }
        }
      } else {
        // Some other error
        throw describeError;
      }
    }
  } catch (error: any) {
    console.error('Error ensuring index exists:', error);
    throw new Error(`Failed to ensure Pinecone index exists: ${error.message}. Please create the index "${indexName}" manually in the Pinecone console at https://app.pinecone.io with dimension 1024.`);
  }
}

export const pineconeIndex = pinecone.index(indexName);

export default pinecone;

