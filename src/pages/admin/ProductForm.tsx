import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Img } from '../../components/ui/Img';
import { useShop } from '../../context/ShopContext';
import { categories as baseCategories, collections } from '../../data/catalog';
import { CATEGORY_CODE, makeVariants } from '../../data/products';
import { SEGMENTS } from '../../data/segments';
import { useSegmentCategories } from '../../hooks/useCatalog';
import { cn, formatIDR } from '../../lib/format';
import { catalogStore } from '../../services/catalogStore';
import type { CategorySlug, CollectionSlug, ColorOption, ImageAsset, Product } from '../../types/commerce';
import { DropZone, Drawer, Field, inputCls, textareaCls } from './AdminUi';
import { processUpload, slugify } from './imageTools';

const SIZE_PRESETS = ['S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const COLOR_PRESETS: ColorOption[] = [
  { name: 'Ink Black', hex: '#1f1d1b' },
  { name: 'Navy', hex: '#1f2a4a' },
  { name: 'Maroon', hex: '#6e2a2f' },
  { name: 'Beige', hex: '#d8c8ad' },
  { name: 'Cream', hex: '#efe6d6' },
  { name: 'Blush', hex: '#d9a7a3' },
  { name: 'Olive', hex: '#6b6a3a' },
  { name: 'Pearl Grey', hex: '#b9b5ae' },
  { name: 'Sogan Brown', hex: '#7a4e24' },
  { name: 'Antique Gold', hex: '#b48a3c' },
];
const MOTIFS = ['Floral', 'Parang', 'Kawung', 'Ceplok', 'Mega Mendung', 'Sogan', 'Modern', 'Hibiscus', 'Tumpal', 'Lereng'];

interface FormState {
  name: string;
  slug: string;
  slugTouched: boolean;
  category: CategorySlug;
  subcategory: string;
  collection: string;
  price: string;
  stock: string;
  description: string;
  sizes: string[];
  colors: ColorOption[];
  motif: string;
  material: string;
  technique: string;
  featured: boolean;
  newArrival: boolean;
  images: ImageAsset[];
}

const blank = (subcategory = '', category: CategorySlug = 'women'): FormState => ({
  name: '',
  slug: '',
  slugTouched: false,
  category,
  subcategory,
  collection: '',
  price: '',
  stock: '10',
  description: '',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [COLOR_PRESETS[0]],
  motif: 'Floral',
  material: 'Silk',
  technique: 'Batik tulis (hand-drawn)',
  featured: false,
  newArrival: true,
  images: [],
});

const fromProduct = (p: Product): FormState => ({
  name: p.name,
  slug: p.slug,
  slugTouched: true,
  category: p.category,
  subcategory: p.subcategory ?? '',
  collection: p.collection ?? '',
  price: String(p.price),
  stock: String(p.stock),
  description: p.description,
  sizes: p.availableSizes,
  colors: p.colors,
  motif: p.motif,
  material: p.material,
  technique: p.technique,
  featured: p.featured,
  newArrival: p.newArrival,
  images: p.images,
});

interface Props {
  open: boolean;
  /** Product to edit; undefined = create new */
  product?: Product;
  /** Pre-selected women's sub-category for new products */
  defaultSubcategory?: string;
  /** Create a new product pre-filled from this one ("Duplikat") */
  template?: Product;
  onClose: () => void;
}

