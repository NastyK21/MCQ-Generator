import prisma from '../utils/prisma.js';
import { getEmbedding } from './embeddingService.js';

/**
 * Generate embeddings for text content using local HuggingFace model
 * @param {string} text - Text to generate embeddings for
 * @returns {Promise<Array<number>|null>} - Embedding vector or null if generation fails
 */
export async function generateEmbedding(text) {
  try {
    // Local embedding models can handle longer text, but we'll still limit for performance
    // all-MiniLM-L6-v2 has a max sequence length of 512 tokens (~2000 characters)
    const MAX_TEXT_LENGTH = 2000;
    let textToEmbed = text;
    
    if (text.length > MAX_TEXT_LENGTH) {
      console.warn(`Text too long (${text.length} chars), truncating to ${MAX_TEXT_LENGTH} chars for embedding`);
      textToEmbed = text.substring(0, MAX_TEXT_LENGTH);
    }

    // Skip if text is empty or too short
    if (!textToEmbed || textToEmbed.trim().length === 0) {
      console.warn("Text is empty, skipping embedding generation");
      return null;
    }

    const embedding = await getEmbedding(textToEmbed);
    
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      console.error("Invalid embedding generated");
      return null;
    }
    
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error.message || error);
    // Return null instead of throwing, so upload can continue without embedding
    return null;
  }
}

/**
 * Perform semantic search using vector similarity
 * @param {string} query - Search query text
 * @param {number} userId - User ID for filtering
 * @param {number} topK - Number of results to return (default: 5)
 * @returns {Promise<Array>} - Similar documents with similarity scores
 */
export async function semanticSearch(query, userId, topK = 5) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // If embedding generation failed, return empty results
    if (!queryEmbedding) {
      console.warn("Could not generate query embedding, returning empty results");
      return [];
    }
    
    // Perform vector similarity search using raw SQL
    // PG Vector cosine similarity operator: <=>
    const results = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        content,
        "userId",
        "createdAt",
        "updatedAt",
        (embedding <=> ${queryEmbedding}) AS distance
      FROM "Document" 
      WHERE "userId" = ${userId} AND embedding IS NOT NULL
      ORDER BY distance ASC
      LIMIT ${topK}
    `;
    
    // Convert distance to similarity score (1 - distance for cosine)
    return results.map(doc => ({
      ...doc,
      similarity: 1 - doc.distance,
      distance: undefined // Remove distance field
    }));
  } catch (error) {
    console.error("Semantic search error:", error);
    // Return empty array instead of throwing, so MCQ generation can continue
    return [];
  }
}

/**
 * Find similar documents to a given document
 * @param {number} documentId - Source document ID
 * @param {number} userId - User ID for filtering
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} - Similar documents
 */
export async function findSimilarDocuments(documentId, userId, topK = 5) {
  try {
    // Get the source document
    const sourceDocument = await prisma.document.findUnique({
      where: { id: documentId },
      select: { embedding: true }
    });
    
    if (!sourceDocument || !sourceDocument.embedding) {
      throw new Error("Source document not found or has no embedding");
    }
    
    // Perform similarity search using the document's embedding
    const results = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        content,
        "userId",
        "createdAt",
        "updatedAt",
        (embedding <=> ${sourceDocument.embedding}) AS distance
      FROM "Document" 
      WHERE "userId" = ${userId} AND id != ${documentId}
      ORDER BY distance ASC
      LIMIT ${topK}
    `;
    
    return results.map(doc => ({
      ...doc,
      similarity: 1 - doc.distance,
      distance: undefined
    }));
  } catch (error) {
    console.error("Find similar documents error:", error);
    throw new Error("Failed to find similar documents");
  }
}

/**
 * Update document embedding when content changes
 * @param {number} documentId - Document ID
 * @param {string} content - New content
 * @returns {Promise<void>}
 */
export async function updateDocumentEmbedding(documentId, content) {
  try {
    const embedding = await generateEmbedding(content);
    
    await prisma.document.update({
      where: { id: documentId },
      data: { embedding: embedding }
    });
    
    console.log(`Updated embedding for document ${documentId}`);
  } catch (error) {
    console.error("Error updating document embedding:", error);
    throw new Error("Failed to update document embedding");
  }
}