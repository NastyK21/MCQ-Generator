import { semanticSearch, findSimilarDocuments } from "../services/vectorSearch.js";
import prisma from "../utils/prisma.js";

export default async function vectorRoutes(fastify) {
  /**
   * @route POST /api/search/semantic
   * @desc Perform semantic search across user's documents
   * @access Private
   */
  fastify.post("/api/search/semantic", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { query, topK = 5 } = request.body;
      
      if (!query) {
        return reply.status(400).send({ error: "Search query is required" });
      }
      
      const results = await semanticSearch(query, request.user.id, topK);
      
      return reply.send({
        query: query,
        results: results,
        count: results.length
      });
    } catch (error) {
      console.error("Semantic search error:", error);
      return reply.status(500).send({ error: "Failed to perform semantic search" });
    }
  });

  /**
   * @route GET /api/documents/:docId/similar
   * @desc Find documents similar to a given document
   * @access Private
   */
  fastify.get("/api/documents/:docId/similar", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { docId } = request.params;
      const { topK = 5 } = request.query;
      
      // Verify document belongs to user
      const document = await prisma.document.findUnique({
        where: { 
          id: parseInt(docId, 10),
          userId: request.user.id 
        }
      });
      
      if (!document) {
        return reply.status(404).send({ error: "Document not found" });
      }
      
      const similarDocs = await findSimilarDocuments(
        parseInt(docId, 10), 
        request.user.id, 
        parseInt(topK, 10)
      );
      
      return reply.send({
        documentId: docId,
        documentName: document.name,
        similarDocuments: similarDocs,
        count: similarDocs.length
      });
    } catch (error) {
      console.error("Find similar documents error:", error);
      return reply.status(500).send({ error: "Failed to find similar documents" });
    }
  });

  /**
   * @route POST /api/documents/:docId/regenerate-embedding
   * @desc Regenerate embedding for a document (useful if content was updated)
   * @access Private
   */
  fastify.post("/api/documents/:docId/regenerate-embedding", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { docId } = request.params;
      
      // Verify document belongs to user
      const document = await prisma.document.findUnique({
        where: { 
          id: parseInt(docId, 10),
          userId: request.user.id 
        }
      });
      
      if (!document) {
        return reply.status(404).send({ error: "Document not found" });
      }
      
      // Regenerate embedding
      const { updateDocumentEmbedding } = await import("../services/vectorSearch.js");
      await updateDocumentEmbedding(parseInt(docId, 10), document.content);
      
      return reply.send({ 
        message: "Document embedding regenerated successfully",
        documentId: docId 
      });
    } catch (error) {
      console.error("Regenerate embedding error:", error);
      return reply.status(500).send({ error: "Failed to regenerate document embedding" });
    }
  });
}