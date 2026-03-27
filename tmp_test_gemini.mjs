import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyC8Pton3rEyJReXSwwD7H8aJS-JJl87fsE";

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are a reflection verifier for a personal growth app. 
A user has submitted a reflection for a specific prompt. 
Your task is to:
1. Check if the reflection is meaningfully related to the prompt.
2. Check if the reflection is "dummy text" or "gibberish" (e.g., random characters like 'asdf', single words repeated many times, or extremely generic, short responses that don't show real reflection like just 'good' or 'hi').

Prompt: "What does freedom mean to you?"
User Reflection: "asdf asdf asdf asdf"

Respond strictly in JSON format with two fields:
- "isValid": boolean
- "reason": string (a short, encouraging explanation if isValid is false, or empty string if true)

Example:
{
  "isValid": false,
  "reason": "Your reflection doesn't seem to address the prompt. Please try to share more specific thoughts related to the topic."
}`;

    console.log("Testing Gemini API with gemini-2.5-flash...");
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    console.log("API Response:");
    console.log(response.text());
  } catch(e) {
    console.error("API Error:");
    console.error(e);
  }
}

run();
