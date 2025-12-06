import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIconSize?: number;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({ 
  className, 
  alt, 
  fallbackIconSize = 24,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {(!isLoaded || hasError) && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-0">
          <ImageIcon className="text-gray-300" size={fallbackIconSize} />
        </div>
      )}
      <img
        {...props}
        alt={alt}
        className={`${className} ${isLoaded && !hasError ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true); // Stop loading loop, show fallback/placeholder styling
        }}
      />
    </>
  );
};