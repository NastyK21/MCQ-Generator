import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import registerUploadRoutes from './routes/upload.js';
import registerMcqRoutes from './routes/mcqRoutes.js';

dotenv.config();

const app = Fastify();

// Parse allowed origins from env (comma-separated list)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['*'];

// CORS setup
await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'), false);
    }
  }
});

// Multipart support
await app.register(multipart);

// Routes
await registerUploadRoutes(app);
await registerMcqRoutes(app);

app.get('/', async () => {
  return { status: 'MCQ System API is live' };
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen({ port: PORT, host: HOST })
  .then(() => console.log(`✅ Server running on http://${HOST}:${PORT}`))
  .catch(err => {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  });
