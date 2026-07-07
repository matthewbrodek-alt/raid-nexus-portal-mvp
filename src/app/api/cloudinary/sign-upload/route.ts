import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import type { CloudinaryFolder } from "@/lib/cloudinary/types";
import type { UploadResourceType } from "@/lib/media/upload-limits";

export const runtime = "nodejs";

const allowedFolders = new Set<CloudinaryFolder>(["heroes", "news", "offers", "marketplace", "chat", "chat-emojis", "forum", "users", "topup", "event-widgets"]);

type SignUploadBody = {
  folder?: string;
  publicId?: string;
  resourceType?: UploadResourceType;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SignUploadBody | null;
  const folder = body?.folder;
  const publicId = body?.publicId?.trim();
  const resourceType = body?.resourceType === "image" || body?.resourceType === "video" ? body.resourceType : null;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary environment variables are not configured." }, { status: 500 });
  }

  if (typeof folder !== "string" || !allowedFolders.has(folder as CloudinaryFolder)) {
    return NextResponse.json({ error: "Valid upload folder is required." }, { status: 400 });
  }

  if (!publicId) {
    return NextResponse.json({ error: "Public id is required." }, { status: 400 });
  }

  if (!resourceType) {
    return NextResponse.json({ error: "Valid resource type is required." }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signedFolder = `raid-nexus/${folder}`;
  const tags = `raid-nexus,${folder}`;
  const signature = cloudinary.utils.api_sign_request(
    {
      folder: signedFolder,
      public_id: publicId,
      tags,
      timestamp
    },
    apiSecret
  );

  return NextResponse.json({
    apiKey,
    cloudName,
    folder: signedFolder,
    publicId,
    resourceType,
    signature,
    tags,
    timestamp
  });
}
