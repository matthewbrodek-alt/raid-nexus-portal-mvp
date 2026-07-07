import type { CloudinaryAsset, CloudinaryFolder } from "@/lib/cloudinary/types";
import type { UploadResourceType } from "@/lib/media/upload-limits";

type SignedUploadResponse = {
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  resourceType: UploadResourceType;
  signature: string;
  tags: string;
  timestamp: number;
};

type CloudinaryDirectResponse = {
  public_id: string;
  secure_url: string;
  url: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
};

type UploadClientMediaInput = {
  file: File;
  folder: CloudinaryFolder;
  publicId: string;
  resourceType: UploadResourceType;
};

function withTransformation(secureUrl: string, transformation: string) {
  return secureUrl.replace("/upload/", `/upload/${transformation}/`);
}

function toClientAsset(result: CloudinaryDirectResponse, resourceType: UploadResourceType): CloudinaryAsset {
  const optimizedUrl = withTransformation(result.secure_url, resourceType === "video" ? "f_auto,q_auto:eco,vc_auto,w_1280,c_limit" : "f_auto,q_auto,w_1600,c_limit");
  const posterUrl =
    resourceType === "video"
      ? result.secure_url
          .replace("/video/upload/", "/video/upload/so_0,w_720,c_limit,q_auto/")
          .replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg")
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

export async function uploadCloudinaryMediaFromClient(input: UploadClientMediaInput): Promise<CloudinaryAsset> {
  const signedResponse = await fetch("/api/cloudinary/sign-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      folder: input.folder,
      publicId: input.publicId,
      resourceType: input.resourceType
    })
  });

  if (!signedResponse.ok) {
    throw new Error("Cloudinary upload signature failed.");
  }

  const signed = (await signedResponse.json()) as SignedUploadResponse;
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("api_key", signed.apiKey);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("signature", signed.signature);
  formData.append("folder", signed.folder);
  formData.append("public_id", signed.publicId);
  formData.append("tags", signed.tags);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/${signed.resourceType}/upload`, {
    method: "POST",
    body: formData
  });

  if (!uploadResponse.ok) {
    throw new Error("Cloudinary direct upload failed.");
  }

  return toClientAsset((await uploadResponse.json()) as CloudinaryDirectResponse, signed.resourceType);
}

