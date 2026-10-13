"use client";

/**
 * Gallery / device photo upload for the admin panel.
 *
 * Strategy (best → fallback):
 *  1. Upload the (lightly compressed) file to the Supabase Storage
 *     bucket `site-images` and return its public URL. Run
 *     `supabase/cmh-tracking-and-storage.sql` once to create the
 *     bucket + policies.
 *  2. If Storage isn't set up yet (or the upload fails), fall back to
 *     a compressed JPEG data-URL so picking a photo from the gallery
 *     *always works* — even in local/mock mode. Data-URLs are stored
 *     in the same text columns as remote URLs.
 *
 * Compression (max 1400px, JPEG q0.82) keeps phone photos (often
 * 3–6 MB) down to a few hundred KB before either path.
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const SITE_IMAGES_BUCKET = "site-images";

async function compressToBlob(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1400;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    if (scale >= 1 && file.size < 700_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.82));
  } catch {
    return file;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export type UploadResult = { url: string; via: "storage" | "inline" };

/**
 * Upload one image picked from the device gallery / file picker.
 * `folder` groups objects in the bucket (`products`, `payments`, `team`…).
 */
export async function uploadImage(file: File, folder = "misc"): Promise<UploadResult> {
  const blob = await compressToBlob(file);
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const { error } = await supabase.storage.from(SITE_IMAGES_BUCKET).upload(path, blob, { contentType: blob.type, upsert: false });
      if (!error) {
        const { data } = supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(path);
        if (data?.publicUrl) return { url: data.publicUrl, via: "storage" };
      }
    } catch {
      /* fall through to inline */
    }
  }
  return { url: await blobToDataUrl(blob), via: "inline" };
}
