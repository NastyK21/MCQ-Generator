import prisma from "../utils/prisma.js";

export default async function mcqHistoryRoutes(fastify) {
  /**
   * @route   POST /api/mcq-history
   * @desc    Save MCQ history for logged-in user
   * @access  Private
   */
  fastify.post("/api/mcq-history", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { question, userAnswer, correctAnswer, isCorrect } = request.body;

      if (!question || !userAnswer || !correctAnswer) {
        return reply.status(400).send({ error: "All fields are required" });
      }

      const newHistory = await prisma.mCQHistory.create({
        data: {
          question,
          userAnswer,
          correctAnswer,
          isCorrect: Boolean(isCorrect),
          userId: request.user.id,
        },
      });

      return reply.status(201).send({ message: "MCQ history saved", data: newHistory });
    } catch (error) {
      console.error("MCQ History Save Error:", error);
      return reply.status(500).send({ error: "Server error" });
    }
  });

  /**
   * @route   GET /api/mcq-history
   * @desc    Get logged-in user's MCQ history
   * @access  Private
   */
  fastify.get("/api/mcq-history", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const history = await prisma.mCQHistory.findMany({
        where: { userId: request.user.id },
        orderBy: { createdAt: "desc" },
      });

      return reply.send(history);
    } catch (error) {
      console.error("MCQ History Fetch Error:", error);
      return reply.status(500).send({ error: "Server error" });
    }
  });
}
