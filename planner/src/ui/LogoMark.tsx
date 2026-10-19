/** @author Erbol king */
import { useId } from 'react';

export const LOGO_RED = 'M367 2 564 2 533 92 423 92 109 601 3 601Z';
export const LOGO_SILVER = 'M643 2 809 2 811 5 849 7 757 181 757 191 793 207 825 229 855 261 871 285 893 347 893 427 885 459 863 505 849 525 817 557 793 573 753 591 719 599 677 601 635 595 605 585 577 571 551 553 525 529 511 511 507 511 443 405 441 397 419 367 419 361 413 357 405 339 401 337 401 331 349 245 395 159 567 447 609 491 625 499 635 499 637 495 637 503 641 507 663 513 703 513 719 509 759 487 763 483 763 477 771 475 779 465 791 441 799 439 809 399 807 369 803 351 787 325 787 317 775 301 747 277 711 261 673 257 621 267 629 243 635 239 677 159 711 103 711 93 653 87 545 87 567 47 567 39 573 37 573 23 569 19 581 17 585 13 585 3 581 2Z';

/**
 * The A3 mark: red roof stroke, the "3", and a 2×2 window that lights up
 * when the surrounding link (`group`) is hovered or focused.
 * `tone="light"` is for dark backgrounds (silver 3), `dark` for light ones (graphite 3).
 */
export function LogoMark({ tone = 'dark', height = 34, className }: { tone?: 'dark' | 'light'; height?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  const light = tone === 'light';
  return (
    <svg
      viewBox="0 0 896 604"
      height={height}
      width={Math.round((height * 896) / 604)}
      fill="none"
      aria-hidden
      className={`logo-mark ${light ? 'logo-mark--light' : ''} ${className ?? ''}`}
    >
      <defs>
        <linearGradient id={`r${id}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#F2392E" />
          <stop offset="1" stopColor="#C7140E" />
        </linearGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0.6" y2="1">
          {light ? (
            <>
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.55" stopColor="#E3E5E8" />
              <stop offset="1" stopColor="#C4C8CE" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#55585E" />
              <stop offset="1" stopColor="#25272A" />
            </>
          )}
        </linearGradient>
        <filter id={`g${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      <path d={LOGO_RED} fill={`url(#r${id})`} />
      <path d={LOGO_SILVER} fill={`url(#s${id})`} />
      {/* warm light spilling out of the window — fades in on hover */}
      <rect className="logo-glow" x="255" y="406" width="160" height="160" rx="30" fill="#FFB52E" filter={`url(#g${id})`} />
      <g className="logo-window">
        <rect x="275" y="426" width="50" height="50" rx="5" style={{ transitionDelay: '0ms' }} />
        <rect x="340" y="426" width="50" height="50" rx="5" style={{ transitionDelay: '45ms' }} />
        <rect x="275" y="491" width="50" height="50" rx="5" style={{ transitionDelay: '90ms' }} />
        <rect x="340" y="491" width="50" height="50" rx="5" style={{ transitionDelay: '135ms' }} />
      </g>
    </svg>
  );
}
