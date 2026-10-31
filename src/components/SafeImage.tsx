import React, { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackCategory?: string;
}

export const normalizeImageUrl = (url?: string): string => {
  if (!url) return '/images/listing_biryani.jpg';
  
  // If the path is an old local path /src/assets/images/...
  if (url.includes('hero_food_rescue')) {
    return '/images/hero_food_rescue.jpg';
  }
  if (url.includes('biryani')) {
    return '/images/listing_biryani.jpg';
  }
  if (url.includes('bread') || url.includes('bakery')) {
    return '/images/listing_bakery_bread.jpg';
  }
  if (url.includes('groceries') || url.includes('produce') || url.includes('fruit')) {
    return '/images/listing_groceries.jpg';
  }

  // If starts with /src/assets/images/, also try /images/
  if (url.startsWith('/src/assets/images/')) {
    const filename = url.replace('/src/assets/images/', '');
    return `/images/${filename}`;
  }

  return url;
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackCategory,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = normalizeImageUrl(src);

  if (hasError || !src) {
    return (
      <div
        className={`bg-stone-800 text-stone-200 flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
        role="img"
        aria-label={alt || 'FoodBridge Donation'}
      >
        <div className="w-10 h-10 rounded-full bg-emerald-800/80 text-amber-300 flex items-center justify-center mb-2">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-white truncate max-w-[90%]">
          {alt || 'Verified Surplus Meal'}
        </span>
        <span className="text-[10px] text-stone-400 mt-0.5">
          {fallbackCategory || 'Hygienically Packed Food'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => {
        // If /images/... fails, try /src/assets/images/... or fallback
        setHasError(true);
      }}
      referrerPolicy="no-referrer"
      loading="lazy"
      {...props}
    />
  );
};
