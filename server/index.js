import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import registerUploadRoutes from './routes/upload.js';
import registerMcqRoutes from './routes/mcqRoutes.js';

const app = Fastify();

await app.register(cors, { origin: '*' });
await app.register(multipart);

await registerUploadRoutes(app);
await registerMcqRoutes(app); // register MCQ routes

app.get('/', async () => {
  return { status: 'MCQ System API is live' };
});

await app.listen({ port: 3001 });
console.log('Server running on http://localhost:3001');
