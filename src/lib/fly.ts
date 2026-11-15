/**
 * "Product goes into the cart": a small tile carrying the product photo leaves the button,
 * travels along an arc to the cart icon in the header, shrinking and turning; on arrival it
 * bursts into tile chips and the cart icon bumps (see CartButton, which listens to `cart:bump`).
 * Browser only. Silent no-op for "reduce motion" — only the bump event is sent.
 * @author Erbol king
 */

export const CART_BUMP_EVENT = 'cart:bump';

const reduced = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function visibleTarget(): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>('[data-cart-target]');
  for (const el of Array.from(all)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

export function flyToCart(from: Element | null, image?: string): void {
  if (typeof window === 'undefined') return;
  const target = visibleTarget();
  if (!target || !from || reduced()) {
    window.dispatchEvent(new Event(CART_BUMP_EVENT));
    return;
  }

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = 60;
  const sx = a.left + a.width / 2 - size / 2;
  const sy = a.top + a.height / 2 - size / 2;
  const ex = b.left + b.width / 2 - size / 2;
  const ey = b.top + b.height / 2 - size / 2;
  const dx = ex - sx;
  const dy = ey - sy;
  // the arc rises first (a tile is "tossed"), then falls into the cart
  const lift = Math.min(160, Math.max(70, Math.abs(dy) * 0.35 + 70));

  const chip = document.createElement('div');
  chip.setAttribute('aria-hidden', 'true');
  Object.assign(chip.style, {
    position: 'fixed',
    left: `${sx}px`,
    top: `${sy}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '14px',
    zIndex: '300',
    pointerEvents: 'none',
    background: image ? `#e8e4dd url("${image.replace(/"/g, '%22')}") center/cover` : '#E0241B',
    boxShadow: '0 10px 28px rgba(0,0,0,.28), inset 0 0 0 2px rgba(255,255,255,.7)',
    willChange: 'transform, opacity',
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(chip);

  const flight = chip.animate(
    [
      { transform: 'translate(0,0) scale(.85) rotate(0deg)', opacity: 0.0, offset: 0 },
      { transform: `translate(${dx * 0.18}px,${-lift}px) scale(1.12) rotate(-14deg)`, opacity: 1, offset: 0.28, easing: 'cubic-bezier(.4,0,.9,.5)' },
      { transform: `translate(${dx * 0.62}px,${dy * 0.45 - lift * 0.4}px) scale(.7) rotate(120deg)`, opacity: 1, offset: 0.7 },
      { transform: `translate(${dx}px,${dy}px) scale(.22) rotate(270deg)`, opacity: 0.9, offset: 1 },
    ],
    { duration: 760, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' },
  );

  let landed = false;
  const land = () => {
    if (landed) return;
    landed = true;
    chip.remove();
    burst(b.left + b.width / 2, b.top + b.height / 2);
    window.dispatchEvent(new Event(CART_BUMP_EVENT));
  };
  flight.onfinish = land;
  flight.oncancel = () => chip.remove();
  // failsafe: a throttled or background tab must never leave the tile hanging on the page
  window.setTimeout(land, 1500);
}

/** a handful of tile chips scatter from the cart icon */
function burst(cx: number, cy: number) {
  const colors = ['#E0241B', '#232323', '#ffc93c', '#c9c3b9', '#E0241B', '#ffffff'];
  const n = 10;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    const s = 5 + (i % 3) * 2;
    Object.assign(p.style, {
      position: 'fixed',
      left: `${cx - s / 2}px`,
      top: `${cy - s / 2}px`,
      width: `${s}px`,
      height: `${s}px`,
      borderRadius: '2px',
      background: colors[i % colors.length],
      boxShadow: '0 0 0 1px rgba(0,0,0,.08)',
      zIndex: '300',
      pointerEvents: 'none',
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(p);
    const ang = (Math.PI * 2 * i) / n + (i % 2 ? 0.25 : -0.1);
    const dist = 26 + (i % 4) * 9;
    const anim = p.animate(
      [
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist + 8}px) rotate(${i % 2 ? 200 : -200}deg) scale(.2)`, opacity: 0 },
      ],
      { duration: 520 + (i % 3) * 60, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
    );
    anim.onfinish = () => p.remove();
    anim.oncancel = () => p.remove();
  }
}
