"use client";

import React from "react";
import Image, { ImageProps } from "next/image";
import { CldImage } from "next-cloudinary";

const isCloudinary = (src: unknown): src is string =>
  typeof src === "string" && /^https?:\/\/res\.cloudinary\.com\//.test(src);

/**
 * Drop-in replacement for next/image.
 * Cloudinary URLs go through CldImage (auto format + auto quality + resized delivery);
 * anything else (blob:/data: previews, other hosts) falls back to next/image.
 */
const OptimizedImage = (props: ImageProps) => {
  const { src, alt, ...rest } = props;

  if (isCloudinary(src)) {
    // Use the cloud the image actually lives in (old uploads may belong to another account)
    const cloudName = src.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\//)?.[1];
    return (
      <CldImage
        src={src}
        alt={alt}
        config={cloudName ? { cloud: { cloudName } } : undefined}
        // fill images need a sizes hint so Cloudinary serves a right-sized file
        sizes={rest.fill && !rest.sizes ? "(max-width: 768px) 100vw, 50vw" : rest.sizes}
        {...(rest as any)}
      />
    );
  }

  const unoptimized = typeof src === "string" && /^(blob|data):/.test(src);
  return <Image src={src} alt={alt} unoptimized={unoptimized || rest.unoptimized} {...rest} />;
};

export default OptimizedImage;
