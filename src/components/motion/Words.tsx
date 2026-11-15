'use client';

/**
 * Heading whose words rise one by one out of an invisible line, like tiles being slid into a row.
 * Plain text for search engines and screen readers; visible by default (see `.js` rule in CSS).
 * @author Erbol king
 */
import { useRef } from 'react';
import { useLand } from './TileIn';

export function Words({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLand(ref);
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span ref={ref} className={`words ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i} className="word">
            <span className="word-in" style={{ ['--i' as string]: i }}>
              {w}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </span>
  );
}
