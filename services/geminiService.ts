
import { GoogleGenAI } from "@google/genai";
import { GenerationResult, ImageData } from "../types";

/**
 * Generates content based on an image and a text prompt using Gemini models.
 * Supports dynamic Model selection.
 * Now supports an optional style reference image.
 */
export const generateImageFromReference = async (
  base64Data: string,
  mimeType: string,
  prompt: string,
  modelName: string,
  styleImageData?: ImageData | null
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
    
    if (styleImageData) {
       fullPrompt += "\n\nStyle Reference Instructions: A second image is provided below as a style reference. Extract the atmosphere, landscape/terrain, lighting, and materials from this reference image and apply them to the main image structure.";
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

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
