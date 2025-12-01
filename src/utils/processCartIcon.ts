import { removeBackground, loadImage } from './removeBackground';

export const processCartIcon = async (imagePath: string): Promise<string> => {
  try {
    // Fetch the image
    const response = await fetch(imagePath);
    const blob = await response.blob();
    
    // Load as HTMLImageElement
    const img = await loadImage(blob);
    
    // Remove background
    const processedBlob = await removeBackground(img);
    
    // Create a URL for the processed image
    const url = URL.createObjectURL(processedBlob);
    
    return url;
  } catch (error) {
    console.error('Error processing cart icon:', error);
    throw error;
  }
};
