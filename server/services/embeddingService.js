import { pipeline } from "@xenova/transformers";

let embedder = null;

export async function getEmbedding(text) {
  if (!embedder) {
    console.log("Initializing embedding model (Xenova/all-MiniLM-L6-v2)...");
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("Embedding model initialized successfully");
  }

  try {
    // Generate embedding
    const output = await embedder(text, {
      pooling: "mean",
      normalize: true,
    });

    // The output from @xenova/transformers is a tensor-like object
    // Extract the data array from it
    let embedding;
    if (output && typeof output.data === 'function') {
      // If it's a tensor with a data() method
      embedding = await output.data();
    } else if (output && output.data) {
      // If data is already available
      embedding = output.data;
    } else if (Array.isArray(output)) {
      // If it's already an array
      embedding = output;
    } else {
      // Try to convert to array
      embedding = await output.array();
    }

    // Ensure we return a flat array of numbers
    const flatArray = Array.isArray(embedding) && Array.isArray(embedding[0]) 
      ? embedding[0] 
      : embedding;
    
    return Array.from(flatArray);
  } catch (error) {
    console.error("Error in getEmbedding:", error);
    throw error;
  }
}
