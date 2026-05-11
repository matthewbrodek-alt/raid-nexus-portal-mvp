export type CloudinaryFolder = "heroes" | "marketplace" | "chat" | "forum" | "users";

export type CloudinaryAsset = {
  publicId: string;
  secureUrl: string;
  url: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  alt?: string;
};

export type CloudinaryUploadInput = {
  file: string;
  folder: CloudinaryFolder;
  publicId?: string;
  tags?: string[];
};
