'use server';

import { model } from '@/lib/gemini';

export async function generateVibeSummary(name: string, category: string, address: string) {
    try {
        const prompt = `
      You are a hyper-local guide for Lakeland, FL. 
      Write a short, punchy, 1-sentence "vibe check" for a business named "${name}" located at "${address}". 
      The category is "${category}".
      
      Rules:
      - Max 150 characters.
      - Be casual but helpful.
      - Mention if it feels "cozy", "upscale", "historic", "hidden gem", etc. based on the name/category.
      - Do NOT use hashtags.
      - Return ONLY the text.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Error generating vibe summary:', error);
        return null;
    }
}
