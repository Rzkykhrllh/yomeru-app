"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface VocabTooltipProps {
  furigana: string;
  meaning: string;
  children: ReactNode;
}

export default function VocabTooltip({ furigana, meaning, children }: VocabTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositionCalculated, setIsPositionCalculated] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // 8px above
        left: rect.left + rect.width / 2, // center of element
      });
      setIsPositionCalculated(true);
    }
  };

  const handleMouseEnter = () => {
    // Calculate position immediately on hover
    updatePosition();
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 300); // 300ms delay
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setIsPositionCalculated(false);
  };

  useEffect(() => {
    // Update position on scroll or resize while tooltip is visible
    if (isVisible) {
      const handleUpdate = () => updatePosition();
      
      window.addEventListener('scroll', handleUpdate, true); // capture phase for all scrolls
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      
      {isVisible && isPositionCalculated && typeof window !== "undefined" && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)',
            transition: 'opacity 0.15s ease-out',
            opacity: 1,
          }}
        >
          <div className="bg-panel border border-line rounded-xl shadow-card px-3 py-2 min-w-max">
            <div className="text-xs text-muted text-center mb-0.5">{furigana}</div>
            <div className="text-sm font-semibold text-ink text-center whitespace-nowrap">{meaning}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
