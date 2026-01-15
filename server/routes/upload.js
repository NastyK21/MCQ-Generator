import prisma from "../utils/prisma.js";
import { generateEmbedding } from "../services/vectorSearch.js";
import authenticate from "../middleware/authenticate.js";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export default async function uploadRoutes(fastify) {
  /**
   * @route POST /upload/test
   * @desc Test upload without authentication
   */
  fastify.post("/upload/test", async (request, reply) => {
    try {
      console.log("Test upload request received");
      console.log("Request headers:", request.headers);
      
      const data = await request.file();
      console.log("File data:", data ? { filename: data.filename, mimetype: data.mimetype } : "null");
      
      if (!data) {
        console.log("No file data received");
        return reply.status(400).send({ error: "No file uploaded" });
      }

      // Read file buffer
      const buffer = await data.toBuffer();
      console.log("File buffer size:", buffer.length);
      
      // Convert file buffer to text
      const fileContent = buffer.toString("utf-8");
      console.log("File content length:", fileContent.length);

      return reply.status(200).send({
        message: "Test upload successful",
        filename: data.filename,
        contentLength: fileContent.length
      });
    } catch (error) {
      console.error("Test Upload Error:", error);
      console.error("Error stack:", error.stack);
      return reply.status(500).send({ error: "Failed to upload document" });
    }
  });

  /**
   * @route POST /upload
   * @desc Upload a document and store it in DB
   */
  fastify.post("/upload", { preHandler: authenticate }, async (request, reply) => {
    try {
      console.log("Upload request received");
      console.log("Request user:", request.user);
      console.log("Request headers:", request.headers);
      
      // Check if user is properly authenticated
      console.log("Checking authentication - request.user:", request.user);
      if (!request.user || !request.user.id) {
        console.log("Authentication issue: user object is missing or invalid");
        console.log("Headers sent for this request:", reply.sent);
        return reply.status(401).send({ error: "User not authenticated" });
      }
      
      const data = await request.file();
      console.log("File data:", data ? { filename: data.filename, mimetype: data.mimetype } : "null");
      
      if (!data) {
        console.log("No file data received");
        return reply.status(400).send({ error: "No file uploaded" });
      }

      // Get userId from authenticated user
      const userId = request.user.id;
      console.log("User ID:", userId);

      // Read file buffer
      const buffer = await data.toBuffer();
      console.log("File buffer size:", buffer.length);
      
      // Parse file content based on file type
      let fileContent = "";
      const filename = data.filename.toLowerCase();
      const mimetype = data.mimetype || "";
      
      try {
        if (filename.endsWith(".pdf") || mimetype.includes("pdf")) {
          console.log("Parsing PDF file...");
          const pdfData = await pdfParse(buffer);
          fileContent = pdfData.text;
          console.log("PDF parsed successfully, text length:", fileContent.length);
        } else if (filename.endsWith(".docx") || mimetype.includes("wordprocessingml") || mimetype.includes("docx")) {
          console.log("Parsing DOCX file...");
          const result = await mammoth.extractRawText({ buffer });
          fileContent = result.value;
          console.log("DOCX parsed successfully, text length:", fileContent.length);
        } else if (filename.endsWith(".doc")) {
          return reply.status(400).send({ error: ".doc files are not supported. Please convert to .docx or .pdf" });
        } else {
          // Assume plain text file
          console.log("Treating as plain text file...");
          fileContent = buffer.toString("utf-8");
          console.log("Text file read, length:", fileContent.length);
        }
      } catch (parseError) {
        console.error("File parsing error:", parseError);
        return reply.status(400).send({ error: `Failed to parse file: ${parseError.message}` });
      }

      if (!fileContent || fileContent.trim().length === 0) {
        return reply.status(400).send({ error: "File appears to be empty or could not be parsed" });
      }

      // Generate embedding for the document content (optional)
      console.log("Generating embedding for document...");
      let embedding = null;
      try {
        embedding = await generateEmbedding(fileContent);
        if (embedding) {
          console.log("Embedding generated, dimension:", embedding.length);
        } else {
          console.log("Embedding generation skipped or failed, continuing without embedding");
        }
      } catch (embeddingError) {
        console.warn("Embedding generation failed, continuing without embedding:", embeddingError.message);
        // Continue without embedding - it's optional
      }

      // Store document in DB with embedding (use empty array if embedding generation failed)
      const document = await prisma.document.create({
        data: {
          name: data.filename,
          content: fileContent,
          embedding: embedding && Array.isArray(embedding) && embedding.length > 0 ? embedding : [],
          userId: parseInt(userId, 10),
        },
      });
      console.log("Document created:", { id: document.id, name: document.name });

      return reply.status(201).send({
        id: document.id,
        message: "Document uploaded successfully",
        documentId: document.id,
      });
    } catch (error) {
      console.error("Document Upload Error:", error);
      console.error("Error stack:", error.stack);
      return reply.status(500).send({ error: "Failed to upload document" });
    }
  });

  /**
   * @route GET /documents
   * @desc Get all documents for a user
   */
  fastify.get("/documents", async (request, reply) => {
    try {
      const { userId } = request.query;

      if (!userId) {
        return reply.status(400).send({ error: "Missing userId" });
      }

      const documents = await prisma.document.findMany({
        where: { userId: parseInt(userId, 10) },
        select: { id: true, name: true, createdAt: true },
      });

      return reply.send(documents);
    } catch (error) {
      console.error("Get Documents Error:", error);
      return reply.status(500).send({ error: "Failed to fetch documents" });
    }
  });

  /**
   * @route GET /documents/:id
   * @desc Get a specific document by ID
   */
  fastify.get("/documents/:id", async (request, reply) => {
    try {
      const { id } = request.params;

      const document = await prisma.document.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!document) {
        return reply.status(404).send({ error: "Document not found" });
      }

      return reply.send(document);
    } catch (error) {
      console.error("Get Document Error:", error);
      return reply.status(500).send({ error: "Failed to fetch document" });
    }
  });
}
