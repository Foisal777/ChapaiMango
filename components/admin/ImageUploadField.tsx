"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Plus, Star, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { uploadImage } from "@/lib/upload-image";
import { cn } from "@/lib/utils";

/**
 * Gallery-first image picker for the admin panel.
 *
 * - "গ্যালারি থেকে ছবি বেছে নিন" opens the device photo gallery /
 *   file picker (multiple files supported) — no URL hunting.
 * - Drag & drop works too. Files are compressed, then uploaded to
 *   Supabase Storage (`site-images` bucket); if that bucket hasn't
 *   been created yet the compressed image is stored inline so the
 *   flow never blocks the admin.
 * - Pasting an external URL is still available as a secondary option.
 * - First image = cover photo. Click the star on any other image to
 *   make it the cover.
 */
export default function ImageUploadField({
  images,
  onChange,
  folder = "products",
  max = 8,
  label = "ছবি"
}: {
  images: string[];
  onChange: (next: string[]) => void;
  folder?: string;
  max?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    const room = max - images.length;
    if (room <= 0) { toast.error(`সর্বোচ্চ ${max}টি ছবি`); return; }
    setBusy(true);
    try {
      const added: string[] = [];
      let inline = false;
      for (const file of list.slice(0, room)) {
        const res = await uploadImage(file, folder);
        if (res.via === "inline") inline = true;
        added.push(res.url);
      }
      onChange([...images, ...added]);
      toast.success(`${added.length}টি ছবি যোগ হয়েছে`);
      if (inline) toast("Storage bucket তৈরি না থাকায় ছবি ইনলাইন সেভ হয়েছে — প্রোডাকশনের জন্য cmh-tracking-and-storage.sql রান করুন", { icon: "ℹ️", duration: 5000 });
    } catch {
      toast.error("ছবি আপলোড করা যায়নি");
    } finally {
      setBusy(false);
    }
  }

  function addUrl() {
    const u = url.trim();
    if (!u) return;
    if (!/^(https?:\/\/|data:image\/)/i.test(u)) { toast.error("সঠিক URL দিন (https://…)"); return; }
    if (images.length >= max) { toast.error(`সর্বোচ্চ ${max}টি ছবি`); return; }
    onChange([...images, u]);
    setUrl("");
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        className={cn("rounded-2xl border-2 border-dashed p-5 text-center transition",
          dragOver ? "border-mango-500 bg-mango-100" : "border-mango-300 bg-mango-50/50")}
      >
        <ImagePlus className="h-9 w-9 mx-auto text-mango-500 mb-2" />
        <p className="text-sm font-semibold text-ink">{label} — গ্যালারি থেকে সরাসরি বেছে নিন</p>
        <p className="text-xs text-ink/50 mt-1">ফোন/কম্পিউটারের গ্যালারি থেকে সিলেক্ট করুন, অথবা এখানে drag &amp; drop করুন (সর্বোচ্চ {max}টি)</p>
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()}
          className="btn-primary mt-4 text-sm py-2.5 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? "আপলোড হচ্ছে…" : "গ্যালারি থেকে ছবি বেছে নিন"}
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <div className="relative flex-1">
          <Link2 className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input value={url} onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
            className="input-field flex-1 pl-9" placeholder="অথবা ছবির URL paste করুন (https://…)" />
        </div>
        <button type="button" onClick={addUrl} className="rounded-xl border border-mango-300 px-4 text-sm font-semibold text-mango-700 hover:bg-mango-100 transition shrink-0 inline-flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {images.map((src, i) => (
            <div key={src.slice(0, 64) + i} className="group relative aspect-square overflow-hidden rounded-xl border border-mango-200 bg-mango-100 hover-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
              {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-mango-gradient px-2.5 py-1 text-[10px] font-bold text-ink shadow-soft">কভার ছবি</span>}
              <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                {i !== 0 && (
                  <button type="button" title="কভার করুন" onClick={() => onChange([src, ...images.filter((_, x) => x !== i)])}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-mango-700 shadow-soft hover:scale-110 transition"><Star className="h-4 w-4" /></button>
                )}
                <button type="button" title="মুছুন" onClick={() => onChange(images.filter((_, x) => x !== i))}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-red-600 shadow-soft hover:scale-110 transition"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Single-logo variant used for payment-method logos in Settings. */
export function LogoUploadField({ value, onChange, folder = "payments" }: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function pick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try { onChange((await uploadImage(file, folder)).url); toast.success("লোগো সেট হয়েছে"); }
    catch { toast.error("লোগো আপলোড করা যায়নি"); }
    finally { setBusy(false); }
  }
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
      {value ? (
        <span className="inline-flex h-12 min-w-20 items-center justify-center rounded-xl border border-mango-200 bg-white px-3 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="payment logo" className="max-h-9 max-w-28 object-contain" />
        </span>
      ) : (
        <span className="inline-flex h-12 items-center rounded-xl border border-dashed border-mango-300 px-3 text-xs text-ink/45">লোগো নেই (ডিফল্ট pill দেখাবে)</span>
      )}
      <button type="button" disabled={busy} onClick={() => inputRef.current?.click()}
        className="rounded-xl border border-mango-300 px-3 py-2 text-xs font-semibold text-mango-700 hover:bg-mango-100 transition inline-flex items-center gap-1.5 disabled:opacity-50">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} গ্যালারি থেকে লোগো
      </button>
      {value && (
        <button type="button" onClick={() => onChange("")} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition inline-flex items-center gap-1.5">
          <Trash2 className="h-3.5 w-3.5" /> সরান
        </button>
      )}
      <input value={value.startsWith("data:") ? "" : value} onChange={(e) => onChange(e.target.value)} placeholder="বা লোগোর URL" className="input-field !w-52 text-xs" />
    </div>
  );
}
