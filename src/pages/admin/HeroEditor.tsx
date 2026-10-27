import { ArrowDown, ArrowUp, Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Img } from '../../components/ui/Img';
import { useShop } from '../../context/ShopContext';
import { categories, collections } from '../../data/catalog';
import type { HeroSlide } from '../../data/homeHero';
import { useHeroSlides, useSegmentCategories } from '../../hooks/useCatalog';
import { cn } from '../../lib/format';
import { catalogStore } from '../../services/catalogStore';
import type { ImageAsset } from '../../types/commerce';
import { DropZone, Drawer, Field, inputCls, textareaCls } from './AdminUi';
import { processUpload } from './imageTools';

const FRAME_LABELS = ['Kiri', 'Tengah', 'Kanan'];
const newId = () => `slide-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const parseFocus = (f?: string): [number, number] => {
  const m = f?.match(/(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  return m ? [Number(m[1]), Number(m[2])] : [50, 50];
};

/** Homepage hero: the list of slides (order, duplicate, delete) + the slide editor. */
export function HeroEditor() {
  const { notify } = useShop();
  const slides = useHeroSlides();
  const [editing, setEditing] = useState<HeroSlide | undefined>();
  const [open, setOpen] = useState(false);

  const save = async (list: HeroSlide[], msg: string) => {
    try {
      await catalogStore.saveHero(list);
      notify(msg);
    } catch {
      notify('Gagal menyimpan');
    }
  };
  const move = (i: number, d: -1 | 1) => {
    const next = [...slides];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    void save(next, 'Urutan slide disimpan');
  };
  const duplicate = (s: HeroSlide, i: number) => {
    const next = [...slides];
    next.splice(i + 1, 0, { ...s, id: newId(), eyebrow: `${s.eyebrow} (Copy)` });
    void save(next, 'Slide diduplikat');
  };
  const remove = (s: HeroSlide) => {
    if (slides.length <= 1) return notify('Minimal harus ada 1 slide');
    if (window.confirm(`Hapus slide “${s.title.join(' ')}”?`)) void save(slides.filter((x) => x.id !== s.id), 'Slide dihapus');
  };
  const onSaved = (s: HeroSlide) => {
    const exists = slides.some((x) => x.id === s.id);
    return save(exists ? slides.map((x) => (x.id === s.id ? s : x)) : [...slides, s], exists ? 'Slide disimpan' : 'Slide ditambahkan');
  };

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl">Hero</h2>
          <p className="mt-3 max-w-xl text-sm text-stone">
            Slide besar paling atas homepage, berganti tiap 7 detik. Tiap slide = 3 foto dari satu look (kiri · tengah · kanan); di HP hanya foto tengah yang tampil.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {catalogStore.isHeroEdited && (
            <button type="button" onClick={() => window.confirm('Kembalikan hero ke 3 slide bawaan?') && catalogStore.resetHero().then(() => notify('Hero dikembalikan ke bawaan'))} className="text-xs text-stone underline underline-offset-4 hover:text-ink">
              Reset ke bawaan
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
            className="btn-ink h-11 px-5"
          >
            <Plus size={15} strokeWidth={1.5} /> Tambah slide
          </button>
        </div>
      </div>

      <ol className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {slides.map((s, i) => (
          <li key={s.id} className="flex flex-col bg-paper">
            <div className="relative grid aspect-[16/9] grid-cols-[1fr_1.45fr_1fr] gap-px overflow-hidden bg-ink">
              {s.frames.map((f, fi) => (
                <div key={fi} className="relative overflow-hidden">
                  <Img asset={f} sizes="160px" />
                </div>
              ))}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgba(20,18,16,.75))]" />
              <span className="absolute top-2 left-2 bg-ivory/90 px-2 py-1 text-[0.6rem] tracking-[0.12em] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <p className="absolute bottom-3 left-3 font-serif text-xl leading-none text-ivory">
                {s.title[0]} <em>{s.title[1]}</em>
              </p>
              <div className="absolute top-2 right-2 flex bg-ivory/90">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-2 disabled:opacity-25" aria-label="Geser ke depan" title="Geser ke depan">
                  <ArrowUp size={14} />
                </button>
                <button type="button" disabled={i === slides.length - 1} onClick={() => move(i, 1)} className="p-2 disabled:opacity-25" aria-label="Geser ke belakang" title="Geser ke belakang">
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[0.62rem] tracking-[0.14em] text-stone uppercase">{s.eyebrow}</p>
              <p className="mt-1 line-clamp-2 text-xs text-stone">{s.text}</p>
              <p className="mt-1 truncate text-[0.7rem] text-stone">
                Tombol: {s.cta.label} → {s.cta.to}
              </p>
              <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-4 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(s);
                    setOpen(true);
                  }}
                  className="link-under inline-flex items-center gap-1 tracking-[0.12em] uppercase"
                >
                  <Pencil size={12} strokeWidth={1.4} /> Edit slide
                </button>
                <button type="button" onClick={() => duplicate(s, i)} className="inline-flex items-center gap-1 text-stone hover:text-ink">
                  <Copy size={12} strokeWidth={1.4} /> Duplikat
                </button>
                <button type="button" onClick={() => remove(s)} className="inline-flex items-center gap-1 text-danger/80 hover:text-danger">
                  <Trash2 size={12} strokeWidth={1.4} /> Hapus
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <HeroSlideDrawer open={open} slide={editing} onClose={() => setOpen(false)} onSave={onSaved} />
    </section>
  );
}

/* ------------------------------------------------------------------ */

function HeroSlideDrawer({ open, slide, onClose, onSave }: { open: boolean; slide?: HeroSlide; onClose: () => void; onSave: (s: HeroSlide) => Promise<void> }) {
  const { notify } = useShop();
  const women = useSegmentCategories('women');
  const men = useSegmentCategories('men');
  const [eyebrow, setEyebrow] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [text, setText] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaTo, setCtaTo] = useState('');
  const [lookSlug, setLookSlug] = useState('');
  const [frames, setFrames] = useState<Array<ImageAsset | undefined>>([undefined, undefined, undefined]);
  const [active, setActive] = useState(1);
  const [source, setSource] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const products = catalogStore.products;
  const slugFromLink = (to: string) => to.match(/^\/product\/(.+)$/)?.[1] ?? '';

  useEffect(() => {
    if (!open) return;
    setEyebrow(slide?.eyebrow ?? '');
    setLine1(slide?.title[0] ?? '');
    setLine2(slide?.title[1] ?? '');
    setText(slide?.text ?? '');
    setCtaLabel(slide?.cta.label ?? 'Shop Collection');
    setCtaTo(slide?.cta.to ?? '/shop?new=1');
    const look = slide ? slugFromLink(slide.look.to) : '';
    setLookSlug(look);
    setSource(look);
    setFrames(slide ? [0, 1, 2].map((i) => slide.frames[i]) : [undefined, undefined, undefined]);
    setActive(1);
    setError('');
  }, [open, slide]);

  const lookProduct = products.find((p) => p.slug === lookSlug);
  const sourcePhotos = (products.find((p) => p.slug === source)?.images ?? []).filter((im) => !im.pending);
  const frame = frames[active];
  const [fx, fy] = parseFocus(frame?.focus);

  const setFrame = (f: ImageAsset | undefined) => setFrames((list) => list.map((x, i) => (i === active ? f : x)));
  const setFocus = (x: number, y: number) => frame && setFrame({ ...frame, focus: `${x}% ${y}%` });

  const links = useMemo(
    () => [
      '/shop?new=1',
      '/women',
      ...women.filter((c) => c.slug !== 'all').map((c) => `/women/${c.slug}`),
      '/men',
      ...men.filter((c) => c.slug !== 'all').map((c) => `/men/${c.slug}`),
      ...categories.filter((c) => c.slug !== 'women' && c.slug !== 'men').map((c) => `/shop/${c.slug}`),
      '/collections',
      ...collections.map((c) => `/shop?collection=${c.slug}`),
      '/about',
      '/wholesale',
    ],
    [women, men],
  );

  const upload = async (files: File[]) => {
    setBusy('upload');
    try {
      // Several files at once fill the empty frames from the one being edited onwards
      const made: ImageAsset[] = [];
      for (const file of files.slice(0, 3)) {
        const img = await processUpload(file, 1600);
        const url = await catalogStore.saveImage(img.blob);
        made.push({ src: '', url, alt: `${line1} ${line2} — hero`.trim(), ratio: img.width / img.height, focus: '50% 30%', credit: 'Uploaded via demo admin' });
      }
      setFrames((list) => {
        const next = [...list];
        made.forEach((m, k) => {
          next[(active + k) % 3] = m;
        });
        return next;
      });
    } catch {
      notify('Gagal memproses gambar');
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    if (!line1.trim()) return setError('Judul baris 1 wajib diisi');
    if (frames.some((f) => !f)) return setError('Lengkapi 3 foto (kiri, tengah, kanan)');
    if (!ctaLabel.trim() || !ctaTo.trim()) return setError('Isi teks dan link tombol');
    if (!lookProduct) return setError('Pilih produk yang dipakai di foto (look)');
    setBusy('save');
    try {
      await onSave({
        id: slide?.id ?? newId(),
        eyebrow: eyebrow.trim(),
        title: [line1.trim(), line2.trim()],
        text: text.trim(),
        cta: { label: ctaLabel.trim(), to: ctaTo.trim() },
        look: { label: lookProduct.name, to: `/product/${lookProduct.slug}` },
        frames: frames as ImageAsset[],
      });
      onClose();
    } finally {
      setBusy(null);
    }
  };

  const preview = (mobile: boolean) => (
    <div className={cn('relative overflow-hidden bg-ink text-ivory', mobile ? 'aspect-[9/19]' : 'grid aspect-[16/10] grid-cols-[1fr_1.45fr_1fr] gap-px')}>
      {(mobile ? [frames[1]] : frames).map((f, i) => (
        <div key={i} className={cn('overflow-hidden', mobile ? 'absolute inset-0' : 'relative')}>
          {f ? <Img asset={f} sizes="240px" /> : <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] text-ivory/50">{mobile ? 'Tengah' : FRAME_LABELS[i]}</span>}
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,18,16,.35)_0%,transparent_25%,transparent_45%,rgba(20,18,16,.8)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-[0.45rem] tracking-[0.2em] uppercase opacity-85">{eyebrow}</p>
        <p className={cn('mt-1 font-serif leading-[0.95]', mobile ? 'text-xl' : 'text-2xl')}>
          {line1}
          <br />
          <em className={mobile ? '' : 'pl-[12%]'}>{line2}</em>
        </p>
        <span className="mt-2 inline-block bg-ivory px-2 py-1 text-[0.45rem] tracking-[0.16em] text-ink uppercase">{ctaLabel || 'Button'}</span>
      </div>
    </div>
  );

  return (
    <Drawer
      open={open}
      title={slide ? 'Edit slide hero' : 'Slide hero baru'}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-danger">{error}</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline h-11 px-5">
              Batal
            </button>
            <button type="button" onClick={submit} disabled={!!busy} className="btn-ink h-11 px-6">
              {busy === 'save' ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </div>
      }
    >
      {/* Live preview */}
      <div className="grid grid-cols-[1fr_7.5rem] items-end gap-3 sm:grid-cols-[1fr_9rem]">
        <div>
          {preview(false)}
          <p className="mt-2 text-[0.62rem] tracking-[0.14em] text-stone uppercase">Desktop</p>
        </div>
        <div>
          {preview(true)}
          <p className="mt-2 text-[0.62rem] tracking-[0.14em] text-stone uppercase">HP</p>
        </div>
      </div>

      {/* Photos */}
      <h3 className="eyebrow mt-8 text-[0.62rem] text-ink/70">Foto</h3>
      <div role="tablist" className="mt-3 grid max-w-md grid-cols-3 gap-2">
        {frames.map((f, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn('relative aspect-[2/3] overflow-hidden border bg-sand text-left', active === i ? 'border-ink outline outline-1 outline-ink' : 'border-transparent opacity-70 hover:opacity-100')}
          >
            {f && <Img asset={f} sizes="160px" />}
            <span className={cn('absolute bottom-0 left-0 px-2 py-1 text-[0.6rem] tracking-[0.12em] uppercase', active === i ? 'bg-ink text-ivory' : 'bg-ivory/90')}>
              {FRAME_LABELS[i]}
              {i === 1 && ' · HP'}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone">Klik kotak foto untuk memilih yang diganti. Upload 3 file sekaligus untuk mengisi kiri → tengah → kanan.</p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <DropZone multiple label={`Upload foto ${FRAME_LABELS[active].toLowerCase()} (potret)`} onFiles={upload} busy={busy === 'upload'} />
          <div className="mt-4 grid gap-3">
            <label className="block text-xs">
              <span className="flex justify-between text-stone">
                Fokus horizontal <span className="tabular-nums">{fx}%</span>
              </span>
              <input type="range" min={0} max={100} value={fx} disabled={!frame} onChange={(e) => setFocus(+e.target.value, fy)} className="mt-2 w-full accent-ink" />
            </label>
            <label className="block text-xs">
              <span className="flex justify-between text-stone">
                Fokus vertikal <span className="tabular-nums">{fy}%</span>
              </span>
              <input type="range" min={0} max={100} value={fy} disabled={!frame} onChange={(e) => setFocus(fx, +e.target.value)} className="mt-2 w-full accent-ink" />
            </label>
          </div>
        </div>
        <div>
          <Field label="Atau ambil dari foto produk">
            <select className={inputCls} value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">— Pilih produk —</option>
              {products.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          {sourcePhotos.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {sourcePhotos.map((a, i) => (
                <button key={`${a.url ?? a.src}-${i}`} type="button" onClick={() => setFrame(a)} className="relative aspect-[2/3] overflow-hidden bg-sand hover:opacity-80" aria-label={`Pakai ${a.alt}`}>
                  <Img asset={a} sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Copy */}
      <h3 className="eyebrow mt-10 text-[0.62rem] text-ink/70">Teks</h3>
      <div className="mt-3 grid gap-5">
        <Field label="Teks kecil di atas judul" hint="Contoh: nama event atau koleksi">
          <input className={inputCls} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Judul baris 1 *">
            <input className={inputCls} value={line1} onChange={(e) => setLine1(e.target.value)} maxLength={22} />
          </Field>
          <Field label="Judul baris 2 (miring)">
            <input className={inputCls} value={line2} onChange={(e) => setLine2(e.target.value)} maxLength={22} />
          </Field>
        </div>
        <p className="-mt-3 text-xs text-stone">Judulnya tampil sangat besar — pakai 1–3 kata per baris.</p>
        <Field label="Deskripsi" hint="Satu kalimat di samping judul.">
          <textarea rows={2} className={textareaCls} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Teks tombol *">
            <input className={inputCls} value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
          </Field>
          <Field label="Link tombol *" hint="Pilih dari daftar atau ketik sendiri">
            <input className={inputCls} value={ctaTo} onChange={(e) => setCtaTo(e.target.value)} list="hero-links" />
            <datalist id="hero-links">
              {links.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </Field>
        </div>
        <Field label="Produk di foto (Shop the look) *" hint="Link “Shop the look” dan tulisan “Shown:” di hero mengarah ke produk ini.">
          <select
            className={inputCls}
            value={lookSlug}
            onChange={(e) => {
              setLookSlug(e.target.value);
              setSource(e.target.value);
            }}
          >
            <option value="">— Pilih produk —</option>
            {products.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </Drawer>
  );
}
