// utils/safeJsonParse.js
export function safeJsonParse(text) {
  try {
    // Find the first `[` and last `]` in the response
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("No JSON array found");
    }

    const jsonString = text.slice(start, end + 1);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to parse JSON:", err.message);
    throw new Error("Invalid JSON format from Gemini");
  }
}
