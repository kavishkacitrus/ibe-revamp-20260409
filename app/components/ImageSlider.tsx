'use client';

import { useState, useEffect, useCallback } from 'react';

interface ImageSliderProps {
    images: string[];
    alt: string;
}

const ImageSlider = ({ images, alt }: ImageSliderProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        if (isPaused || images.length <= 1) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 3000); // 3 seconds interval

        return () => clearInterval(interval);
    }, [nextSlide, isPaused, images.length]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full bg-zinc-100 :bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-400 text-xs italic font-light uppercase tracking-widest">No images</span>
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <img
                src={images[0]}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
        );
    }

    return (
        <div
            className="relative w-full h-full group/slider overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Images */}
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <img
                        src={image}
                        alt={`${alt} - ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>
            ))}

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 transition-opacity duration-300 opacity-60 group-hover/slider:opacity-100">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(index);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'bg-brand-gold w-4'
                            : 'bg-white/50 hover:bg-white'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Left/Right Arrows (Visible on hover) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover/slider:opacity-100 hover:bg-black/40 transition-all z-10"
                aria-label="Previous slide"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover/slider:opacity-100 hover:bg-black/40 transition-all z-10"
                aria-label="Next slide"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>
        </div>
    );
};

export default ImageSlider;
