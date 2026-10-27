import { ArrowDown, ArrowUp, Check, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Img } from '../../components/ui/Img';
import { useShop } from '../../context/ShopContext';
import { useCatalogVersion, useMainCategories } from '../../hooks/useCatalog';
import { cn, formatIDR } from '../../lib/format';
import { catalogStore, NEW_ARRIVALS_MAX, newestFirst } from '../../services/catalogStore';
import type { Product } from '../../types/commerce';
import { inputCls } from './AdminUi';
import { CategorySelect, matchesFilter } from './CategoryFilter';

/**
 * Homepage New Arrivals: hand-pick and order up to 8 products.
 * With nothing picked the section stays automatic (products ticked "New arrival").
 */
export function NewArrivalsEditor() {
  useCatalogVersion();
  const { notify } = useShop();
  const main = useMainCategories();
  const [filter, setFilter] = useState('all:');
  const [q, setQ] = useState('');

  const picks = catalogStore.newArrivalPicks;
  const manual = picks.length > 0;
  const auto = newestFirst(catalogStore.products.filter((p) => p.newArrival).sort((a, b) => Number(b.featured) - Number(a.featured))).slice(0, NEW_ARRIVALS_MAX);
  const shown = manual ? picks : auto;
  const full = picks.length >= NEW_ARRIVALS_MAX;

  const t = q.trim().toLowerCase();
  const candidates = catalogStore.products.filter((p) => matchesFilter(p, filter) && (!t || `${p.name} ${p.sku} ${p.motif}`.toLowerCase().includes(t)));

  const save = async (ids: string[], msg: string) => {
    try {
      await catalogStore.saveNewArrivals(ids);
      notify(msg);
    } catch {
      notify('Gagal menyimpan');
    }
  };
  const ids = picks.map((p) => p.id);
  const add = (p: Product) => save([...ids, p.id], `${p.name} ditambahkan`);
  const remove = (p: Product) => save(ids.filter((id) => id !== p.id), ids.length === 1 ? 'Kembali ke mode otomatis' : `${p.name} dihapus dari New Arrivals`);
  const move = (i: number, d: -1 | 1) => {
    const next = [...ids];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    void save(next, 'Urutan disimpan');
  };

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl">New Arrivals</h2>
          <p className="mt-3 max-w-xl text-sm text-stone">
            Pilih dan urutkan maksimal {NEW_ARRIVALS_MAX} produk untuk section New Arrivals di homepage. Tab Women / Men / Kebaya / Accessories di homepage menampilkan pilihan
            yang sesuai kategorinya.
          </p>
        </div>
        <p className={cn('shrink-0 self-start px-3 py-1.5 text-[0.65rem] sm:self-auto tracking-[0.12em] uppercase', manual ? 'bg-ink text-ivory' : 'bg-mist text-stone')}>
          {manual ? `Dipilih manual · ${picks.length}/${NEW_ARRIVALS_MAX}` : 'Otomatis'}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* What the homepage shows now */}
        <div>
          <p className="eyebrow text-[0.62rem] text-ink/70">Tampil di homepage</p>
          {!manual && (
            <p className="mt-2 text-xs leading-relaxed text-stone">
              Mode otomatis: produk yang dicentang “New arrival” di form produk — produk yang baru ditambahkan di depan, lalu yang “Featured”. Tambahkan produk dari daftar di
              kanan untuk mengatur sendiri.
            </p>
          )}
          <ol className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {shown.map((p, i) => (
              <li key={p.id} className={cn('grid grid-cols-[1.5rem_2.75rem_1fr_auto] items-center gap-3 py-2.5', !manual && 'opacity-70')}>
                <span className="text-xs text-stone tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <div className="relative aspect-[2/3] overflow-hidden bg-sand">{p.images[0] && <Img asset={p.images[0]} sizes="44px" />}</div>
                <div className="min-w-0">
                  <p className="truncate text-sm">{p.name}</p>
                  <p className="truncate text-xs text-stone">
                    {main.find((c) => c.slug === p.category)?.shortName} · {formatIDR(p.price)}
                  </p>
                </div>
                {manual && (
                  <div className="flex">
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-2 disabled:opacity-20" aria-label={`Naikkan ${p.name}`} title="Naikkan">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" disabled={i === picks.length - 1} onClick={() => move(i, 1)} className="p-2 disabled:opacity-20" aria-label={`Turunkan ${p.name}`} title="Turunkan">
                      <ArrowDown size={14} />
                    </button>
                    <button type="button" onClick={() => remove(p)} className="p-2 text-danger/80 hover:text-danger" aria-label={`Hapus ${p.name}`} title="Hapus dari New Arrivals">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </li>
            ))}
            {shown.length === 0 && <li className="py-8 text-center text-sm text-stone">Belum ada produk New arrival.</li>}
          </ol>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            {!manual && auto.length > 0 && (
              <button type="button" onClick={() => save(auto.map((p) => p.id), 'Daftar otomatis disalin — sekarang bisa diatur')} className="link-under tracking-[0.12em] uppercase">
                Atur dari daftar ini
              </button>
            )}
            {manual && (
              <button type="button" onClick={() => window.confirm('Kembali ke mode otomatis? Pilihan manual akan dihapus.') && save([], 'Kembali ke mode otomatis')} className="text-stone hover:text-ink">
                Kembali ke otomatis
              </button>
            )}
          </div>
        </div>

        {/* Picker */}
        <div>
          <p className="eyebrow text-[0.62rem] text-ink/70">Tambah produk</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search size={15} strokeWidth={1.25} className="absolute top-1/2 left-3 -translate-y-1/2 text-stone" />
              <input className={cn(inputCls, 'pl-9')} placeholder="Cari nama / SKU / motif" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <CategorySelect className="sm:w-56" value={filter} onChange={setFilter} />
          </div>
          {full && <p className="mt-3 text-xs text-bronze">Sudah {NEW_ARRIVALS_MAX} produk — hapus satu di kiri untuk menambah yang lain.</p>}
          <ul className="mt-3 max-h-[26rem] divide-y divide-ink/10 overflow-y-auto border-y border-ink/10">
            {candidates.map((p) => {
              const picked = ids.includes(p.id);
              return (
                <li key={p.id} className="grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 py-2.5 pr-1">
                  <div className="relative aspect-[2/3] overflow-hidden bg-sand">{p.images[0] && <Img asset={p.images[0]} sizes="44px" />}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{p.name}</p>
                    <p className="truncate text-xs text-stone">
                      {p.sku} · {formatIDR(p.price)}
                      {p.newArrival && <span className="ml-2 bg-mist px-1.5 py-0.5 text-[0.58rem] tracking-[0.1em] uppercase">New</span>}
                    </p>
                  </div>
                  {picked ? (
                    <span className="flex h-9 items-center gap-1 px-3 text-xs text-stone">
                      <Check size={13} /> Dipilih
                    </span>
                  ) : (
                    <button type="button" disabled={full} onClick={() => add(p)} className="flex h-9 items-center gap-1 border border-ink/25 px-3 text-xs hover:border-ink disabled:opacity-30">
                      <Plus size={13} /> Tambah
                    </button>
                  )}
                </li>
              );
            })}
            {candidates.length === 0 && <li className="py-8 text-center text-sm text-stone">Tidak ada produk.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
