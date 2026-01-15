import prisma from "../utils/prisma.js";
import { generateMCQsFromText } from "../services/mcqgenerator.js";
import { semanticSearch } from "../services/vectorSearch.js";

export default async function mcqRoutes(fastify) {
  /**
   * @route GET /mcqs
   * @desc Get all MCQs for the logged-in user
   * @access Private
   */
  fastify.get("/mcqs", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const mcqs = await prisma.mCQ.findMany({
        where: { 
          document: {
            userId: request.user.id
          }
        },
        include: { document: true },
      });

      return reply.send(mcqs);
    } catch (error) {
      console.error("Error fetching MCQs:", error);
      return reply.status(500).send({ error: "Failed to fetch MCQs" });
    }
  });

  /**
   * @route GET /mcqs/:id
   * @desc Get a single MCQ by ID
   * @access Private
   */
  fastify.get("/mcqs/:id", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const mcq = await prisma.mCQ.findFirst({
        where: {
          id: parseInt(request.params.id, 10),
          document: {
            userId: request.user.id
          }
        },
        include: { document: true },
      });

      if (!mcq) {
        return reply.status(404).send({ error: "MCQ not found" });
      }

      return reply.send(mcq);
    } catch (error) {
      console.error("Error fetching MCQ:", error);
      return reply.status(500).send({ error: "Failed to fetch MCQ" });
    }
  });

  /**
   * @route POST /mcqs
   * @desc Create a new MCQ for a document
   * @access Private
   */
  fastify.post("/mcqs", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { question, options, answer, difficulty, documentId } = request.body;

      // Verify document belongs to user
      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          userId: request.user.id
        }
      });

      if (!document) {
        return reply.status(404).send({ error: "Document not found or access denied" });
      }

      const mcq = await prisma.mCQ.create({
        data: {
          question,
          options,
          answer,
          difficulty,
          documentId,
        },
      });

      return reply.status(201).send(mcq);
    } catch (error) {
      console.error("Error creating MCQ:", error);
      return reply.status(500).send({ error: "Failed to create MCQ" });
    }
  });

  /**
   * @route DELETE /mcqs/:id
   * @desc Delete an MCQ by ID
   * @access Private
   */
  fastify.delete("/mcqs/:id", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      // First verify the MCQ belongs to the user through document relation
      const mcq = await prisma.mCQ.findFirst({
        where: {
          id: parseInt(request.params.id, 10),
          document: {
            userId: request.user.id
          }
        }
      });

      if (!mcq) {
        return reply.status(404).send({ error: "MCQ not found or access denied" });
      }

      await prisma.mCQ.delete({
        where: {
          id: parseInt(request.params.id, 10),
        },
      });

      return reply.send({ message: "MCQ deleted successfully" });
    } catch (error) {
      console.error("Error deleting MCQ:", error);
      return reply.status(500).send({ error: "Failed to delete MCQ" });
    }
  });

  /**
   * @route POST /generate-mcq/:docId
   * @desc Generate MCQs from a document using semantic search for context
   * @access Private
   */
  fastify.post("/generate-mcq/:docId", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { docId } = request.params;
      const { difficulty, useSemanticSearch = true } = request.body;

      // Get the main document
      const mainDocument = await prisma.document.findUnique({
        where: { 
          id: parseInt(docId, 10),
          userId: request.user.id 
        },
      });

      if (!mainDocument) {
        return reply.status(404).send({ error: "Document not found" });
      }

      let contentForGeneration = mainDocument.content;

      // If semantic search is enabled, find similar documents for better context
      if (useSemanticSearch && mainDocument.embedding) {
        console.log("Using semantic search to enhance MCQ generation context...");
        try {
          const similarDocuments = await semanticSearch(mainDocument.content, request.user.id, 3);
          
          if (similarDocuments.length > 0) {
            // Combine content from similar documents for richer context
            const combinedContent = [
              mainDocument.content,
              ...similarDocuments.map(doc => doc.content)
            ].join("\n\n---\n\n");
            
            contentForGeneration = combinedContent;
            console.log(`Enhanced context with ${similarDocuments.length} similar documents`);
          }
        } catch (semanticError) {
          console.warn("Semantic search failed, falling back to document-only generation:", semanticError.message);
          // Continue with just the main document content
        }
      }

      // Generate MCQs using the AI service
      const generatedMCQs = await generateMCQsFromText(contentForGeneration, difficulty);

      if (!generatedMCQs || generatedMCQs.length === 0) {
        return reply.status(400).send({ error: "No MCQs could be generated from this document" });
      }

      // Save generated MCQs to database
      const createdMCQs = [];
      for (const mcqData of generatedMCQs) {
        const mcq = await prisma.mCQ.create({
          data: {
            question: mcqData.question,
            options: mcqData.options,
            answer: mcqData.answer,
            difficulty: mcqData.difficulty,
            documentId: parseInt(docId, 10),
          },
        });
        createdMCQs.push(mcq);
      }

      console.log(`Generated and saved ${createdMCQs.length} MCQs for document ${docId}`);
      return reply.status(201).send({ 
        mcqs: createdMCQs,
        message: `Successfully generated ${createdMCQs.length} MCQs` 
      });
    } catch (error) {
      console.error("Error generating MCQs:", error);
      return reply.status(500).send({ error: "Failed to generate MCQs", details: error.message });
    }
  });
}
