import { GoogleGenAI } from "@google/genai";
import { GenerationResult, ImageData } from "../types";

/**
 * Generates content based on an image and a text prompt using Gemini models.
 * Supports dynamic Model selection.
 * Now supports an optional style reference image and a mask image for editing.
 */
export const generateImageFromReference = async (
  base64Data: string,
  mimeType: string,
  prompt: string,
  modelName: string,
  styleImageData?: ImageData | null,
  maskImageData?: string | null
): Promise<GenerationResult> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please ensure it is configured in the environment.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Clean base64 string for main image
    const cleanBase64 = base64Data.replace(/^data:image\/(png|jpeg|jpg|webp|heic);base64,/, "");

    // Prepare content parts
    // Consolidate text into a single prompt block to ensure image generation models handle it better
    let fullPrompt = prompt || "Enhance this image and make it look stunning, high resolution.";
    fullPrompt += "\n\nMain Image Instructions: Use the provided image below as the main source for structure and composition. Strictly preserve its geometry.";
    
    if (maskImageData) {
      fullPrompt += "\n\nEditing Instructions: A MASK image is provided below. The colored strokes on the mask indicate exactly where you should edit or change the image based on the prompt. Keep the rest of the image unchanged.";
    }

    if (styleImageData) {
       fullPrompt += "\n\nStyle Reference Instructions: A second image is provided below. Extract the atmosphere, landscape/terrain, lighting, and materials from this reference image and apply them to the main image structure.";
    }

    const parts: any[] = [
      { text: fullPrompt },
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      },
    ];

    // Add Mask Image if provided
    if (maskImageData) {
      const cleanMaskBase64 = maskImageData.replace(/^data:image\/(png|jpeg|jpg|webp|heic);base64,/, "");
      parts.push({
        inlineData: {
          data: cleanMaskBase64,
          mimeType: "image/png",
        },
      });
    }

    // Add style reference image if provided
    if (styleImageData) {
      const cleanStyleBase64 = styleImageData.base64.replace(/^data:image\/(png|jpeg|jpg|webp|heic);base64,/, "");
      parts.push({
        inlineData: {
          data: cleanStyleBase64,
          mimeType: styleImageData.mimeType,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: parts,
      },
      // Configuration strictly adhering to guidelines
      config: {
        // No thinkingConfig for these image models usually, but valid to leave empty
      },
    });

    let resultImageUrl: string | undefined;
    let resultText: string | undefined;

    // Iterate through parts to find the generated image or text
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            resultImageUrl = `data:image/png;base64,${base64EncodeString}`;
          } else if (part.text) {
            resultText = part.text;
          }
        }
      }
    }

    if (!resultImageUrl && !resultText) {
      throw new Error("No image generated. The model might have blocked the request due to safety filters, or the selected model does not support image output.");
    }

    return {
      imageUrl: resultImageUrl,
      text: resultText
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Enhanced Error Handling for common Gemini API codes
    const status = error.status || error.response?.status;
    const message = error.message || error.toString();

    // 429: Resource Exhausted / Rate Limit
    if (status === 429 || message.includes('429') || message.includes('quota') || message.includes('exhausted')) {
      throw new Error("⚠️ Rate Limit Exceeded (429): You are sending requests too quickly. Please wait a moment and try again.");
    }

    // 403: Permission Denied
    if (status === 403 || message.includes('403') || message.includes('permission')) {
      throw new Error("⚠️ Permission Denied (403): Your API Key may be invalid or does not have access to this model. If using 'Pro' model, try switching to 'Flash' or update your API key.");
    }

    // 503: Service Unavailable
    if (status === 503 || message.includes('503')) {
       throw new Error("⚠️ Service Unavailable (503): The AI service is currently overloaded. Please try again in a few minutes.");
    }

    // Fallback generic error
    throw new Error(message || "An unexpected error occurred during generation.");
  }
};

/**
 * Enhances a simple prompt into a more descriptive and optimized prompt for image generation.
 */
export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      // If no API key, just return original prompt to avoid crashing if checking internally
      return originalPrompt;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert prompt engineer for architectural and interior design AI rendering. 
      Rewrite the following user prompt to be more descriptive, detailed, and artistic, maximizing the quality of the generated image. 
      Keep the original intent but add necessary details about lighting, textures, atmosphere, and composition. 
      
      User Prompt: "${originalPrompt}"
      
      Return ONLY the enhanced prompt text.`,
    });

    return response.text || originalPrompt;
  } catch (error) {
    console.warn("Prompt enhancement failed, using original prompt:", error);
    return originalPrompt;
  }
};
