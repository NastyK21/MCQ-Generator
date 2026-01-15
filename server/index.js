import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import uploadRoutes from './routes/upload.js';
import mcqRoutes from './routes/mcqRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mcqHistoryRoutes from './routes/mcqHistory.js';
import documentRoutes from './routes/documentRoutes.js';
import vectorRoutes from './routes/vectorRoutes.js';
import authPlugin from './plugins/auth.js';

dotenv.config();

const app = Fastify({
  logger: true,
  bodyLimit: 1048576, // 1MB
});

// CORS setup - allow all origins for development
await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Multipart support
await app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

// Register authentication plugin
await app.register(authPlugin);

// Verify authenticate method is available
console.log('Authenticate method available:', typeof app.authenticate === 'function');

// Routes
await app.register(uploadRoutes);
await app.register(mcqRoutes);
await app.register(userRoutes);
await app.register(mcqHistoryRoutes);
await app.register(documentRoutes);
await app.register(vectorRoutes);

app.get('/', async () => {
  return { status: 'MCQ System API is live' };
});

app.get('/test', async () => {
  return { message: 'Server is working correctly' };
});

// Test authentication endpoint
app.get('/test-auth', { preHandler: app.authenticate }, async (request, reply) => {
  console.log('Test auth endpoint - request.user:', request.user);
  return { user: request.user, message: 'Authentication working' };
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen({ port: PORT, host: HOST })
  .then(() => console.log(`✅ Server running on http://${HOST}:${PORT}`))
  .catch(err => {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  });
