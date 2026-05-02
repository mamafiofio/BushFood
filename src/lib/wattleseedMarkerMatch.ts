import scanShapeUrl from "../assets/native-plants/Scan-shape_Wattleseed.svg";

const SAMPLE = 48;

function imageDataToGrayscaleNormalized(data: ImageData): Float64Array {
  const { width, height, data: px } = data;
  const out = new Float64Array(width * height);
  let sum = 0;
  for (let i = 0, p = 0; i < out.length; i++, p += 4) {
    const r = px[p] ?? 0;
    const gCh = px[p + 1] ?? 0;
    const b = px[p + 2] ?? 0;
    const g = (r + gCh + b) / 3 / 255;
    out[i] = g;
    sum += g;
  }
  const mean = sum / out.length;
  let varSum = 0;
  for (let i = 0; i < out.length; i++) {
    const v = (out[i] ?? 0) - mean;
    out[i] = v;
    varSum += v * v;
  }
  const norm = Math.sqrt(varSum) || 1;
  for (let i = 0; i < out.length; i++) {
    out[i] = (out[i] ?? 0) / norm;
  }
  return out;
}

function cosineSimilarity(a: Float64Array, b: Float64Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0);
  }
  return dot;
}

/**
 * Rasterises the official scan marker SVG on white and returns a normalised greyscale signature
 * for correlation against camera frames (same size).
 */
export function loadWattleseedScanReference(): Promise<Float64Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SAMPLE;
      canvas.height = SAMPLE;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unsupported"));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, SAMPLE, SAMPLE);
      ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
      const imageData = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
      resolve(imageDataToGrayscaleNormalized(imageData));
    };
    img.onerror = () => reject(new Error("Failed to load marker SVG"));
    img.src = scanShapeUrl;
  });
}

/**
 * Captures the centre of the current video frame, normalised to SAMPLE×SAMPLE, and scores
 * similarity to the reference marker (0 = unrelated, 1 = identical after normalisation).
 */
export function scoreVideoFrameAgainstMarker(
  video: HTMLVideoElement,
  reference: Float64Array,
): number | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE;
  canvas.height = SAMPLE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const crop = Math.min(vw, vh) * 0.42;
  const sx = (vw - crop) / 2;
  const sy = (vh - crop) / 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SAMPLE, SAMPLE);
  ctx.drawImage(video, sx, sy, crop, crop, 0, 0, SAMPLE, SAMPLE);
  const imageData = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
  const sig = imageDataToGrayscaleNormalized(imageData);
  return cosineSimilarity(sig, reference);
}

/** Correlation at or above this value (after normalisation) counts as a positive frame. */
export const WATTLESEED_MATCH_THRESHOLD = 0.78;

/** Consecutive positive frames required before we open the panel (reduces flicker). */
export const WATTLESEED_MATCH_STREAK = 5;
