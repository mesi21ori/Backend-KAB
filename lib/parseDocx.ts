import mammoth from 'mammoth';

/**
 * Converts image buffer (ArrayBuffer) to base64 data URI
 * This ensures watermarks and embedded images are preserved
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Detects image MIME type from buffer header
 */
function detectImageType(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
    return 'image/jpeg';
  } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'image/png';
  } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif';
  } else if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
    return 'image/bmp';
  }
  return 'image/png'; // default
}

export async function parseDocxToHtml(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Configure mammoth to convert images to base64 data URIs
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        try {
          const imageBuffer = await image.read('arraybuffer') as unknown as ArrayBuffer;
          const base64 = arrayBufferToBase64(imageBuffer);
          const mimeType = detectImageType(imageBuffer);
          
          console.log('Image converted:', { mimeType, size: imageBuffer.byteLength });
          
          return {
            src: `data:${mimeType};base64,${base64}`
          };
        } catch (error) {
          console.error('Error converting image:', error);
          // Return placeholder if image conversion fails
          return {
            src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          };
        }
      }),
      // Preserve style information for watermarks and backgrounds
      styleMap: [
        "p[style-name='Watermark'] => p.watermark",
        "r[style-name='Watermark'] => span.watermark",
        // Handle background images and watermarks in headers/footers
        "p[style-name*='Background'] => p.background",
        "r[style-name*='Background'] => span.background",
        "p[style-name*='Header'] => p.header-content",
        "p[style-name*='Footer'] => p.footer-content",
      ],
      // Include document properties (may help with headers/footers)
      includeDefaultStyleMap: true,
    }
  );
  
  // Log any messages (warnings about unsupported elements)
  if (result.messages && result.messages.length > 0) {
    console.log('Mammoth conversion messages:', result.messages.length, 'messages');
    result.messages.forEach((msg: any) => {
      console.log('  -', msg.type, ':', msg.message);
    });
  }
  
  // Check if result contains images
  const hasImages = result.value.includes('<img') || result.value.includes('data:image');
  console.log('Converted HTML contains images:', hasImages);
  if (hasImages) {
    const imageCount = (result.value.match(/<img/g) || []).length;
    console.log('Found', imageCount, 'image(s) in converted HTML');
  }
  
  return result.value;
}

export async function parseDocxToText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
