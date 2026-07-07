export type UploadResourceType = "image" | "video";

export const IMAGE_UPLOAD_MAX_BYTES = 6 * 1024 * 1024;
export const VIDEO_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
export const CHAT_ATTACHMENT_ACCEPT = "image/*,video/mp4,video/webm,video/quicktime,video/x-m4v";

export function getUploadResourceType(mimeType?: string): UploadResourceType | null {
  if (!mimeType) {
    return null;
  }

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return null;
}

export function getUploadMaxBytes(resourceType: UploadResourceType) {
  return resourceType === "video" ? VIDEO_UPLOAD_MAX_BYTES : IMAGE_UPLOAD_MAX_BYTES;
}

export function formatUploadSize(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

