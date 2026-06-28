import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIProvider = "groq" | "gemini";

export interface GenerateOptions {
  provider?: AIProvider;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Resilient AI wrapper that defaults to Groq and falls back to Gemini
 * on any failures (rate limits, timeouts, API issues).
 * Both providers are configured to enforce JSON output.
 */
export async function generateWithAi(prompt: string, options?: GenerateOptions): Promise<string> {
  let provider = options?.provider || "groq";

  try {
    if (provider === "groq") {
      return await callGroq(prompt, options);
    } else {
      return await callGemini(prompt, options);
    }
  } catch (error) {
    console.warn(`[AI Engine] ${provider} failed. Attempting fallback...`, error);
    try {
      if (provider === "groq") {
        return await callGemini(prompt, options);
      } else {
        return await callGroq(prompt, options);
      }
    } catch (fallbackError) {
      console.error(`[AI Engine] Both providers failed!`, fallbackError);
      throw new Error("AI Generation completely failed.");
    }
  }
}

async function callGroq(prompt: string, options?: GenerateOptions): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
  
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const messages: any[] = [];
  
  if (options?.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  
  messages.push({ role: "user", content: prompt });

  const completion = await groq.chat.completions.create({
    messages,
    model: "openai/gpt-oss-20b", 
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
    response_format: { type: "json_object" }
  });

  return completion.choices[0]?.message?.content || "{}";
}

async function callGemini(prompt: string, options?: GenerateOptions): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
  
  // Combine system instructions since Gemini flash uses single string prompts often
  let fullPrompt = prompt;
  if (options?.systemPrompt) {
    fullPrompt = `SYSTEM INSTRUCTIONS (STRICTLY ADHERE TO THESE):\n${options.systemPrompt}\n\nUSER PROMPT:\n${prompt}`;
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 2048,
      responseMimeType: "application/json"
    }
  });

  return result.response.text();
}
