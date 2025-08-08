// routes/mcqRoutes.js
import { prisma } from '../utils/prisma.js';
import { generateMCQsFromText } from '../services/mcqgenerator.js';

export default async function registerMCQRoutes(app) {
  // Generate MCQs
  app.post("/generate-mcq/:id", async (req, reply) => {
    const docId = parseInt(req.params.id);
    const { difficulty } = req.body; // Get difficulty from request body

    // Validate document ID
    if (isNaN(docId) || docId <= 0) {
      return reply.code(400).send({ error: "Invalid document ID" });
    }

    // Validate difficulty
    const validDifficulties = ["easy", "medium", "hard"];
    const selectedDifficulty = difficulty?.toLowerCase();
    
    if (selectedDifficulty && !validDifficulties.includes(selectedDifficulty)) {
      return reply.code(400).send({ 
        error: "Invalid difficulty level. Must be 'easy', 'medium', or 'hard'" 
      });
    }

    try {
      const document = await prisma.document.findUnique({
        where: { id: docId },
      });

      if (!document) {
        return reply.code(404).send({ error: "Document not found" });
      }

      // Validate document content
      if (!document.content || document.content.trim().length === 0) {
        return reply.code(400).send({ error: "Document has no readable content" });
      }

      const mcqs = await generateMCQsFromText(document.content, selectedDifficulty);

      if (!Array.isArray(mcqs) || mcqs.length === 0) {
        return reply.code(400).send({ error: "No MCQs generated from this document" });
      }

      // Validate MCQ structure before saving
      const validMcqs = mcqs.filter(mcq => {
        return mcq.question && 
               Array.isArray(mcq.options) && 
               mcq.options.length === 4 && 
               mcq.answer && 
               mcq.options.includes(mcq.answer);
      });

      if (validMcqs.length === 0) {
        return reply.code(400).send({ error: "No valid MCQs generated" });
      }

      await prisma.mCQ.createMany({
        data: validMcqs.map((mcq) => ({
          question: mcq.question,
          options: mcq.options,
          answer: mcq.answer,
          difficulty: mcq.difficulty || selectedDifficulty || "medium", // Use selected difficulty or default
          documentId: docId,
        })),
      });

      return reply.send({ 
        message: "MCQs generated successfully", 
        mcqs: validMcqs,
        selectedDifficulty: selectedDifficulty || "mixed"
      });
    } catch (err) {
      app.log.error("Error generating/saving MCQs:", err);
      return reply.code(500).send({ error: "MCQ generation failed" });
    }
  });

  // Fetch MCQs by document ID
  app.get("/mcqs/:id", async (req, reply) => {
    const docId = parseInt(req.params.id);

    if (isNaN(docId) || docId <= 0) {
      return reply.code(400).send({ error: "Invalid document ID" });
    }

    try {
      const mcqs = await prisma.mCQ.findMany({
        where: { documentId: docId },
        orderBy: [
          { difficulty: 'asc' }, // Order by difficulty: easy, medium, hard
          { id: 'asc' }
        ]
      });

      if (!mcqs.length) {
        return reply.code(404).send({ error: "No MCQs found for this document" });
      }

      return reply.send({ documentId: docId, mcqs });
    } catch (err) {
      app.log.error("Error fetching MCQs:", err);
      return reply.code(500).send({ error: "Failed to fetch MCQs" });
    }
  });

  // Fetch MCQs by document ID and difficulty
  app.get("/mcqs/:id/difficulty/:difficulty", async (req, reply) => {
    const docId = parseInt(req.params.id);
    const difficulty = req.params.difficulty.toLowerCase();

    if (isNaN(docId) || docId <= 0) {
      return reply.code(400).send({ error: "Invalid document ID" });
    }

    // Validate difficulty
    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(difficulty)) {
      return reply.code(400).send({ error: "Invalid difficulty level" });
    }

    try {
      const mcqs = await prisma.mCQ.findMany({
        where: { 
          documentId: docId,
          difficulty: difficulty
        },
        orderBy: { id: 'asc' }
      });

      if (!mcqs.length) {
        return reply.code(404).send({ error: `No ${difficulty} MCQs found for this document` });
      }

      return reply.send({ documentId: docId, difficulty, mcqs });
    } catch (err) {
      app.log.error("Error fetching MCQs by difficulty:", err);
      return reply.code(500).send({ error: "Failed to fetch MCQs" });
    }
  });
}
