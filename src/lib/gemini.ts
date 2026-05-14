import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGeminiClient = () => {
  // Uses Vite environment variables from .env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Please put your actual API key in src/lib/gemini.ts');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Helper function to convert a File object to the generative part format
export async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // FileReader result includes the mime type header, e.g., "data:image/jpeg;base64,..."
      // We need to split to get just the base64 part
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type
    }
  };
}
