

---

````markdown
# MCQ Generation System

A web-based platform to create, store, and manage Multiple Choice Questions (MCQs) with difficulty levels.  
Built using **React** (frontend) and **Node.js + Express** (backend) with a database (MongoDB/PostgreSQL).

---

## Features

- Create MCQs with **question**, **options**, **correct answer**, and **difficulty level**.
- Difficulty options: `Easy`, `Medium`, `Hard`.
- Store MCQs in a database with proper validation.
- Retrieve and display MCQs with difficulty tags.
- Responsive UI styled with Tailwind CSS.

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Axios (for API requests)

**Backend**
- Node.js + Express
- MongoDB / PostgreSQL (configurable)
- Mongoose / Prisma (ORM depending on DB choice)

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/mcq-generation-system.git
cd mcq-generation-system
````

### 2. Install dependencies

**Frontend**

```bash
cd frontend
npm install
```

**Backend**

```bash
cd backend
npm install
```

---

## Configuration

1. Create a `.env` file in the **backend** folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mcqdb
```

2. Update database credentials as needed.

---

## Running the Application

**Backend**

```bash
cd backend
npm run dev
```

**Frontend**

```bash
cd frontend
npm run dev
```

The frontend will run on **[http://localhost:5173](http://localhost:5173)** and backend on **[http://localhost:5000](http://localhost:5000)**.

---

## API Endpoints

### Create MCQ

```
POST /api/mcqs
```

**Body**

```json
{
  "question": "What is 2+2?",
  "options": ["2", "3", "4", "5"],
  "answer": "4",
  "difficulty": "Easy"
}
```

### Get All MCQs

```
GET /api/mcqs
```

**Response**

```json
[
  {
    "_id": "64f99b2...",
    "question": "What is 2+2?",
    "options": ["2", "3", "4", "5"],
    "answer": "4",
    "difficulty": "Easy"
  }
]
```

---

## Difficulty Level Integration

* **Frontend**: Added a dropdown to select difficulty while creating MCQs.
* **Backend**: Updated schema/model to include `difficulty` with allowed values `Easy`, `Medium`, `Hard`.
* Defaults to `Medium` if not provided.

---

## License

This project is licensed under the MIT License.

```

---

```
