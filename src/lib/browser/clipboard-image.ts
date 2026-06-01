export function getClipboardImageFile(clipboardData: DataTransfer, fallbackName = "clipboard-image.png") {
  const fileFromList = Array.from(clipboardData.files).find((file) => file.type.startsWith("image/"));

  if (fileFromList) {
    return withFallbackName(fileFromList, fallbackName);
  }

  const fileFromItems = Array.from(clipboardData.items)
    .find((item) => item.kind === "file" && item.type.startsWith("image/"))
    ?.getAsFile();

  return fileFromItems ? withFallbackName(fileFromItems, fallbackName) : null;
}

function withFallbackName(file: File, fallbackName: string) {
  if (file.name) {
    return file;
  }

  return new File([file], fallbackName, {
    lastModified: Date.now(),
    type: file.type || "image/png"
  });
}
