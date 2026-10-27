import { useEffect, useState } from 'react';
import { DESKTOP_TILE_ASPECT } from '../../components/home/CategoryShowcase';
import { Img } from '../../components/ui/Img';
import { useShop } from '../../context/ShopContext';
import { categories as baseCategories } from '../../data/catalog';
import { cn } from '../../lib/format';
import { catalogStore } from '../../services/catalogStore';
import type { Category, ImageAsset } from '../../types/commerce';
import { DropZone, Drawer, Field, inputCls, textareaCls } from './AdminUi';
import { processUpload } from './imageTools';

interface Props {
  open: boolean;
  category?: Category;
  onClose: () => void;
}

const parseFocus = (f?: string): [number, number] => {
  const m = f?.match(/(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  return m ? [Number(m[1]), Number(m[2])] : [50, 50];
};

/** Edit one homepage "Shop by category" tile: name, description and photo. */
export function HomeTileEditor({ open, category, onClose }: Props) {
  const { notify } = useShop();
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<ImageAsset | undefined>();
  const [fx, setFx] = useState(50);
  const [fy, setFy] = useState(50);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !category) return;
    setName(category.name);
    setShortName(category.shortName);
    setDescription(category.description);
    setImage(category.image);
    const [x, y] = parseFocus(category.image.focus);
    setFx(x);
    setFy(y);
    setError('');
  }, [open, category]);

  if (!category) return null;
  const base = baseCategories.find((c) => c.slug === category.slug)!;
  const focus = `${fx}% ${fy}%`;
  const photos = catalogStore.products
    .filter((p) => p.category === category.slug)
    .map((p) => p.images[0])
    .filter((im): im is ImageAsset => !!im && !im.pending)
    .slice(0, 12);

  const pick = (a: ImageAsset) => {
    setImage(a);
    const [x, y] = parseFocus(a.focus);
    setFx(x);
    setFy(y);
  };

  const upload = async (file: File) => {
    setBusy('upload');
    try {
      const img = await processUpload(file, 1600);
      const url = await catalogStore.saveImage(img.blob);
      pick({ src: '', url, alt: `${name} — homepage tile`, ratio: img.width / img.height, focus: '50% 30%', credit: 'Uploaded via demo admin' });
    } catch {
      notify('Gagal memproses gambar');
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (!name.trim()) return setError('Nama wajib diisi');
    if (!image) return setError('Pilih foto');
    setBusy('save');
    try {
      await catalogStore.saveHomeTile(category.slug, {
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        description: description.trim(),
        image: { ...image, focus },
      });
      notify('Tile homepage disimpan');
      onClose();
    } catch {
      notify('Gagal menyimpan');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Drawer
      open={open}
      title={`Tile · ${base.shortName}`}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-danger">{error}</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline h-11 px-5">
              Batal
            </button>
            <button type="button" onClick={save} disabled={!!busy} className="btn-ink h-11 px-6">
              {busy === 'save' ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </div>
      }
    >
      <div className="grid gap-5">
        <Field label="Nama tile" hint="Judul besar di bawah foto, juga dipakai di menu HP dan pencarian.">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
          <Field label="Nama pendek" hint="Untuk label kecil.">
            <input className={inputCls} value={shortName} onChange={(e) => setShortName(e.target.value)} />
          </Field>
          <Field label="Deskripsi" hint="Satu kalimat pendek di bawah judul.">
            <textarea rows={2} className={textareaCls} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
        <p className="text-xs text-stone">
          Link tile tetap ke <code>/shop/{category.slug}</code>. Produk yang tampil diatur lewat “Kategori utama” di form produk.
        </p>
      </div>

      <h3 className="eyebrow mt-10 text-[0.62rem] text-ink/70">Foto</h3>
      <div className="mt-3 grid gap-6 sm:grid-cols-[1fr_1.1fr]">
        <div>
          <DropZone label="Upload foto (potret 2:3 / 3:4 paling pas)" onFiles={(f) => upload(f[0])} busy={busy === 'upload'} />
          {photos.length > 0 && (
            <>
              <p className="mt-5 text-xs text-stone">Atau pakai foto produk di kategori ini:</p>
              <div className="mt-2 grid grid-cols-6 gap-1.5">
                {photos.map((a, i) => (
                  <button
                    key={`${a.url ?? a.src}-${i}`}
                    type="button"
                    onClick={() => pick(a)}
                    className={cn('relative aspect-[2/3] overflow-hidden bg-sand outline-offset-2', image && (image.url ?? image.src) === (a.url ?? a.src) && 'outline outline-1 outline-ink')}
                    aria-label={`Pakai ${a.alt}`}
                  >
                    <Img asset={a} sizes="60px" />
                  </button>
                ))}
              </div>
            </>
          )}
          <button type="button" onClick={() => pick(base.image)} className="mt-4 text-xs text-stone underline underline-offset-4 hover:text-ink">
            Pakai foto bawaan
          </button>

          <div className="mt-6 grid gap-4">
            <label className="block text-xs">
              <span className="flex justify-between text-stone">
                Titik fokus horizontal <span className="tabular-nums">{fx}%</span>
              </span>
              <input type="range" min={0} max={100} value={fx} onChange={(e) => setFx(Number(e.target.value))} className="mt-2 w-full accent-ink" />
            </label>
            <label className="block text-xs">
              <span className="flex justify-between text-stone">
                Titik fokus vertikal <span className="tabular-nums">{fy}%</span>
              </span>
              <input type="range" min={0} max={100} value={fy} onChange={(e) => setFy(Number(e.target.value))} className="mt-2 w-full accent-ink" />
            </label>
            <p className="text-xs text-stone">Geser supaya wajah/detail penting tidak terpotong di kedua preview.</p>
          </div>
        </div>

        {/* Live crops, matching the homepage frames */}
        <div className="grid grid-cols-2 items-start gap-3">
          {[
            { label: 'Desktop', aspect: DESKTOP_TILE_ASPECT[category.slug] ?? '3 / 4' },
            { label: 'HP & tablet', aspect: '3 / 4' },
          ].map((v) => (
            <div key={v.label}>
              <div className="relative overflow-hidden bg-sand" style={{ aspectRatio: v.aspect }}>
                {image && <Img asset={image} sizes="200px" focus={focus} />}
              </div>
              <p className="mt-2 text-[0.62rem] tracking-[0.14em] text-stone uppercase">{v.label}</p>
              <p className="mt-1 font-serif text-base leading-tight">{name || '—'}</p>
              <p className="text-[0.7rem] text-stone">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
