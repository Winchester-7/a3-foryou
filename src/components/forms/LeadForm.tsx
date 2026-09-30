'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type LeadKind = 'callback' | 'request' | 'consult';

const field =
  'w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink focus:bg-paper';

export function LeadForm({
  kind,
  subject,
  onDone,
  compact = false,
}: {
  kind: LeadKind;
  subject?: string;
  onDone?: () => void;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if ((data.company as string)?.length) return; // honeypot
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, subject, ...data }),
      });
      if (!res.ok) throw new Error('bad response');
      setStatus('done');
      form.reset();
      setTimeout(() => onDone?.(), 2200);
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'mt-0 space-y-3' : 'mt-6 space-y-3'}>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className={kind === 'callback' ? '' : 'grid gap-3 sm:grid-cols-2'}>
        <input name="name" required placeholder="Имя" className={field} autoComplete="name" />
        <input
          name="phone"
          required
          placeholder="+7 (___) ___-__-__"
          className={`${field} ${kind === 'callback' ? 'mt-3' : ''}`}
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      {kind !== 'callback' && (
        <>
          <input name="email" type="email" placeholder="E-mail" className={field} autoComplete="email" />
          <textarea
            name="message"
            rows={compact ? 2 : 3}
            placeholder={
              kind === 'consult'
                ? 'Опишите задачу: помещение, площадь, стиль'
                : 'Комментарий: интересующие коллекции, объём, сроки'
            }
            className={`${field} resize-none`}
            defaultValue={subject ? `Интересует: ${subject}` : undefined}
          />
        </>
      )}

      <label className="flex items-start gap-2.5 pt-1 text-xs text-ink-faint">
        <input type="checkbox" required className="mt-0.5 accent-ink" defaultChecked />
        <span>Согласен на обработку персональных данных и получение ответа по заявке.</span>
      </label>

      <button
        type="submit"
        disabled={status === 'sending' || status === 'done'}
        className="btn-solid mt-1 w-full disabled:opacity-60"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {status === 'idle' && (kind === 'callback' ? 'Жду звонка' : 'Отправить заявку')}
            {status === 'sending' && 'Отправляем…'}
            {status === 'done' && 'Заявка принята ✓'}
            {status === 'error' && 'Ошибка — повторить'}
          </motion.span>
        </AnimatePresence>
      </button>

      {status === 'done' && (
        <p className="text-center text-xs text-ink-soft">Спасибо! Мы свяжемся с вами в ближайшее время.</p>
      )}
    </form>
  );
}
