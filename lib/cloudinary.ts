import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function uploadDataUrlToCloudinary(
  dataUrl: string,
  options: { folder?: string; publicIdPrefix?: string } = {}
): Promise<string | null> {
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Cloudinary env vars not set; skipping upload.');
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: options.folder ?? 'employees',
      public_id: options.publicIdPrefix
        ? `${options.publicIdPrefix}-${Date.now()}`
        : undefined,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed', error);
    return null;
  }
}

