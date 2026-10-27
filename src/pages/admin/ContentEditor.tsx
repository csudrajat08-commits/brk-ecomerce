import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Img } from '../../components/ui/Img';
import { RichTitle } from '../../components/ui/RichTitle';
import { useShop } from '../../context/ShopContext';
import { categories, collections } from '../../data/catalog';
import { useSegmentCategories } from '../../hooks/useCatalog';
import { cn } from '../../lib/format';
import { catalogStore } from '../../services/catalogStore';
import type { ImageAsset } from '../../types/commerce';
import { DropZone, Drawer, Field, inputCls, textareaCls } from './AdminUi';
import { processUpload } from './imageTools';

/** Describes one editable field of a homepage section (or collection). */
export type FieldSpec =
  | { kind: 'text' | 'textarea' | 'title' | 'link'; key: string; label: string; hint?: string }
  | { kind: 'image'; key: string; label: string; previews: Array<{ label: string; aspect: string }> }
  | { kind: 'list'; key: string; label: string; item: string; fields: FieldSpec[]; min?: number; max?: number; blank?: Record<string, unknown> };

type Obj = Record<string, unknown>;

const parseFocus = (f?: string): [number, number] => {
  const m = f?.match(/(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  return m ? [Number(m[1]), Number(m[2])] : [50, 50];
};

/** Drawer that edits any value described by `fields`, saved as a whole. */
export function ContentDrawer<T extends object>({
  open,
  title,
  fields,
  value,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  fields: FieldSpec[];
  value: T;
  onClose: () => void;
  onSave: (v: T) => Promise<void>;
}) {
  const { notify } = useShop();
  const [draft, setDraft] = useState<Obj>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setDraft(structuredClone(value) as Obj);
  }, [open, value]);

  const save = async () => {
    setBusy(true);
    try {
      await onSave(draft as T);
      notify('Perubahan disimpan');
      onClose();
    } catch {
      notify('Gagal menyimpan');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-outline h-11 px-5">
            Batal
          </button>
          <button type="button" onClick={save} disabled={busy} className="btn-ink h-11 px-6">
            {busy ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      }
    >
      {open && <Fields fields={fields} value={draft} onChange={setDraft} />}
    </Drawer>
  );
}

function Fields({ fields, value, onChange }: { fields: FieldSpec[]; value: Obj; onChange: (v: Obj) => void }) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });
  return (
    <div className="grid gap-6">
      {fields.map((f) => {
        const v = value[f.key];
        switch (f.kind) {
          case 'text':
            return (
              <Field key={f.key} label={f.label} hint={f.hint}>
                <input className={inputCls} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)} />
              </Field>
            );
          case 'link':
            return <LinkField key={f.key} label={f.label} hint={f.hint} value={String(v ?? '')} onChange={(x) => set(f.key, x)} />;
          case 'textarea':
            return (
              <Field key={f.key} label={f.label} hint={f.hint}>
                <textarea rows={3} className={textareaCls} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)} />
              </Field>
            );
          case 'title':
            return (
              <div key={f.key}>
                <Field label={f.label} hint={f.hint ?? 'Enter = pindah baris · *kata* = huruf miring'}>
                  <textarea rows={2} className={cn(textareaCls, 'font-serif text-lg')} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)} />
                </Field>
                <p className="mt-2 bg-paper px-3 py-2 font-serif text-2xl leading-tight">
                  <RichTitle text={String(v ?? '')} />
                </p>
              </div>
            );
          case 'image':
            return <ImageField key={f.key} label={f.label} previews={f.previews} value={v as ImageAsset} onChange={(x) => set(f.key, x)} />;
          case 'list': {
            const items = (v as Obj[]) ?? [];
            const canAdd = f.blank && items.length < (f.max ?? 99);
            const canRemove = items.length > (f.min ?? items.length);
            return (
              <div key={f.key}>
                <p className="eyebrow text-[0.62rem] text-ink/70">{f.label}</p>
                <ol className="mt-3 grid gap-4">
                  {items.map((it, i) => (
                    <li key={i} className="border border-ink/12 bg-paper/60 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs tracking-[0.12em] text-stone uppercase">
                          {f.item} {i + 1}
                        </span>
                        {canRemove && (
                          <button type="button" onClick={() => set(f.key, items.filter((_, k) => k !== i))} className="p-1 text-danger/80 hover:text-danger" aria-label={`Hapus ${f.item} ${i + 1}`}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <Fields fields={f.fields} value={it} onChange={(x) => set(f.key, items.map((y, k) => (k === i ? x : y)))} />
                    </li>
                  ))}
                </ol>
                {canAdd && (
                  <button type="button" onClick={() => set(f.key, [...items, structuredClone(f.blank)])} className="mt-3 inline-flex items-center gap-1 text-xs tracking-[0.12em] uppercase hover:text-bronze">
                    <Plus size={13} /> Tambah {f.item.toLowerCase()}
                  </button>
                )}
              </div>
            );
          }
        }
      })}
    </div>
  );
}

