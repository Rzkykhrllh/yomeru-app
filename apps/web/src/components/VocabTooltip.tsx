"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface VocabTooltipProps {
  furigana: string;
  meaning: string;
  children: ReactNode;
}

export default function VocabTooltip({ furigana, meaning, children }: VocabTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 300); // 300ms delay
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none animate-fade-in"
        >
          <div className="bg-panel border border-line rounded-xl shadow-soft px-3 py-2 min-w-max">
            <div className="text-xs text-muted text-center mb-0.5">{furigana}</div>
            <div className="text-sm font-semibold text-ink text-center whitespace-nowrap">{meaning}</div>
          </div>
        </div>
      )}
    </span>
  );
}
