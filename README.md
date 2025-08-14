

---

# MCQ Generator

A full-stack application for generating, storing, and serving multiple-choice questions with difficulty levels.

---

## Features

* Generate MCQs with AI-powered prompts.
* Classify MCQs by difficulty: Easy, Medium, Hard.
* Backend validation with PostgreSQL & Prisma.
* Serve MCQs through REST API.
* Frontend display with difficulty badges.
* Deployable backend and frontend.

---

## Tech Stack

**Frontend**

* Vite + React
* Tailwind CSS

**Backend**

* Node.js + Express
* Prisma ORM
* PostgreSQL

**Deployment**

* Render (Backend & Frontend)
* Railway (Database)

---

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/mcq-generator.git
cd mcq-generator
```

### 2. Install Dependencies

```bash
cd client
npm install
cd ../api
npm install
```

### 3. Environment Variables

Create `.env` files for both frontend and backend.

**Frontend (`client/.env`):**

```
VITE_API_URL_LOCAL=your_local_backend_url
VITE_API_URL=your_production_backend_url
```

**Backend (`api/.env`):**

```
DATABASE_URL=your_postgresql_connection_string
```

*(Do not commit `.env` files — ensure `.env` is in `.gitignore`)*

---

### 4. Development

Run backend:

```bash
cd api
npm run dev
```

Run frontend:

```bash
cd client
npm run dev
```

---

### 5. Deployment

* Deploy backend to Render.
* Deploy frontend to Render (or preferred hosting).
* Use environment variables for API URLs — never hardcode them.

---

## License

MIT License © 2025 Your Name

---