/** Link input with suggestions for the site's main pages. */
function LinkField({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
  const women = useSegmentCategories('women');
  const men = useSegmentCategories('men');
  const listId = useMemo(() => `links-${Math.random().toString(36).slice(2, 7)}`, []);
  const links = [
    '/',
    '/shop?new=1',
    '/women',
    ...women.filter((c) => c.slug !== 'all').map((c) => `/women/${c.slug}`),
      '/men',
      ...men.filter((c) => c.slug !== 'all').map((c) => `/men/${c.slug}`),
    ...categories.filter((c) => c.slug !== 'women' && c.slug !== 'men').map((c) => `/shop/${c.slug}`),
    '/collections',
    ...collections.map((c) => `/shop?collection=${c.slug}`),
    ...catalogStore.products.map((p) => `/product/${p.slug}`),
    '/about',
    '/wholesale',
    '/care/shipping',
    '/care/returns',
    '/care/contact',
  ];
  return (
    <Field label={label} hint={hint ?? 'Pilih dari daftar (ketik untuk mencari) atau tulis sendiri, contoh /women'}>
      <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} list={listId} />
      <datalist id={listId}>
        {links.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>
    </Field>
  );
}

/** Photo picker: upload or take a product photo, set the focal point, preview the real crops. */
export function ImageField({ label, value, onChange, previews }: { label: string; value?: ImageAsset; onChange: (v: ImageAsset) => void; previews: Array<{ label: string; aspect: string }> }) {
  const { notify } = useShop();
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState('');
  const [fx, fy] = parseFocus(value?.focus);
  const photos = (catalogStore.products.find((p) => p.slug === source)?.images ?? []).filter((im) => !im.pending);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const img = await processUpload(file, 1800);
      const url = await catalogStore.saveImage(img.blob);
      onChange({ src: '', url, alt: value?.alt ?? label, ratio: img.width / img.height, focus: '50% 40%', credit: 'Uploaded via demo admin' });
    } catch {
      notify('Gagal memproses gambar');
    } finally {
      setBusy(false);
    }
  };
  const setFocus = (x: number, y: number) => value && onChange({ ...value, focus: `${x}% ${y}%` });

  return (
    <div>
      <p className="eyebrow text-[0.62rem] text-ink/70">{label}</p>
      <div className="mt-3 grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-wrap items-start gap-3">
          {previews.map((pv) => (
            <div key={pv.label} className="w-[calc(50%-0.375rem)] min-w-0">
              <div className="relative overflow-hidden bg-sand" style={{ aspectRatio: pv.aspect }}>
                {value && <Img asset={value} sizes="220px" focus={value.focus} />}
              </div>
              <p className="mt-1.5 text-[0.6rem] tracking-[0.14em] text-stone uppercase">{pv.label}</p>
            </div>
          ))}
        </div>
        <div className="grid content-start gap-3">
          <DropZone label="Upload foto baru" onFiles={(f) => upload(f[0])} busy={busy} />
          <select className={inputCls} value={source} onChange={(e) => setSource(e.target.value)} aria-label="Ambil dari foto produk">
            <option value="">Atau ambil dari foto produk…</option>
            {catalogStore.products.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
          {photos.length > 0 && (
            <div className="grid grid-cols-5 gap-1.5">
              {photos.map((a, i) => (
                <button key={`${a.url ?? a.src}-${i}`} type="button" onClick={() => onChange(a)} className="relative aspect-[2/3] overflow-hidden bg-sand hover:opacity-80" aria-label={`Pakai ${a.alt}`}>
                  <Img asset={a} sizes="64px" />
                </button>
              ))}
            </div>
          )}
          <label className="block text-xs">
            <span className="flex justify-between text-stone">
              Fokus horizontal <span className="tabular-nums">{fx}%</span>
            </span>
            <input type="range" min={0} max={100} value={fx} disabled={!value} onChange={(e) => setFocus(+e.target.value, fy)} className="mt-1 w-full accent-ink" />
          </label>
          <label className="block text-xs">
            <span className="flex justify-between text-stone">
              Fokus vertikal <span className="tabular-nums">{fy}%</span>
            </span>
            <input type="range" min={0} max={100} value={fy} disabled={!value} onChange={(e) => setFocus(fx, +e.target.value)} className="mt-1 w-full accent-ink" />
          </label>
        </div>
      </div>
    </div>
  );
}
