import { Groq } from "groq-sdk";
import 'dotenv/config';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  throw new Error('GROQ_API_KEY environment variable is required');
}

const groq = new Groq({
  apiKey,
});

export default groq;