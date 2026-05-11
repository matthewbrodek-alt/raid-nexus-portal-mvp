export function getCloudinaryCloudName() {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
}

export function getCloudinaryImageUrl(publicId: string, options?: { width?: number; height?: number; crop?: string }) {
  const cloudName = getCloudinaryCloudName();

  if (!cloudName || !publicId) {
    return "";
  }

  const transformations = [
    options?.width ? `w_${options.width}` : null,
    options?.height ? `h_${options.height}` : null,
    options?.crop ? `c_${options.crop}` : null,
    "f_auto",
    "q_auto"
  ]
    .filter(Boolean)
    .join(",");

  const path = transformations ? `${transformations}/` : "";

  return `https://res.cloudinary.com/${cloudName}/image/upload/${path}${publicId}`;
}
