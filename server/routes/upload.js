import multer from 'fastify-multer';
import fs from 'fs';
import path from 'path';
import { prisma } from '../utils/prisma.js';
const pdfParse = (await import('pdf-parse')).default;
import mammoth from 'mammoth';

// Multer with 30MB file size limit
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB
});

export default async function registerUploadRoutes(app) {
  // Ensure the uploads folder exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  app.post('/upload', { preHandler: upload.single('file') }, async (req, reply) => {
    try {
      const file = req.file;
      if (!file) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      // Manual validation (extra safety)
      const maxSize = 30 * 1024 * 1024; // 30MB
      if (file.size > maxSize) {
        fs.unlinkSync(file.path);
        return reply.code(400).send({ error: 'File too large. Maximum size is 30MB.' });
      }

      const ext = path.extname(file.originalname).toLowerCase();
      const allowedTypes = ['.pdf', '.docx', '.txt'];
      if (!allowedTypes.includes(ext)) {
        fs.unlinkSync(file.path);
        return reply.code(400).send({ error: 'Unsupported file type. Only PDF, DOCX, and TXT files are supported.' });
      }

      let content = '';
      try {
        if (ext === '.pdf') {
          const dataBuffer = fs.readFileSync(file.path);
          const pdfData = await pdfParse(dataBuffer);
          content = pdfData.text;
        } else if (ext === '.docx') {
          const result = await mammoth.extractRawText({ path: file.path });
          content = result.value;
        } else if (ext === '.txt') {
          content = fs.readFileSync(file.path, 'utf-8');
        }

        if (!content || content.trim().length === 0) {
          fs.unlinkSync(file.path);
          return reply.code(400).send({ error: 'No readable text found in the uploaded file.' });
        }

        content = content.trim().replace(/\s+/g, ' ');

        const doc = await prisma.document.create({
          data: {
            name: file.originalname,
            content,
          },
        });

        fs.unlinkSync(file.path);
        reply.send({ id: doc.id, message: 'Upload and parsing successful' });

      } catch (parseError) {
        fs.unlinkSync(file.path);
        app.log.error('File parsing error:', parseError);
        return reply.code(400).send({ error: 'Failed to parse file content. Please ensure the file is not corrupted.' });
      }

    } catch (err) {
      app.log.error('Upload error:', err);
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      reply.code(500).send({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
      });
    }
  });
}
