"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  name
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : ["/placeholder.png"];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-mango-100 shadow-soft">
        <Image
          src={list[active]}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {list.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                active === i ? "border-mango-500" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
