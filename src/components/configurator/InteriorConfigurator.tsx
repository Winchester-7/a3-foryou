'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLeadDialog } from '@/components/forms/LeadDialog';

export type ConfRoom = { id: string; title: string; image: string; hint: string };
export type ConfTile = { slug: string; name: string; brand: string; look: string; texture: string; hint: string };

export function InteriorConfigurator({ rooms, tiles }: { rooms: ConfRoom[]; tiles: ConfTile[] }) {
  const { open } = useLeadDialog();
  const [room, setRoom] = useState(rooms[0]);
  const [tile, setTile] = useState(tiles[0]);
  const looks = Array.from(new Set(tiles.map((t) => t.look)));
  const [look, setLook] = useState<string>('Все');

  const visible = look === 'Все' ? tiles : tiles.filter((t) => t.look === look);

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
        {/* Preview stage */}
        <div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-3xl bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={room.id}
              src={room.image}
              alt={room.title}
              className="img-in absolute inset-0 h-full w-full object-cover"
            />

            {/* Floor overlay — selected tile projected onto the lower part of the scene */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] [perspective:900px]">
              <div
                key={tile.slug}
                className="absolute inset-0 origin-bottom transition-opacity duration-300"
                style={{
                  opacity: 0.9,
                  transform: 'rotateX(64deg) scale(1.9)',
                  backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 30%, rgba(0,0,0,0.05) 100%), url(${tile.texture})`,
                  backgroundSize: 'auto, 34% auto',
                  backgroundRepeat: 'no-repeat, repeat',
                  mixBlendMode: 'multiply',
                  maskImage: 'linear-gradient(180deg, transparent 0%, #000 22%, #000 100%)',
                  WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 22%, #000 100%)',
                }}
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-ink/10 to-transparent" />

            <div className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide2 text-ink">
              {room.title}
            </div>
            <div className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-4 py-2 text-xs text-ink">
              <span className="font-medium">{tile.name}</span>
              <span className="text-ink-faint"> · {tile.brand}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-ink-faint">
            Предпросмотр носит ознакомительный характер. Точную раскладку и визуализацию в 3D подготовит дизайнер.
          </p>

          {/* Room switcher */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {rooms.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoom(r)}
                className={`group overflow-hidden rounded-2xl border text-left transition-colors ${
                  r.id === room.id ? 'border-accent' : 'border-line hover:border-ink-faint'
                }`}
              >
                <span className="relative block aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <span className={`absolute inset-0 transition-colors ${r.id === room.id ? 'bg-accent/10' : 'bg-ink/10 group-hover:bg-transparent'}`} />
                </span>
                <span className="block px-3 py-2 text-[13px] font-medium text-ink">{r.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tile picker */}
        <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
          <p className="eyebrow">Керамогранит</p>
          <p className="mt-2 text-sm text-ink-soft">{room.hint}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {['Все', ...looks].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLook(l)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-[color,background-color,border-color,transform] duration-200 ease-out-strong active:scale-[0.96] ${
                  look === l ? 'border-accent bg-accent text-paper' : 'border-line text-ink-soft hover:border-ink-faint hover:text-ink'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="mt-5 grid max-h-[46vh] grid-cols-3 gap-3 overflow-y-auto pr-1 lg:max-h-[52vh]">
            {visible.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setTile(t)}
                className={`group relative aspect-square overflow-hidden rounded-xl ring-1 transition ${
                  t.slug === tile.slug ? 'ring-accent ring-2' : 'ring-line hover:ring-ink-faint'
                }`}
                title={`${t.name} · ${t.brand}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.texture} alt={t.name} className="absolute inset-0 h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-line p-5">
            <p className="text-sm font-medium text-ink">{tile.name}</p>
            <p className="mt-1 text-xs text-ink-soft">{tile.hint}</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => open('consult', `Конфигуратор: ${room.title}, керамогранит «${tile.name}»`)}
                className="btn-accent w-full"
              >
                Обсудить проект
              </button>
              <Link href={`/collection/${tile.slug}`} className="btn-outline w-full">
                Открыть коллекцию
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
