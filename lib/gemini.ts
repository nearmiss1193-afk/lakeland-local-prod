import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Use the slightly cheaper/faster model for summaries
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
