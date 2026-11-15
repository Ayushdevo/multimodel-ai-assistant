export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];

export function validateImage(file: File): void {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Choose a PNG, JPEG, WebP, HEIC or HEIF image.');
  if (!file.size) throw new Error('The image is empty.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Images must be 10 MB or smaller.');
}

export function readImage(file: File): Promise<string> {
  validateImage(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the image. Please select it again.'));
    reader.onabort = () => reject(new Error('Image reading was cancelled.'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string' || !result.startsWith('data:') || !result.includes(',') || !result.split(',')[1]) {
        reject(new Error('Could not read image data.'));
        return;
      }
      resolve(result);
    };
    reader.readAsDataURL(file);
  });
}
