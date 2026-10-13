"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Auto-sliding hero image carousel. Replaces the 3D mango / emoji
 * fallback with real product photos that rotate every 4 seconds.
 *
 * The images are passed from the server (homepage fetches products,
 * extracts the first image from each featured product). Admin
 * updates product images → hero updates automatically on next
 * revalidation.
 *
 * Pure CSS crossfade + one piece of state. No external carousel
 * library, no framer-motion. ~0 KB added to the JS bundle over
 * the existing useState/useEffect.
 */
export default function HeroSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const list = images.length > 0 ? images : [];

  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % list.length),
      4000
    );
    return () => clearInterval(id);
  }, [list.length]);

  if (list.length === 0) {
    // No images at all — render the mango emoji fallback
    return (
      <div className="grid place-items-center h-full select-none">
        <div
          aria-hidden="true"
          className="text-[10rem] sm:text-[13rem] lg:text-[15rem] animate-float drop-shadow-2xl"
        >
          🥭
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-glow">
      {list.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image
            src={src}
            alt={`চাঁপাইনবাবগঞ্জের আম ${i + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent pointer-events-none" />

      {/* Dots indicator */}
      {list.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === index
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
