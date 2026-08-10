/**
 * Compression des photos du journal.
 * Tout est stocké sur l'appareil : on redimensionne et on ré-encode en JPEG
 * avant d'écrire quoi que ce soit dans la sauvegarde.
 */

const MAX = 1080;
const QUALITY = 0.62;

const load = (file: File): Promise<HTMLImageElement> =>
  new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image illisible')); };
    img.src = url;
  });

export async function compressPhoto(file: File): Promise<string> {
  const img = await load(file);
  const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);

  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  if (!ctx) throw new Error('canvas indisponible');
  ctx.drawImage(img, 0, 0, w, h);
  return cv.toDataURL('image/jpeg', QUALITY);
}

/** Poids approximatif d'une dataURL, en Ko. */
export const weightKo = (dataUrl: string) => Math.round((dataUrl.length * 3) / 4 / 1024);
