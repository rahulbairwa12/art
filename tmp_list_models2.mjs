import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyC8Pton3rEyJReXSwwD7H8aJS-JJl87fsE";

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const models = data.models.map(m => m.name).filter(m => m.includes("flash"));
    console.log(JSON.stringify(models, null, 2));
  } catch(e) {
    console.error(e);
  }
}

run();
