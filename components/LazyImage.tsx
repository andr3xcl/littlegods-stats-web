import React, { useState, useRef, useEffect } from 'react';
import { useGSAP } from '../utils/gsap';

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
  const placeholderRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  // GSAP hooks
  const gsap = useGSAP();

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

  // Animación del placeholder (pulse)
  useEffect(() => {
    if (placeholderRef.current && !isLoaded) {
      gsap.animatePulse(placeholderRef.current, 1.5);
    }
  }, [isLoaded, gsap]);

  // Animación del spinner
  useEffect(() => {
    if (spinnerRef.current && !isLoaded) {
      gsap.animateSpinner(spinnerRef.current);
    }
  }, [isLoaded, gsap]);

  const handleLoad = () => {
    setIsLoaded(true);
    // Animar la transición de opacidad con GSAP
    if (imgRef.current) {
      gsap.to(imgRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <div ref={placeholderRef} className="absolute inset-0 bg-slate-700 flex items-center justify-center">
          <div ref={spinnerRef} className="w-8 h-8 border-2 border-slate-400 border-t-slate-200 rounded-full"></div>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : placeholder || ''}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
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
