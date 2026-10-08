/**
 * Ultra-fast, GPU-friendly Car Sprite Processing & Caching Engine
 * Automatically isolates automotive renders from studio backdrops using
 * boundary-aware flood fill + edge anti-aliasing.
 * Caches transparent sprite canvases in memory for 60 FPS rendering.
 */

const spriteCache = new Map();
const imageCache = new Map();

/**
 * Preload and process transparent sprite for a car
 * @param {string} carId - e.g. 'shadow_v12'
 * @param {string} imageSrc - e.g. '/racing/shadow_v12.jpg'
 * @returns {Promise<HTMLCanvasElement>}
 */
export const loadCarSprite = (carId, imageSrc) => {
  if (spriteCache.has(carId)) {
    return Promise.resolve(spriteCache.get(carId));
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // If image is already a transparent PNG, cache and return immediately
      if (imageSrc.endsWith('.png')) {
        spriteCache.set(carId, img);
        resolve(img);
        return;
      }

      try {
        const offscreen = document.createElement('canvas');
        // Scale to 640x360 for high-DPI crispness and blazing speed
        const w = 640;
        const h = Math.round((img.height / img.width) * w);
        offscreen.width = w;
        offscreen.height = h;

        const ctx = offscreen.getContext('2d');
        if (!ctx) {
          spriteCache.set(carId, img);
          resolve(img);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // BFS flood-fill from boundary to remove background without affecting dark car interior
        const visited = new Uint8Array(w * h);
        const queue = [];

        // Push top edge and top-corners into queue
        for (let x = 0; x < w; x++) {
          queue.push((0 * w + x));
          visited[0 * w + x] = 1;
        }
        for (let y = 0; y < h * 0.75; y++) {
          queue.push((y * w + 0));
          visited[y * w + 0] = 1;
          queue.push((y * w + (w - 1)));
          visited[y * w + (w - 1)] = 1;
        }

        // Helper: check if pixel is dark neutral studio backdrop
        const isBackdrop = (idx) => {
          const r = data[idx * 4];
          const g = data[idx * 4 + 1];
          const b = data[idx * 4 + 2];
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const diff = maxVal - minVal;

          // Studio backdrop is dark (brightness < 68) with very low saturation (diff < 28)
          return maxVal < 68 && diff < 28;
        };

        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++];
          const cx = curr % w;
          const cy = Math.floor(curr / w);

          if (isBackdrop(curr)) {
            // Set alpha to 0
            data[curr * 4 + 3] = 0;

            // Check 4-connected neighbors
            const neighbors = [
              [cx + 1, cy],
              [cx - 1, cy],
              [cx, cy + 1],
              [cx, cy - 1],
            ];

            for (let i = 0; i < 4; i++) {
              const nx = neighbors[i][0];
              const ny = neighbors[i][1];

              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const nIdx = ny * w + nx;
                if (!visited[nIdx]) {
                  visited[nIdx] = 1;
                  queue.push(nIdx);
                }
              }
            }
          }
        }

        // Soft edge anti-aliasing pass
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            if (data[idx * 4 + 3] > 0) {
              // If adjacent to a cleared background pixel, soften edge
              const top = (y - 1) * w + x;
              const bottom = (y + 1) * w + x;
              const left = y * w + (x - 1);
              const right = y * w + (x + 1);

              if (
                data[top * 4 + 3] === 0 ||
                data[bottom * 4 + 3] === 0 ||
                data[left * 4 + 3] === 0 ||
                data[right * 4 + 3] === 0
              ) {
                data[idx * 4 + 3] = Math.round(data[idx * 4 + 3] * 0.75);
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        spriteCache.set(carId, offscreen);
        resolve(offscreen);
      } catch (err) {
        console.warn('Fallback to direct image for', carId, err);
        spriteCache.set(carId, img);
        resolve(img);
      }
    };

    img.onerror = () => {
      console.warn('Failed to load image for car', carId, imageSrc);
      resolve(null);
    };

    img.src = imageSrc;
  });
};

/**
 * Synchronous get for already cached sprite
 */
export const getCachedSprite = (carId) => {
  return spriteCache.get(carId) || null;
};
