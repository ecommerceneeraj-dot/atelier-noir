import React, { useState } from 'react';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackLabel?: string;
  cropStyle?: 'default' | 'top-focus';
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  fallbackLabel,
  cropStyle = 'default',
  className = '',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#141416] text-[#9A9A9E] p-6 text-center select-none overflow-hidden ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(197,168,128,0.08),transparent_70%)]" />
        <svg
          className="w-8 h-8 mb-3 text-[#C5A880]/60 stroke-[1.25]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <span className="font-display text-xs tracking-widest uppercase text-[#F5F2EB]/80">
          {fallbackLabel || alt}
        </span>
        <span className="mt-1 text-[11px] text-[#9A9A9E]">ATELIER NOIR ARCHIVE</span>
      </div>
    );
  }

  // If cropStyle === 'top-focus', we subtly scale and anchor top so only the architectural coat/clothing is visible.
  const cropTransformClass =
    cropStyle === 'top-focus' ? 'object-top scale-[1.22] origin-top' : 'object-center';

  return (
    <div className={`relative overflow-hidden bg-[#141416] ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#18181B] animate-pulse" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${cropTransformClass} ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...rest}
      />
    </div>
  );
};
