export type CloudinaryFolder = "heroes" | "news" | "offers" | "marketplace" | "chat" | "chat-emojis" | "forum" | "users" | "topup" | "event-widgets";

export type CloudinaryAsset = {
  publicId: string;
  secureUrl: string;
  url: string;
  resourceType?: "image" | "video";
  optimizedUrl?: string;
  posterUrl?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  alt?: string;
};

export type CloudinaryUploadInput = {
  file: string;
  folder: CloudinaryFolder;
  publicId?: string;
  resourceType?: "image" | "video";
  tags?: string[];
};
