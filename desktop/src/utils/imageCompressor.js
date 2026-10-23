/**
 * Compresses and center-crops an avatar image file to a square.
 * Ensures the output binary is kept strictly below maxSizeBytes (default 200KB).
 *
 * @param {File} file - Image file from file input
 * @param {Object} options
 * @param {number} [options.size=256] - Output square width/height in px
 * @param {number} [options.maxSizeBytes=200 * 1024] - Max allowed size in bytes (200KB)
 * @param {number} [options.initialQuality=0.85] - Initial JPEG compression quality
 * @returns {Promise<{ base64: string, sizeBytes: number, sizeKB: string, width: number, height: number }>}
 */
export const compressAvatarImage = (file, options = {}) => {
  const {
    size = 256,
    maxSizeBytes = 200 * 1024,
    initialQuality = 0.85,
  } = options;

  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided.'));
    }

    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (JPG, PNG, WebP).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image format.'));

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return reject(new Error('Canvas context not available.'));
          }

          // Center crop to a perfect square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          // Iterate quality if needed to guarantee < maxSizeBytes (200KB)
          let quality = initialQuality;
          let compressedBase64 = canvas.toDataURL('image/jpeg', quality);

          const getByteLength = (b64) => {
            const head = 'data:image/jpeg;base64,';
            const base64Data = b64.startsWith(head) ? b64.slice(head.length) : b64;
            return Math.round((base64Data.length * 3) / 4);
          };

          let bytes = getByteLength(compressedBase64);

          while (bytes > maxSizeBytes && quality > 0.3) {
            quality -= 0.15;
            compressedBase64 = canvas.toDataURL('image/jpeg', Math.max(0.2, quality));
            bytes = getByteLength(compressedBase64);
          }

          if (bytes > maxSizeBytes) {
            return reject(
              new Error(
                `Image is too large (${(bytes / 1024).toFixed(1)} KB). Please choose a smaller photo under 200 KB.`
              )
            );
          }

          resolve({
            base64: compressedBase64,
            sizeBytes: bytes,
            sizeKB: (bytes / 1024).toFixed(1),
            width: size,
            height: size,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
};

export default compressAvatarImage;
