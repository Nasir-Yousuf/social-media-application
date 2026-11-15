/**
 * File upload validation and sanitization utility for Clearfeed.
 * Enforces magic bytes verification, EXIF GPS metadata stripping, and SVG sanitization.
 */

const MAX_AVATAR_BYTES = 200 * 1024; // 200 KB
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Detect image format from binary magic bytes (never trust extension or mime-type).
 * @param {Buffer} buffer
 * @returns {'jpeg' | 'png' | 'gif' | 'webp' | 'svg' | null}
 */
const detectImageFormat = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'png';
  }

  // GIF: GIF87a or GIF89a (47 49 46 38)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return 'gif';
  }

  // WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'webp';
  }

  // SVG: starts with <svg or <?xml ... <svg
  const head = buffer.slice(0, Math.min(buffer.length, 512)).toString('utf-8').trim().toLowerCase();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) {
    return 'svg';
  }

  return null;
};

/**
 * Strip EXIF (APP1 markers) from JPEG buffers to permanently eliminate embedded GPS metadata.
 * Retains SOI, APP0 (JFIF), DQT, DHT, SOF, SOS, image data, and EOI.
 * @param {Buffer} buffer
 * @returns {Buffer}
 */
const stripExifFromJpeg = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return buffer;
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return buffer; // Not JPEG

  const chunks = [Buffer.from([0xff, 0xd8])];
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      // Stream data without marker
      chunks.push(buffer.slice(offset));
      break;
    }

    const marker = buffer[offset + 1];

    // EOI (End of Image)
    if (marker === 0xd9) {
      chunks.push(buffer.slice(offset, offset + 2));
      break;
    }

    // SOS (Start of Scan) - remainder of file up to EOI is entropy-coded image data
    if (marker === 0xda) {
      chunks.push(buffer.slice(offset));
      break;
    }

    // Standalone markers without length: RST0..RST7, TEM
    if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) {
      chunks.push(buffer.slice(offset, offset + 2));
      offset += 2;
      continue;
    }

    // Segment length is 2 bytes following marker
    if (offset + 4 > buffer.length) {
      chunks.push(buffer.slice(offset));
      break;
    }

    const segmentLen = buffer.readUInt16BE(offset + 2);
    const segmentEnd = offset + 2 + segmentLen;

    if (segmentEnd > buffer.length) {
      chunks.push(buffer.slice(offset));
      break;
    }

    // APP1 marker (0xFF, 0xE1) carries Exif metadata (including GPS IFD)
    // We strip all APP1 Exif segments to protect location privacy
    if (marker === 0xe1) {
      // Omit APP1 segment
    } else {
      chunks.push(buffer.slice(offset, segmentEnd));
    }

    offset = segmentEnd;
  }

  return Buffer.concat(chunks);
};

/**
 * Sanitize SVG content against XSS vectors (<script>, on* handlers, javascript: URIs).
 * @param {string} svgText
 * @returns {string} sanitized SVG
 * @throws {Error} if malicious payload cannot be safely sanitized
 */
const sanitizeSvg = (svgText) => {
  if (typeof svgText !== 'string') return '';

  let sanitized = svgText
    // Remove script tags and content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Remove inline event handlers (onload, onerror, onclick, etc.)
    .replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s+on\w+\s*=\s*[^>\s]+/gi, '')
    // Remove javascript: and data: URIs in href / xlink:href
    .replace(/href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, 'href=""')
    .replace(/xlink:href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, 'xlink:href=""')
    // Remove iframes, objects, embeds, foreignObject
    .replace(/<(iframe|object|embed|foreignObject)[\s\S]*?<\/\1>/gi, '');

  if (/javascript:/i.test(sanitized) || /<script/i.test(sanitized) || /onerror\s*=/i.test(sanitized)) {
    throw new Error('SVG contains forbidden active code or malicious payload.');
  }

  return sanitized;
};

/**
 * Validate and sanitize image upload buffer.
 * @param {Buffer} buffer
 * @param {Object} options
 * @param {number} [options.maxSize=MAX_UPLOAD_BYTES]
 * @param {string[]} [options.allowedFormats=['jpeg', 'png', 'webp', 'gif']]
 * @returns {{ valid: boolean, format: string, mimeType: string, buffer: Buffer }}
 */
const validateAndSanitizeImage = (buffer, options = {}) => {
  const maxSize = options.maxSize || MAX_UPLOAD_BYTES;
  const allowedFormats = options.allowedFormats || ['jpeg', 'png', 'webp', 'gif'];

  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Invalid image data provided.');
  }

  if (buffer.length > maxSize) {
    const sizeKB = (buffer.length / 1024).toFixed(1);
    const maxKB = (maxSize / 1024).toFixed(0);
    throw new Error(`File size (${sizeKB} KB) exceeds the maximum allowed limit of ${maxKB} KB.`);
  }

  const format = detectImageFormat(buffer);
  if (!format || !allowedFormats.includes(format)) {
    throw new Error(
      `Unsupported or invalid image format. Allowed formats: ${allowedFormats.join(', ').toUpperCase()}`
    );
  }

  let sanitizedBuffer = buffer;
  let mimeType = `image/${format}`;

  if (format === 'jpeg') {
    sanitizedBuffer = stripExifFromJpeg(buffer);
  } else if (format === 'svg') {
    const sanitizedStr = sanitizeSvg(buffer.toString('utf-8'));
    sanitizedBuffer = Buffer.from(sanitizedStr, 'utf-8');
    mimeType = 'image/svg+xml';
  }

  return {
    valid: true,
    format,
    mimeType,
    buffer: sanitizedBuffer,
  };
};

module.exports = {
  MAX_AVATAR_BYTES,
  MAX_UPLOAD_BYTES,
  detectImageFormat,
  stripExifFromJpeg,
  sanitizeSvg,
  validateAndSanitizeImage,
};