import { CactusLM } from 'cactus-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VISION_MODEL = 'lfm2-vl-450m';
const VISION_MODEL_DOWNLOADED_KEY = `speakeasy_vision_model_downloaded_${VISION_MODEL}`;

let cactus: CactusLM | null = null;

export interface VisionResult {
  description: string;
}

export const initVisionModel = async (onProgress?: (progress: number) => void) => {
  if (cactus) return;
  
  console.log('Initializing SpeakEasy vision model...');
  cactus = new CactusLM({ model: VISION_MODEL });
  
  // Check if already downloaded
  const isDownloaded = await AsyncStorage.getItem(VISION_MODEL_DOWNLOADED_KEY);
  
  if (isDownloaded !== 'true') {
    console.log('Downloading vision model...');
    await cactus.download();
    await AsyncStorage.setItem(VISION_MODEL_DOWNLOADED_KEY, 'true');
  }
  
  await cactus.init();
  console.log('Vision model initialized successfully');
};

export const analyzeScene = async (imageUri: string, userQuestion?: string): Promise<VisionResult> => {
  if (!cactus) {
    await initVisionModel();
  }

  let prompt: string;
  
  if (userQuestion && userQuestion.trim().length > 0) {
    // User asked a specific question about the scene
    prompt = `Look at this image and answer the following question: "${userQuestion}"
    
Be specific and detailed in your answer. If the question asks about colors, describe the exact colors you see. If it asks about objects, identify them clearly. If it asks about quantities, count them. If it asks about the weather or environment, describe what you can observe from the image.`;
  } else {
    // Default general description
    prompt = `Describe what you see in this image in detail. Be specific and descriptive about the objects, scene, colors, and layout. Write naturally as if describing it to someone who can't see the image.`;
  }

  try {
    const result = await cactus.complete({
      messages: [{
        role: 'user',
        content: prompt,
        images: [imageUri]
      }]
    });

    console.log('Raw AI Response:', result.response);
    
    // Clean up the response
    const cleanDescription = result.response.replace(/<\|im_end\|>/g, '').trim();
    
    return { description: cleanDescription };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze image');
  }
};

export const isVisionModelReady = (): boolean => {
  return cactus !== null;
};