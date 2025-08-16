'use client';

import { useEffect, RefObject } from 'react';

interface UseClickOutsideProps {
  ref: RefObject<HTMLElement | null>;
  handler: () => void;
  enabled?: boolean;
  excludeRefs?: RefObject<HTMLElement | null>[];
}

export function useClickOutside({ 
  ref, 
  handler, 
  enabled = true, 
  excludeRefs = [] 
}: UseClickOutsideProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is inside the main ref
      if (ref.current && ref.current.contains(target)) {
        return;
      }
      
      // Check if click is inside any excluded refs
      for (const excludeRef of excludeRefs) {
        if (excludeRef.current && excludeRef.current.contains(target)) {
          return;
        }
      }
      
      // Click is outside, call handler
      handler();
    };

    // Add event listener immediately without delay
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, handler, enabled, excludeRefs]);
}
