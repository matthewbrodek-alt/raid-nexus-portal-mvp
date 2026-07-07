import { NextResponse } from "next/server";
import { uploadCloudinaryAsset } from "@/lib/cloudinary/server";
import type { CloudinaryFolder } from "@/lib/cloudinary/types";
import { formatUploadSize, getUploadMaxBytes, getUploadResourceType } from "@/lib/media/upload-limits";

export const runtime = "nodejs";

const allowedFolders = new Set<CloudinaryFolder>(["heroes", "news", "offers", "marketplace", "chat", "chat-emojis", "forum", "users", "topup", "event-widgets"]);

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
      typeof value === "object" &&
      "arrayBuffer" in value &&
      "size" in value &&
      "type" in value
  );
}

function fileToDataUrl(file: File, buffer: ArrayBuffer) {
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file") ?? null;
  const folder = formData?.get("folder") ?? null;
  const publicId = formData?.get("publicId") ?? null;

  if (!isUploadFile(file)) {
    return NextResponse.json({ error: "Valid media file is required." }, { status: 400 });
  }

  if (typeof folder !== "string" || !allowedFolders.has(folder as CloudinaryFolder)) {
    return NextResponse.json({ error: "Valid upload folder is required." }, { status: 400 });
  }

  const resourceType = getUploadResourceType(file.type);

  if (!resourceType) {
    return NextResponse.json({ error: "Only image and video uploads are supported." }, { status: 415 });
  }

  const maxFileSize = getUploadMaxBytes(resourceType);

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: `${resourceType === "video" ? "Video" : "Image"} must be ${formatUploadSize(maxFileSize)} or smaller.` }, { status: 413 });
  }

  const buffer = await file.arrayBuffer();
  const asset = await uploadCloudinaryAsset({
    file: fileToDataUrl(file, buffer),
    folder: folder as CloudinaryFolder,
    publicId: typeof publicId === "string" && publicId.trim() ? publicId.trim() : undefined,
    resourceType,
    tags: ["raid-nexus", folder]
  });

  return NextResponse.json(asset);
}
