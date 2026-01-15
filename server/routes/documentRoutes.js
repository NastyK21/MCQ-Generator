import prisma from "../utils/prisma.js";

export default async function documentRoutes(fastify) {
  /**
   * @route   POST /api/documents
   * @desc    Save uploaded document details for logged-in user
   * @access  Private
   */
  fastify.post("/api/documents", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { name, content, embedding } = request.body;

      if (!name || !content) {
        return reply.status(400).send({ error: "Name and content are required" });
      }

      const document = await prisma.document.create({
        data: {
          name,
          content,
          embedding: embedding || null,
          userId: request.user.id,
        },
      });

      return reply.status(201).send({ message: "Document saved", data: document });
    } catch (error) {
      console.error("Document Save Error:", error);
      return reply.status(500).send({ error: "Server error" });
    }
  });

  /**
   * @route   GET /api/documents
   * @desc    Get all documents uploaded by the logged-in user
   * @access  Private
   */
  fastify.get("/api/documents", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const documents = await prisma.document.findMany({
        where: { userId: request.user.id },
        orderBy: { createdAt: "desc" },
      });

      return reply.send(documents);
    } catch (error) {
      console.error("Document Fetch Error:", error);
      return reply.status(500).send({ error: "Server error" });
    }
  });

  /**
   * @route   DELETE /api/documents/:id
   * @desc    Delete a document by ID
   * @access  Private
   */
  fastify.delete("/api/documents/:id", { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const document = await prisma.document.findUnique({
        where: { id: parseInt(request.params.id) },
      });

      if (!document || document.userId !== request.user.id) {
        return reply.status(404).send({ error: "Document not found" });
      }

      await prisma.document.delete({
        where: { id: document.id },
      });

      return reply.send({ message: "Document deleted" });
    } catch (error) {
      console.error("Document Delete Error:", error);
      return reply.status(500).send({ error: "Server error" });
    }
  });
}
