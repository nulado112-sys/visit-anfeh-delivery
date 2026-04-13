"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  fill?: boolean;
  blendMultiply?: boolean;
};

export default function LogoImage({ src, alt, fallback, className, fill, blendMultiply }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-2xl font-black text-stone-400">
        {fallback}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className ?? "object-contain p-2"}
      style={blendMultiply ? { mixBlendMode: "multiply" } : undefined}
      onError={() => setError(true)}
    />
  );
}
