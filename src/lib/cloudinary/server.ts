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
  duration?: number;
}, resourceType: "image" | "video"): CloudinaryAsset {
  const optimizedUrl = cloudinary.url(result.public_id, {
    resource_type: resourceType,
    secure: true,
    transformation: resourceType === "video" ? ["f_auto,q_auto:eco,vc_auto,w_1280,c_limit"] : ["f_auto,q_auto,w_1600,c_limit"]
  });
  const posterUrl =
    resourceType === "video"
      ? cloudinary.url(result.public_id, {
          resource_type: "video",
          secure: true,
          format: "jpg",
          transformation: ["so_0,w_720,c_limit,q_auto"]
        })
      : undefined;

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    url: result.url,
    resourceType,
    optimizedUrl,
    posterUrl,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    duration: result.duration
  };
}

export async function uploadCloudinaryAsset(input: CloudinaryUploadInput): Promise<CloudinaryAsset> {
  configureCloudinary();
  const resourceType = input.resourceType ?? "image";

  const result = await cloudinary.uploader.upload(input.file, {
    folder: `raid-nexus/${input.folder}`,
    public_id: input.publicId,
    resource_type: resourceType,
    tags: input.tags,
    overwrite: false
  });

  return toAsset(result, resourceType);
}

export async function deleteCloudinaryAsset(publicId: string, resourceType: "image" | "video" = "image") {
  configureCloudinary();

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType
  });
}
