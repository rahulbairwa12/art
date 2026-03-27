import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function verifyReflectionWithAI(prompt: string, reflection: string): Promise<{ isValid: boolean; reason?: string }> {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI verification.");
    return { isValid: true }; // Fallback to basic validation if API key is missing
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are a reflection verifier for a personal growth app. 
A user has submitted a reflection for a specific prompt. 
Your task is to:
1. Check if the reflection is meaningfully related to the prompt.
2. Check if the reflection is "dummy text" or "gibberish" (e.g., random characters like 'asdf', single words repeated many times, or extremely generic, short responses that don't show real reflection like just 'good' or 'hi').

Prompt: "${prompt}"
User Reflection: "${reflection}"

Respond strictly in JSON format with two fields:
- "isValid": boolean
- "reason": string (a short, encouraging explanation if isValid is false, or empty string if true)

Example:
{
  "isValid": false,
  "reason": "Your reflection doesn't seem to address the prompt. Please try to share more specific thoughts related to the topic."
}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handling potential markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        isValid: data.isValid,
        reason: data.reason || "Please write a more thoughtful reflection related to the prompt."
      };
    }
    
    return { isValid: true }; // Default to true if AI response is weird
  } catch (error) {
    console.error("Gemini verification error:", error);
    return { isValid: true }; // Fallback to true on API error to not block users
  }
}
