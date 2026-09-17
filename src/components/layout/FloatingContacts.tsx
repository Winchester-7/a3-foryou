'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { site } from '@/lib/site';
import { useLeadDialog } from '@/components/forms/LeadDialog';

const ease = [0.22, 1, 0.36, 1] as const;

export function FloatingContacts() {
  const { open } = useLeadDialog();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            aria-label="Наверх"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-ink shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-float"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
              <path d="M8 13V4M3 8l5-5 5 5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Callback (mobile-first quick action) */}
      <button
        type="button"
        onClick={() => open('callback')}
        aria-label="Заказать обратный звонок"
        className="grid h-12 w-12 place-items-center rounded-full border border-line bg-paper text-ink shadow-card transition-transform hover:-translate-y-0.5 hover:border-accent hover:text-accent md:hidden"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 5c0 8.3 6.7 15 15 15 .6 0 1-.4 1-1v-3.3c0-.4-.3-.8-.7-.9l-3.6-1a1 1 0 0 0-1 .3l-1 1.2A12 12 0 0 1 8.4 9.3l1.2-1a1 1 0 0 0 .3-1l-1-3.6A1 1 0 0 0 8 3H4.7c-.4 0-.7.3-.7.7Z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>

      {/* Fixed WhatsApp button */}
      <motion.a
        href={site.whatsapp}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`WhatsApp ${site.whatsappNumber}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3, ease }}
        className="grid h-14 w-14 place-items-center rounded-full text-white shadow-float"
        style={{ background: '#25D366' }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.4 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.9-1c.2-.2.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.6-.1 1.2Z" />
        </svg>
      </motion.a>
    </div>
  );
}
