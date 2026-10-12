'use client';

/** @author Erbol king */
import { useState } from 'react';
import { Btn, Field, TextInput } from './ui';

export function AdminLogin({ enabled }: { enabled: boolean }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'Не удалось войти');
      window.location.href = '/admin';
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="w-full max-w-sm rounded-3xl border border-line bg-paper p-8 shadow-card"
      >
        <p className="text-[11px] font-medium uppercase tracking-brand text-accent">A3 FOR YOU</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Вход в админ-панель</h1>
        {enabled ? (
          <>
            <div className="mt-6">
              <Field label="Пароль">
                <TextInput type="password" value={password} onChange={setPassword} />
              </Field>
            </div>
            {error && <p className="mt-3 text-sm text-accent">{error}</p>}
            <Btn type="submit" kind="solid" className="mt-6 w-full" disabled={busy || !password}>
              {busy ? 'Входим…' : 'Войти'}
            </Btn>
          </>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Админ-панель выключена: на сервере не задан пароль. Добавьте переменную окружения <code>ADMIN_PASSWORD</code> и
            перезапустите приложение.
          </p>
        )}
      </form>
    </div>
  );
}
