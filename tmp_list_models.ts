import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log("Model initialized.");
  // Let's list models using REST API since SDK doesn't expose it directly in a simple way
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  console.log(JSON.stringify(data.models.map((m: any) => m.name), null, 2));
}

run().catch(console.error);
