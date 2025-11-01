
import { GoogleGenAI, Modality, GenerateContentResponse, Chat } from "@google/genai";

const getGenAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const base64ToGenerativePart = (base64Data: string, mimeType: string) => {
    return {
        inlineData: { data: base64Data, mimeType },
    };
};

export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const ai = getGenAI();
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("No image data found in the response");
};

export const generateVideo = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  onProgress: (message: string) => void
): Promise<string> => {
  const ai = getGenAI();
  onProgress('Starting video generation...');
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: {
      imageBytes: base64Image,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  onProgress('Operation initiated. Waiting for completion... This can take a few minutes.');
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    onProgress('Checking operation status...');
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  onProgress('Video generation complete!');
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Video generation failed or no URI returned.');
  }

  onProgress('Fetching video...');
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
  }
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};


export const createChat = (systemInstruction?: string): Chat => {
    const ai = getGenAI();
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: systemInstruction ? { systemInstruction } : undefined,
    });
};

export const createProChat = (systemInstruction?: string): Chat => {
    const ai = getGenAI();
    return ai.chats.create({
        model: 'gemini-2.5-pro',
        config: systemInstruction ? { systemInstruction } : undefined,
    });
};
