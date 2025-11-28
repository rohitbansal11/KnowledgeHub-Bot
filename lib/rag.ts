import { searchVectors, getUserVectors } from './vector';
import { chatCompletion } from './openrouter';

export async function generateRAGResponse(
  query: string,
  userId: string
): Promise<string> {
  // Search for relevant vectors
  const relevantVectors = await searchVectors(query, userId, 5);

  // If no relevant vectors found or all have very low scores, return message with available topics
  if (relevantVectors.length === 0 || (relevantVectors.length > 0 && relevantVectors[0].score < 0.3)) {
    // Get user's knowledge base items to show available content
    const userItems = await getUserVectors(userId);
    
    if (userItems.length === 0) {
      return "Sorry for the inconvenience, the question you asked is out of the knowledge base. Your knowledge base is currently empty. Please upload some files or scrape websites to add content.";
    }
    
    // Extract brief topic summaries from knowledge base items
    const topicSummaries = userItems
      .slice(0, 10) // Limit to 10 items
      .map((item, idx) => {
        // Get first sentence or first 100 characters as brief summary
        let summary = item.content.trim();
        
        // Try to get first sentence
        const firstSentenceMatch = summary.match(/^[^.!?]+[.!?]/);
        if (firstSentenceMatch) {
          summary = firstSentenceMatch[0].trim();
        }
        
        // If still too long, truncate to 100 characters
        if (summary.length > 100) {
          summary = summary.substring(0, 100).trim() + '...';
        }
        
        return `${idx + 1}. ${summary}`;
      });
    
    const topicsList = topicSummaries.length > 0 
      ? topicSummaries.join('\n')
      : 'No topics available';
    
    return `Sorry for the inconvenience, the question you asked is out of the knowledge base.\n\nI am trained on:\n${topicsList}`;
  }

  // Build context from relevant vectors
  const context = relevantVectors
    .map((vec, index) => `[${index + 1}] ${vec.content}`)
    .join('\n\n');

  // Create prompt with context
  const systemPrompt = `You are a helpful assistant that answers questions based on the provided context from the knowledge base. 
Use only the information from the context to answer questions. 

IMPORTANT: If the context doesn't contain enough information to answer the question, you must respond with exactly this message: "Sorry for the inconvenience, the question you asked is out of the knowledge base."

Do not provide additional explanations, suggestions, or try to answer from general knowledge. Only use the provided context.

Context:
${context}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query },
  ];

  // Get response from OpenRouter
  const response = await chatCompletion(messages);

  // Check if the response indicates lack of information and replace with message including topics
  const lowerResponse = response.toLowerCase();
  if (
    lowerResponse.includes("context doesn't contain") ||
    lowerResponse.includes("context does not contain") ||
    lowerResponse.includes("not enough information") ||
    lowerResponse.includes("doesn't provide") ||
    lowerResponse.includes("does not provide") ||
    (lowerResponse.includes("unfortunately") && lowerResponse.includes("context"))
  ) {
    // Get user's knowledge base items to show available content
    const userItems = await getUserVectors(userId);
    
    if (userItems.length === 0) {
      return "Sorry for the inconvenience, the question you asked is out of the knowledge base. Your knowledge base is currently empty. Please upload some files or scrape websites to add content.";
    }
    
    // Extract brief topic summaries from knowledge base items
    const topicSummaries = userItems
      .slice(0, 10) // Limit to 10 items
      .map((item, idx) => {
        // Get first sentence or first 100 characters as brief summary
        let summary = item.content.trim();
        
        // Try to get first sentence
        const firstSentenceMatch = summary.match(/^[^.!?]+[.!?]/);
        if (firstSentenceMatch) {
          summary = firstSentenceMatch[0].trim();
        }
        
        // If still too long, truncate to 100 characters
        if (summary.length > 100) {
          summary = summary.substring(0, 100).trim() + '...';
        }
        
        return `${idx + 1}. ${summary}`;
      });
    
    const topicsList = topicSummaries.length > 0 
      ? topicSummaries.join('\n')
      : 'No topics available';
    
    return `Sorry for the inconvenience, the question you asked is out of the knowledge base.\n\nI am trained on:\n${topicsList}`;
  }

  return response;
}

