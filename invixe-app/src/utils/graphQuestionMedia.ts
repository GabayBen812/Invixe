export function isLandscapePhotoAsset(width: number, height: number): boolean {
  if (height <= 0) return false;
  return width / height >= 1.4 && width >= 480;
}

export function isBareChartAsset(
  mediaType: "svg" | "png",
  pngDimensions: { width: number; height: number } | null,
): boolean {
  if (mediaType === "svg") return true;
  if (!pngDimensions) return true;
  return !isLandscapePhotoAsset(pngDimensions.width, pngDimensions.height);
}

export function computeBareChartHeight(
  viewportHeight: number,
  screenHeight: number,
  options?: { reservedSpace?: number; fraction?: number },
): number {
  const viewport =
    viewportHeight > 0 ? viewportHeight : Math.min(screenHeight * 0.45, 400);
  const reserved = options?.reservedSpace ?? 100;
  const fraction = options?.fraction ?? 0.72;
  const usable = Math.max(200, viewport - reserved);
  return Math.round(Math.min(usable * fraction, 360));
}
