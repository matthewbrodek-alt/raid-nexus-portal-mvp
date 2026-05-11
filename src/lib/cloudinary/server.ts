import "server-only";
import { v2 as cloudinary } from "cloudinary";
import type { CloudinaryAsset, CloudinaryUploadInput } from "@/lib/cloudinary/types";

let configured = false;

function configureCloudinary() {
  if (configured) {
    return;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  configured = true;
}

function toAsset(result: {
  public_id: string;
  secure_url: string;
  url: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}): CloudinaryAsset {
  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    url: result.url,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes
  };
}

export async function uploadCloudinaryAsset(input: CloudinaryUploadInput): Promise<CloudinaryAsset> {
  configureCloudinary();

  const result = await cloudinary.uploader.upload(input.file, {
    folder: `raid-nexus/${input.folder}`,
    public_id: input.publicId,
    resource_type: "image",
    tags: input.tags,
    overwrite: false
  });

  return toAsset(result);
}

export async function deleteCloudinaryAsset(publicId: string) {
  configureCloudinary();

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image"
  });
}
