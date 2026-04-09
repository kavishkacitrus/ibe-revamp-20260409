'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    stagger?: number;
    threshold?: number;
    once?: boolean;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    className = '',
    stagger = 0,
    threshold = 0.1,
    once = true
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold, once]);

    return (
        <div
            ref={ref}
            className={`${className} reveal-on-scroll ${isVisible ? 'is-visible' : ''}`}
            style={{ transitionDelay: `${stagger}s` }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
