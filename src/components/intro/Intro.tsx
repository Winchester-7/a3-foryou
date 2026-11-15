'use client';

/**
 * Opening scene: the A3 mark spins up like a ceramic coin, its window lights switch on pane by
 * pane, then the mark flies to its place in the header while the dark wall — made of tiles —
 * flips away and the site is revealed underneath.
 *
 * Plays on the home page once per browser session. Skipped for "reduce motion".
 * The page is never blocked: a failsafe removes the overlay even if the timeline fails.
 * @author Erbol king
 */
import { useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogoMark } from '@/components/brand/LogoMark';

const SEEN_KEY = 'a3-intro-seen';
const TILE = 96; // px, approximate size of one wall tile
const EASE = 'cubic-bezier(.22,1,.36,1)';
const EASE_IN_OUT = 'cubic-bezier(.65,0,.25,1)';

export function Intro() {
  const pathname = usePathname();
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const wall = useRef<HTMLDivElement>(null);
  const sub = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    if (!el) return;
    if (pathname !== '/' || html.classList.contains('no-intro')) {
      setDone(true);
      return;
    }

    let finished = false;
    const timers: number[] = [];
    const anims: Animation[] = [];
    const run = (node: Element | null, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
      if (!node) return null;
      const a = node.animate(frames, { fill: 'both', ...opts });
      anims.push(a);
      return a;
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach((t) => window.clearTimeout(t));
      anims.forEach((a) => a.cancel());
      html.classList.remove('intro-on');
      html.classList.add('no-intro');
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* private mode — the intro simply plays again next visit */
      }
      setDone(true);
    };

    html.classList.add('intro-on');
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 1. the wall: a grid of tiles, built from the viewport size
    const cols = Math.ceil(vw / TILE);
    const rows = Math.ceil(vh / TILE);
    const tw = vw / cols;
    const th = vh / rows;
    const wallEl = wall.current;
    if (wallEl) {
      wallEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      wallEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
      const frag = document.createDocumentFragment();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = document.createElement('i');
          t.className = 'intro-tile';
          frag.appendChild(t);
        }
      }
      wallEl.replaceChildren(frag);
    }

    // 2. the coin spin of the mark + the windows lighting up
    const markEl = mark.current;
    const from = markEl?.getBoundingClientRect(); // measured at rest, before any transform is applied
    run(
      markEl,
      [
        { opacity: 0, transform: 'perspective(900px) rotateY(-200deg) scale(.55)' },
        { opacity: 1, transform: 'perspective(900px) rotateY(0deg) scale(1)' },
      ],
      { duration: 1100, delay: 150, easing: EASE },
    );
    run(sub.current, [{ opacity: 0, letterSpacing: '0.9em' }, { opacity: 1, letterSpacing: '0.38em' }], { duration: 900, delay: 700, easing: EASE });
    const panes = el.querySelectorAll<SVGRectElement>('.logo-window rect');
    panes.forEach((p, i) => {
      run(p, [{ fill: 'rgba(255,255,255,0.18)' }, { fill: '#ffc93c' }], { duration: 260, delay: 1000 + i * 150, easing: 'ease-out' });
    });
    run(el.querySelector('.logo-glow'), [{ opacity: 0 }, { opacity: 0.9 }], { duration: 500, delay: 1300, easing: 'ease-out' });

    // 3. the mark flies to the header, the wall flips away from the centre outwards
    const FLY = 1900;
    const target = document.querySelector('[data-site-logo] svg.logo-mark');
    if (markEl && from && target) {
      const to = target.getBoundingClientRect();
      if (to.width > 0) {
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);
        const s = to.width / from.width;
        run(
          markEl,
          [
            { transform: 'perspective(900px) translate(0,0) rotateY(0deg) scale(1)' },
            { transform: `perspective(900px) translate(${dx}px,${dy}px) rotateY(360deg) scale(${s})` },
          ],
          { duration: 900, delay: FLY, easing: EASE_IN_OUT, fill: 'forwards' },
        );
        run(markEl, [{ opacity: 1 }, { opacity: 0 }], { duration: 220, delay: FLY + 840, easing: 'linear', fill: 'forwards' });
      }
    } else {
      run(markEl, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: FLY, easing: EASE, fill: 'forwards' });
    }
    run(sub.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: FLY - 100, easing: 'linear', fill: 'forwards' });

    const tiles = wallEl ? Array.from(wallEl.children) : [];
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const maxD = Math.hypot(cx * tw, cy * th) || 1;
    tiles.forEach((t, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const d = Math.hypot((c - cx) * tw, (r - cy) * th) / maxD; // 0 centre … 1 corner
      run(
        t,
        [
          { opacity: 1, transform: 'perspective(500px) rotateX(0deg) scale(1)' },
          { opacity: 0, transform: `perspective(500px) rotateX(${i % 2 ? 100 : -100}deg) scale(.55)` },
        ],
        { duration: 520, delay: FLY + 260 + d * 560, easing: 'cubic-bezier(.5,0,.75,0)' },
      );
    });
    run(el, [{ backgroundColor: 'rgba(24,24,24,1)' }, { backgroundColor: 'rgba(24,24,24,0)' }], { duration: 500, delay: FLY + 260, easing: 'ease-in' });

    // the hero underneath starts its own entrance just as the wall begins to open
    timers.push(window.setTimeout(() => html.classList.remove('intro-on'), FLY + 150));
    timers.push(window.setTimeout(finish, FLY + 260 + 560 + 520 + 120));
    timers.push(window.setTimeout(finish, 6500)); // failsafe

    const skip = () => finish();
    el.addEventListener('click', skip);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('click', skip);
      window.removeEventListener('keydown', onKey);
      timers.forEach((t) => window.clearTimeout(t));
      anims.forEach((a) => a.cancel());
      html.classList.remove('intro-on');
    };
  }, [pathname]);

  if (done || pathname !== '/') return null;

  return (
    <div ref={root} className="intro" aria-hidden>
      <div ref={wall} className="intro-wall" />
      <div className="intro-center">
        <div ref={mark} className="intro-mark">
          <LogoMark tone="light" height={132} />
        </div>
        <span ref={sub} className="intro-sub">
          For&nbsp;You
        </span>
      </div>
    </div>
  );
}