export function ProductForm({ open, product, defaultSubcategory, template, onClose }: Props) {
  const { notify } = useShop();
  const women = useSegmentCategories('women').filter((c) => c.slug !== 'all');
  const men = useSegmentCategories('men').filter((c) => c.slug !== 'all');
  const [f, setF] = useState<FormState>(blank());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [customSize, setCustomSize] = useState('');

  useEffect(() => {
    if (!open) return;
    if (product) setF(fromProduct(product));
    else if (template)
      setF({ ...fromProduct(template), name: `${template.name} (Copy)`, slug: catalogStore.uniqueSlug(`${template.slug}-copy`), slugTouched: true, newArrival: true });
    else setF(blank(defaultSubcategory, catalogStore.segmentOf({ subcategory: defaultSubcategory } as Product) === 'men' ? 'men' : 'women'));
    setErrors({});
  }, [open, product, defaultSubcategory, template]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const slug = f.slugTouched ? f.slug : slugify(f.name);
  const priceNum = Number(f.price.replace(/\D/g, ''));

  const slugTaken = useMemo(() => catalogStore.products.some((p) => p.slug === slug && p.id !== product?.id), [slug, product]);

  const upload = async (files: File[]) => {
    setBusy(true);
    try {
      const added: ImageAsset[] = [];
      for (const file of files) {
        const img = await processUpload(file, 1600);
        const url = await catalogStore.saveImage(img.blob);
        added.push({ src: '', url, alt: f.name || file.name, ratio: img.width / img.height, focus: '50% 25%', credit: 'Uploaded via demo admin' });
      }
      setF((s) => ({ ...s, images: [...s.images, ...added] }));
    } catch {
      notify('Gagal memproses gambar');
    } finally {
      setBusy(false);
    }
  };

  const move = (i: number, d: -1 | 1) =>
    setF((s) => {
      const images = [...s.images];
      const j = i + d;
      if (j < 0 || j >= images.length) return s;
      [images[i], images[j]] = [images[j], images[i]];
      return { ...s, images };
    });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = 'Nama produk wajib diisi';
    if (!slug) e.slug = 'Slug wajib diisi';
    else if (slugTaken) e.slug = 'Slug sudah dipakai produk lain';
    if (!priceNum || priceNum < 1000) e.price = 'Isi harga dalam rupiah (min. Rp 1.000)';
    if (!f.sizes.length) e.sizes = 'Pilih minimal satu ukuran';
    if (!f.colors.length || f.colors.some((c) => !c.name.trim())) e.colors = 'Isi minimal satu warna, setiap warna perlu nama';
    if (!f.description.trim()) e.description = 'Deskripsi wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setBusy(true);
    const id = product?.id ?? `c-${Date.now().toString(36)}`;
    const sku = product?.sku ?? `BRK-${CATEGORY_CODE[f.category]}-C${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const stock = Math.max(0, Number(f.stock) || 0);
    const next: Product = {
      id,
      sku,
      slug,
      name: f.name.trim(),
      category: f.category,
      subcategory: f.subcategory || undefined,
      collection: (f.collection || undefined) as CollectionSlug | undefined,
      price: priceNum,
      images: f.images.map((im) => ({ ...im, alt: im.alt || f.name })),
      description: f.description.trim(),
      availableSizes: f.sizes,
      colors: f.colors.map((c) => ({ ...c, name: c.name.trim() })),
      motif: f.motif.trim() || 'Modern',
      material: f.material.trim(),
      technique: f.technique.trim(),
      stock,
      featured: f.featured,
      newArrival: f.newArrival,
      variants: makeVariants(sku, f.sizes, f.colors, stock),
      createdAt: product?.createdAt ?? Date.now(),
    };
    try {
      await catalogStore.saveProduct(next);
      notify(product ? 'Produk diperbarui' : 'Produk ditambahkan');
      onClose();
    } catch {
      notify('Gagal menyimpan — penyimpanan browser tidak tersedia');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open}
      title={product ? 'Edit produk' : template ? 'Duplikat produk' : 'Tambah produk'}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="hidden text-xs text-stone sm:block">{priceNum ? `${formatIDR(priceNum)} · ${f.sizes.length * f.colors.length} varian SKU` : 'Data disimpan di browser ini (demo).'}</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline h-11 px-5">
              Batal
            </button>
            <button type="button" onClick={save} disabled={busy} className="btn-ink h-11 px-6">
              {busy ? 'Menyimpan…' : 'Simpan produk'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Photos */}
        <section>
          <h3 className="eyebrow mb-3 text-[0.65rem]">Foto produk</h3>
          <p className="mb-4 text-xs text-stone">Foto pertama = foto utama di katalog. Disarankan potret 2:3 (mis. 1200×1800 px), full-body, tanpa teks — sama dengan bingkai katalog, jadi tidak terpotong. Otomatis dikompres ke WebP.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {f.images.map((im, i) => (
              <div key={`${im.url ?? im.src}-${i}`} className="group relative">
                <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                  <Img asset={im} sizes="160px" />
                </div>
                {i === 0 && <span className="absolute top-1.5 left-1.5 bg-ink px-1.5 py-0.5 text-[0.55rem] tracking-[0.14em] text-ivory uppercase">Utama</span>}
                <div className="mt-1.5 flex justify-between">
                  <div className="flex">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 disabled:opacity-25" aria-label="Geser ke kiri">
                      <ArrowLeft size={13} />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === f.images.length - 1} className="p-1.5 disabled:opacity-25" aria-label="Geser ke kanan">
                      <ArrowRight size={13} />
                    </button>
                  </div>
                  <button type="button" onClick={() => set('images', f.images.filter((_, j) => j !== i))} className="p-1.5 text-danger" aria-label="Hapus foto">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            <DropZone multiple compact busy={busy} onFiles={upload} label="Tambah foto (klik / drag)" />
          </div>
          {f.images.length === 0 && <p className="mt-3 text-xs text-stone">Tanpa foto, kartu produk menampilkan placeholder “Photography pending”.</p>}
        </section>

        {/* Basics */}
        <section className="grid gap-5 sm:grid-cols-2">
          <Field label="Nama produk *" error={errors.name} className="sm:col-span-2">
            <input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="cth. Indigo Floral Batik Long Outer" />
          </Field>
          <Field label="Slug URL *" error={errors.slug} hint={`/product/${slug || '…'}`} className="sm:col-span-2">
            <input
              className={inputCls}
              value={slug}
              onChange={(e) => setF((s) => ({ ...s, slug: slugify(e.target.value), slugTouched: true }))}
            />
          </Field>
          <Field label="Kategori utama *">
            <select className={inputCls} value={f.category} onChange={(e) => {
                const category = e.target.value as CategorySlug;
                // a sub-category belongs to one segment — clear it when the main category changes
                setF((s) => ({ ...s, category, subcategory: category === s.category ? s.subcategory : '' }));
              }}>
              {baseCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          {f.category === 'women' || f.category === 'men' ? (
            <Field label={`Kategori ${SEGMENTS[f.category].label}`} hint={`Menentukan di halaman ${SEGMENTS[f.category].path} mana produk tampil`}>
              <select className={inputCls} value={f.subcategory} onChange={(e) => set('subcategory', e.target.value)}>
                <option value="">— Tidak tampil di {SEGMENTS[f.category].label} —</option>
                {(f.category === 'men' ? men : women).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Sub-kategori" hint="Hanya untuk Women & Men">
              <input className={inputCls} value="—" disabled />
            </Field>
          )}
          <Field label="Harga (IDR) *" error={errors.price} hint={priceNum ? formatIDR(priceNum) : undefined}>
            <input className={inputCls} inputMode="numeric" value={f.price} onChange={(e) => set('price', e.target.value.replace(/[^\d]/g, ''))} placeholder="1850000" />
          </Field>
          <Field label="Stok total" hint="Dibagi rata ke setiap varian ukuran × warna">
            <input className={inputCls} inputMode="numeric" value={f.stock} onChange={(e) => set('stock', e.target.value.replace(/[^\d]/g, ''))} />
          </Field>
          <Field label="Koleksi">
            <select className={inputCls} value={f.collection} onChange={(e) => set('collection', e.target.value)}>
              <option value="">— Tanpa koleksi —</option>
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end gap-6 pb-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={f.newArrival} onChange={(e) => set('newArrival', e.target.checked)} className="accent-ink" /> New arrival
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-ink" /> Featured
            </label>
          </div>
          <Field label="Deskripsi *" error={errors.description} className="sm:col-span-2">
            <textarea className={textareaCls} rows={4} value={f.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
        </section>

        {/* Sizes */}
        <section>
          <h3 className={cn('eyebrow mb-3 text-[0.65rem]', errors.sizes && 'text-danger')}>Ukuran * {errors.sizes && `— ${errors.sizes}`}</h3>
          <div className="flex flex-wrap gap-2">
            {[...new Set([...SIZE_PRESETS, ...f.sizes])].map((s) => {
              const on = f.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set('sizes', on ? f.sizes.filter((x) => x !== s) : [...f.sizes, s])}
                  className={cn('h-10 min-w-11 border px-3 text-xs transition-colors', on ? 'border-ink bg-ink text-ivory' : 'border-ink/20 hover:border-ink')}
                >
                  {s}
                </button>
              );
            })}
            <span className="flex">
              <input className={cn(inputCls, 'h-10 w-28')} placeholder="Lainnya" value={customSize} onChange={(e) => setCustomSize(e.target.value)} />
              <button
                type="button"
                onClick={() => {
                  const v = customSize.trim();
                  if (v && !f.sizes.includes(v)) set('sizes', [...f.sizes, v]);
                  setCustomSize('');
                }}
                className="-ml-px h-10 border border-ink/20 px-3 hover:border-ink"
                aria-label="Tambah ukuran"
              >
                <Plus size={14} />
              </button>
            </span>
          </div>
        </section>

        {/* Colours */}
        <section>
          <h3 className={cn('eyebrow mb-3 text-[0.65rem]', errors.colors && 'text-danger')}>Warna * {errors.colors && `— ${errors.colors}`}</h3>
          <div className="space-y-2">
            {f.colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.hex}
                  onChange={(e) => set('colors', f.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))}
                  className="h-11 w-12 cursor-pointer border border-ink/20 bg-paper p-1"
                  aria-label="Pilih warna"
                />
                <input
                  className={inputCls}
                  value={c.name}
                  onChange={(e) => set('colors', f.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  placeholder="Nama warna"
                />
                <button type="button" onClick={() => set('colors', f.colors.filter((_, j) => j !== i))} className="h-11 px-3 text-danger" aria-label="Hapus warna">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {COLOR_PRESETS.filter((p) => !f.colors.some((c) => c.name === p.name)).map((p) => (
              <button key={p.name} type="button" onClick={() => set('colors', [...f.colors, p])} className="flex items-center gap-1.5 border border-ink/15 px-2 py-1 text-[0.7rem] hover:border-ink">
                <span className="h-3 w-3 rounded-full border border-ink/10" style={{ background: p.hex }} /> {p.name}
              </button>
            ))}
            <button type="button" onClick={() => set('colors', [...f.colors, { name: '', hex: '#999999' }])} className="border border-dashed border-ink/30 px-2 py-1 text-[0.7rem] hover:border-ink">
              + Warna custom
            </button>
          </div>
          <p className="mt-2 text-xs text-stone">Filter warna di katalog memakai kelompok Black, Navy, Maroon, Beige, Pink, Olive, Grey — pakai nama preset agar produk ikut tersaring.</p>
        </section>

        {/* Details */}
        <section className="grid gap-5 sm:grid-cols-3">
          <Field label="Motif">
            <input className={inputCls} list="admin-motifs" value={f.motif} onChange={(e) => set('motif', e.target.value)} />
            <datalist id="admin-motifs">
              {MOTIFS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Field>
          <Field label="Material">
            <input className={inputCls} value={f.material} onChange={(e) => set('material', e.target.value)} />
          </Field>
          <Field label="Teknik">
            <input className={inputCls} value={f.technique} onChange={(e) => set('technique', e.target.value)} />
          </Field>
        </section>
      </div>
    </Drawer>
  );
}
