import { PreviewImageState } from '../types';

/**
 * Loads a File locally into a preview image state with dimensions and data URL.
 * Works strictly in-browser without network requests.
 */
export async function processImageFile(file: File): Promise<PreviewImageState> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPEG, PNG, WebP, etc.)');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          url: result,
          fileName: file.name,
          fileSize: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = () => {
        reject(new Error('Failed to decode image file.'));
      };
      img.src = result;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Formats file size in bytes to human-readable string (KB, MB).
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
