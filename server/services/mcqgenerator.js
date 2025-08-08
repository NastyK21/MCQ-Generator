import groq from "../utils/groq.js";

// Constants for token management
const MAX_TOKENS_PER_REQUEST = 4000; // Conservative limit to stay under 6000 TPM
const MAX_CHARACTERS = 30000; // Safeguard for extremely large texts
const CHUNK_OVERLAP = 200; // Characters to overlap between chunks for context

export async function generateMCQsFromText(text, selectedDifficulty = null) {
  // Safeguard against extremely large texts
  if (text.length > MAX_CHARACTERS) {
    throw new Error(`Text too large (${text.length} characters). Maximum allowed is ${MAX_CHARACTERS} characters.`);
  }

  // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
  const estimatedTokens = Math.ceil(text.length / 4);
  
  if (estimatedTokens <= MAX_TOKENS_PER_REQUEST) {
    // Text is small enough to process in one request
    return await processTextChunk(text, selectedDifficulty);
  }

  // Text is too large, need to chunk it
  console.log(`Text is large (${text.length} chars, ~${estimatedTokens} tokens). Chunking into smaller pieces...`);
  
  const chunks = splitTextIntoChunks(text);
  console.log(`Split text into ${chunks.length} chunks`);
  
  const allMCQs = [];
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
    
    try {
      const chunkMCQs = await processTextChunk(chunks[i], selectedDifficulty);
      allMCQs.push(...chunkMCQs);
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      // Continue with other chunks even if one fails
    }
  }

  // Limit total MCQs to reasonable number and ensure variety
  const maxTotalMCQs = 15; // Slightly more than original 10 to account for chunking
  const finalMCQs = allMCQs.slice(0, maxTotalMCQs);
  
  console.log(`Generated ${finalMCQs.length} MCQs from ${chunks.length} chunks`);
  return finalMCQs;
}

async function processTextChunk(text, selectedDifficulty = null) {
  // Build difficulty-specific prompt
  let difficultyInstruction = "";
  if (selectedDifficulty) {
    difficultyInstruction = `
IMPORTANT: Generate ONLY ${selectedDifficulty} difficulty questions.
For ${selectedDifficulty} questions:
${getDifficultyDefinition(selectedDifficulty)}

All questions must be ${selectedDifficulty} difficulty level.`;
  } else {
    difficultyInstruction = `
Generate a mix of difficulty levels:
- "easy": Basic recall questions, simple concepts
- "medium": Application questions, moderate complexity
- "hard": Analysis, synthesis, or complex reasoning questions`;
  }

  const prompt = `
You must respond ONLY with a valid JSON array and nothing else.
Generate 3-5 multiple choice questions from the following text chunk.
Each object must have:
- "question": string
- "options": array of exactly 4 strings
- "answer": one of the options exactly as written
- "difficulty": one of "easy", "medium", or "hard"

${difficultyInstruction}

Text chunk:
"""${text}"""
`;

  const response = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content || "[]";

  // More forgiving regex to extract array
  const match = content.match(/\[[\s\S]*\]/);
  const jsonString = match ? match[0] : "[]";

  try {
    const mcqs = JSON.parse(jsonString);
    
    // Validate and set default difficulty for each MCQ
    return mcqs.map(mcq => ({
      ...mcq,
      difficulty: validateDifficulty(mcq.difficulty) || selectedDifficulty || "medium"
    }));
  } catch (err) {
    console.error("Failed to parse MCQ JSON:", err, content);
    return [];
  }
}

function getDifficultyDefinition(difficulty) {
  switch (difficulty) {
    case "easy":
      return "- Focus on basic facts, definitions, and simple recall\n- Use straightforward language and concepts\n- Test fundamental knowledge and comprehension";
    case "medium":
      return "- Focus on application and understanding\n- Require some analysis or comparison\n- Test ability to apply concepts in new situations";
    case "hard":
      return "- Focus on analysis, synthesis, and evaluation\n- Require complex reasoning and critical thinking\n- Test ability to draw conclusions and make judgments";
    default:
      return "- Mix of different difficulty levels";
  }
}

function splitTextIntoChunks(text) {
  const chunks = [];
  const chunkSize = MAX_TOKENS_PER_REQUEST * 4 - 1000; // Convert tokens to chars, leave buffer for prompt
  
  let start = 0;
  
  while (start < text.length) {
    let end = start + chunkSize;
    
    // If this isn't the last chunk, try to break at a sentence boundary
    if (end < text.length) {
      // Look for sentence endings within the last 500 characters of the chunk
      const searchStart = Math.max(start + chunkSize - 500, start);
      const searchEnd = Math.min(end + 500, text.length);
      const searchText = text.substring(searchStart, searchEnd);
      
      // Find the last sentence ending in this range
      const sentenceEndings = searchText.match(/[.!?]\s+/g);
      if (sentenceEndings) {
        const lastSentenceEnd = searchText.lastIndexOf(sentenceEndings[sentenceEndings.length - 1]);
        if (lastSentenceEnd !== -1) {
          end = searchStart + lastSentenceEnd + 1;
        }
      }
    }
    
    const chunk = text.substring(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    // Move start position, accounting for overlap
    start = end - CHUNK_OVERLAP;
    if (start >= text.length) break;
  }
  
  return chunks;
}

function validateDifficulty(difficulty) {
  const validDifficulties = ["easy", "medium", "hard"];
  return validDifficulties.includes(difficulty?.toLowerCase()) ? difficulty.toLowerCase() : null;
}
