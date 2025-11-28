import { pineconeIndex } from './pinecone';
import { getEmbedding } from './openrouter';
import clientPromise from './mongodb';

export interface KnowledgeBaseItem {
  _id?: string;
  userId: string;
  title: string;
  content: string;
  source: 'file' | 'website';
  sourceUrl?: string;
  fileName?: string;
  vectorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createVector(
  userId: string,
  title: string,
  content: string,
  source: 'file' | 'website',
  sourceUrl?: string,
  fileName?: string
): Promise<KnowledgeBaseItem> {
  // Get embedding
  const embedding = await getEmbedding(content);

  // Create vector in Pinecone
  const vectorId = `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Build metadata object, only including defined optional fields
  const metadata: Record<string, string> = {
    userId,
    title,
    content,
    source,
  };
  
  if (sourceUrl) {
    metadata.sourceUrl = sourceUrl;
  }
  
  if (fileName) {
    metadata.fileName = fileName;
  }
  
  await pineconeIndex.upsert([
    {
      id: vectorId,
      values: embedding,
      metadata,
    },
  ]);

  // Save metadata in MongoDB
  const client = await clientPromise;
  const db = client.db();
  const knowledgeBaseItem = {
    userId,
    title,
    content,
    source,
    sourceUrl,
    fileName,
    vectorId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('knowledge_base').insertOne(knowledgeBaseItem);
  
  return {
    ...knowledgeBaseItem,
    _id: result.insertedId.toString(),
  } as KnowledgeBaseItem;
}

export async function updateVector(
  vectorId: string,
  userId: string,
  title: string,
  content: string
): Promise<KnowledgeBaseItem> {
  // Get new embedding
  const embedding = await getEmbedding(content);

  // Update vector in Pinecone
  await pineconeIndex.upsert([
    {
      id: vectorId,
      values: embedding,
      metadata: {
        userId,
        title,
        content,
      },
    },
  ]);

  // Update metadata in MongoDB
  const client = await clientPromise;
  const db = client.db();
  await db.collection('knowledge_base').updateOne(
    { vectorId, userId },
    {
      $set: {
        title,
        content,
        updatedAt: new Date(),
      },
    }
  );

  const updated = await db.collection('knowledge_base').findOne({ vectorId, userId });
  if (!updated) {
    throw new Error('Vector not found after update');
  }
  return {
    ...updated,
    _id: updated._id.toString(),
  } as KnowledgeBaseItem;
}

export async function deleteVector(vectorId: string, userId: string): Promise<void> {
  // Delete from Pinecone
  await pineconeIndex.deleteMany([vectorId]);

  // Delete from MongoDB
  const client = await clientPromise;
  const db = client.db();
  await db.collection('knowledge_base').deleteOne({ vectorId, userId });
}

export async function searchVectors(
  query: string,
  userId: string,
  topK: number = 5
): Promise<Array<{ content: string; score: number; metadata: any }>> {
  // Get query embedding
  const queryEmbedding = await getEmbedding(query);

  // Search in Pinecone
  const results = await pineconeIndex.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: {
      userId: { $eq: userId },
    } as any,
  });

  // Filter results by userId in case filter didn't work
  const filteredMatches = results.matches.filter((match: any) => 
    match.metadata?.userId === userId
  );

  return filteredMatches.map((match: any) => ({
    content: match.metadata?.content || '',
    score: match.score || 0,
    metadata: match.metadata || {},
  }));
}

export async function getUserVectors(userId: string): Promise<KnowledgeBaseItem[]> {
  const client = await clientPromise;
  const db = client.db();
  const vectors = await db
    .collection('knowledge_base')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return vectors.map((vec: any) => ({
    ...vec,
    _id: vec._id.toString(),
    createdAt: vec.createdAt,
    updatedAt: vec.updatedAt,
  })) as KnowledgeBaseItem[];
}

