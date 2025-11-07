import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(img);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-400 border-t-slate-200 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : placeholder || ''}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
          <div className="text-slate-400 text-sm text-center p-2">
            <div className="text-2xl mb-1">🖼️</div>
            Error loading image
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
