import { readImage } from './attachments';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGeminiClient = () => {
  // Uses Vite environment variables from .env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Set VITE_GEMINI_API_KEY in your .env.local file and restart the app.');
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function fileToGenerativePart(file: File) {
  const dataUrl = await readImage(file);
  return { inlineData: { data: dataUrl.split(',')[1], mimeType: file.type } };
}
