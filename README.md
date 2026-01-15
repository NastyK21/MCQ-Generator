

---

# MCQ Generator

A full-stack application that generates multiple-choice questions from uploaded documents using AI, with user authentication, quiz history tracking, and semantic search powered by PG Vector.

## Features

- **Document Upload**: Support for PDF, DOCX, and TXT files (DOC support coming soon)
- **AI-Powered MCQ Generation**: Uses Groq AI (Llama 3 70B) to generate questions
- **Semantic Search**: Advanced document search using vector embeddings and PG Vector
- **Contextual MCQ Generation**: Generates questions using content from similar documents for richer context
- **User Authentication**: Secure user registration and login system
- **Quiz History**: Track and review your quiz performance over time
- **Difficulty Levels**: Generate questions with specific difficulty (Easy, Medium, Hard, or Mixed)
- **Responsive UI**: Modern, mobile-friendly interface built with React and Tailwind CSS

## Tech Stack

### Backend
- **Fastify** - High-performance web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database with PG Vector extension
- **PG Vector** - Vector storage and similarity search
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Context API** - State management

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database with PG Vector extension
- Groq API key
- (Optional) OpenAI API key for enhanced embeddings

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mcq_generator"
   JWT_SECRET="your-secret-key"
   GROQ_API_KEY="your-groq-api-key"
   OPENAI_API_KEY="your-openai-api-key-for-embeddings"  # Optional, for enhanced embeddings
   ```

4. Set up the database:
   ```bash
   # Enable PG Vector extension in your PostgreSQL database first
   # Connect to your database and run: CREATE EXTENSION IF NOT EXISTS vector;
   npm run migrate:deploy
   npm run prisma:generate
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your API URL:
   ```
   VITE_API_URL="http://localhost:3001"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Register/Login**: Create an account or sign in to access the application
2. **Upload Document**: Upload a PDF, DOCX, or TXT file (DOC support coming soon)
3. **Semantic Search**: Search documents by meaning using vector embeddings
4. **Generate MCQs**: Choose difficulty level and generate questions with contextual awareness
5. **Take Quiz**: Answer the generated multiple-choice questions
6. **View History**: Review your quiz performance and track progress

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)

### MCQ History
- `POST /api/mcq-history` - Save quiz answer (protected)
- `GET /api/mcq-history` - Get user's quiz history (protected)

### Vector Search
- `POST /api/search/semantic` - Perform semantic search across user's documents
- `GET /api/documents/:docId/similar` - Find documents similar to a given document
- `POST /api/documents/:docId/regenerate-embedding` - Regenerate embedding for a document

### Document Processing
- `POST /upload` - Upload document with intelligent parsing
- `POST /generate-mcq/:docId` - Generate MCQs from document with semantic context
- `POST /api/search/semantic` - Semantic search across documents
- `GET /api/documents/:docId/similar` - Find similar documents
- `POST /api/documents/:docId/regenerate-embedding` - Regenerate document embeddings

## Database Schema

The application uses Prisma with the following main models:
- **User** - User accounts and authentication
- **Document** - Uploaded documents with vector embeddings for semantic search
- **MCQ** - Generated multiple-choice questions
- **MCQHistory** - User quiz performance tracking

## PG Vector Integration

The application leverages PG Vector for advanced semantic search capabilities:
- **Vector Storage**: Document embeddings stored directly in PostgreSQL
- **Cosine Similarity**: Uses PG Vector's `<=>` operator for efficient similarity search
- **Contextual Generation**: Combines content from similar documents for enhanced MCQ generation
- **Real-time Search**: Semantic search across user's document collection

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- CORS configuration
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
