import { NextResponse } from "next/server";
import { uploadCloudinaryAsset } from "@/lib/cloudinary/server";
import type { CloudinaryFolder } from "@/lib/cloudinary/types";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 6 * 1024 * 1024;
const allowedFolders = new Set<CloudinaryFolder>(["heroes", "marketplace", "chat", "forum", "users"]);

function fileToDataUrl(file: File, buffer: ArrayBuffer) {
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const folder = formData?.get("folder");
  const publicId = formData?.get("publicId");

  if (!(file instanceof File) || typeof folder !== "string" || !allowedFolders.has(folder as CloudinaryFolder)) {
    return NextResponse.json({ error: "Valid file and folder are required." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are supported." }, { status: 415 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image must be 6 MB or smaller." }, { status: 413 });
  }

  const buffer = await file.arrayBuffer();
  const asset = await uploadCloudinaryAsset({
    file: fileToDataUrl(file, buffer),
    folder: folder as CloudinaryFolder,
    publicId: typeof publicId === "string" && publicId.trim() ? publicId.trim() : undefined,
    tags: ["raid-nexus", folder]
  });

  return NextResponse.json(asset);
}
