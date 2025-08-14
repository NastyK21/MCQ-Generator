

---

# MCQ Generator

A full-stack application that generates multiple-choice questions from uploaded documents using AI, with user authentication and quiz history tracking.

## Features

- **Document Upload**: Support for PDF, DOC, DOCX, and TXT files
- **AI-Powered MCQ Generation**: Uses Google Gemini and Groq AI to generate questions
- **User Authentication**: Secure user registration and login system
- **Quiz History**: Track and review your quiz performance over time
- **Difficulty Levels**: Generate questions with specific difficulty (Easy, Medium, Hard, or Mixed)
- **Responsive UI**: Modern, mobile-friendly interface built with React and Tailwind CSS

## Tech Stack

### Backend
- **Fastify** - High-performance web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
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
- PostgreSQL database
- Google Gemini API key
- Groq API key

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
   GEMINI_API_KEY="your-gemini-api-key"
   GROQ_API_KEY="your-groq-api-key"
   ```

4. Set up the database:
   ```bash
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
2. **Upload Document**: Upload a PDF, DOC, DOCX, or TXT file
3. **Generate MCQs**: Choose difficulty level and generate questions
4. **Take Quiz**: Answer the generated multiple-choice questions
5. **View History**: Review your quiz performance and track progress

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)

### MCQ History
- `POST /api/mcq-history` - Save quiz answer (protected)
- `GET /api/mcq-history` - Get user's quiz history (protected)

### Document Processing
- `POST /upload` - Upload document
- `POST /generate-mcq/:docId` - Generate MCQs from document

## Database Schema

The application uses Prisma with the following main models:
- **User** - User accounts and authentication
- **Document** - Uploaded documents
- **MCQ** - Generated multiple-choice questions
- **MCQHistory** - User quiz performance tracking

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
