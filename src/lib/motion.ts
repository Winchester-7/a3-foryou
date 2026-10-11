/** @author Erbol king */
import type { Transition } from 'motion/react';

/** Mirrors the CSS tokens in globals.css (--ease-out / --ease-in-out / --ease-drawer). */
export const easeOut = [0.23, 1, 0.32, 1] as const;
export const easeInOut = [0.77, 0, 0.175, 1] as const;
export const easeDrawer = [0.32, 0.72, 0, 1] as const;

/** Modals/sheets: enter with intent, leave quickly — the system is responding, not deciding. */
export const modalIn: Transition = { duration: 0.32, ease: easeOut };
export const modalOut: Transition = { duration: 0.18, ease: easeOut };

/** Side drawers (cart, mobile menu, filters). */
export const drawerIn: Transition = { duration: 0.42, ease: easeDrawer };
export const drawerOut: Transition = { duration: 0.26, ease: easeDrawer };

export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: easeOut } },
};
