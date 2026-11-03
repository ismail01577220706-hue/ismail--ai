import { GoogleGenAI } from '@google/genai';
import { env, hasGeminiKey } from '../config/env.ts';

// Shared server-side Gemini client with required User-Agent telemetry
export const ai = hasGeminiKey
  ? new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface GeminiCallParams {
  systemInstruction?: string;
  prompt: string;
  conversationHistory?: Array<{ role: 'user' | 'model'; parts: string }>;
  model?: string;
}

export async function callGemini(params: GeminiCallParams): Promise<{
  text: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}> {
  const model = params.model || 'gemini-3.8-flash';

  if (!ai || !hasGeminiKey) {
    // Graceful offline simulated response for local/offline verification
    return {
      text: `[ISMAIL AI Local Engine] Received: "${params.prompt}". (Configure GEMINI_API_KEY in Settings/Secrets to connect live Google Gemini 3.8 Flash model).`,
      promptTokens: 12,
      completionTokens: 28,
      totalTokens: 40,
    };
  }

  try {
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (params.conversationHistory && params.conversationHistory.length > 0) {
      for (const turn of params.conversationHistory.slice(-8)) {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.parts }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: params.prompt }],
    });

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: params.systemInstruction,
      },
    });

    const outputText = response.text || 'No response generated.';
    const usageMetadata = response.usageMetadata;

    return {
      text: outputText,
      promptTokens: usageMetadata?.promptTokenCount ?? Math.ceil(params.prompt.length / 4),
      completionTokens: usageMetadata?.candidatesTokenCount ?? Math.ceil(outputText.length / 4),
      totalTokens: usageMetadata?.totalTokenCount ?? (Math.ceil(params.prompt.length / 4) + Math.ceil(outputText.length / 4)),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Gemini API Error]:', errorMsg);

    // Propagate friendly error guidance according to skill guidelines
    if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('PERMISSION_DENIED')) {
      return {
        text: '⚠️ Gemini API Authentication Error: Please check your GEMINI_API_KEY in the Secrets panel or .env file.',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
    }

    if (errorMsg.includes('RESOURCE_EXHAUSTED')) {
      return {
        text: '⚠️ Gemini API Quota Exceeded (429): Free tier limits reached. Please wait a moment or configure a billing-enabled API key in Settings > Secrets.',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
    }

    return {
      text: `⚠️ System Notice: Unable to contact Gemini API (${errorMsg.slice(0, 100)}). Please retry in a few moments.`,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };
  }
}
