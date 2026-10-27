import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Img } from '../../components/ui/Img';
import { useShop } from '../../context/ShopContext';
import { heroBanners, type HeroBanner, type WomenCategoryDef } from '../../data/womenCatalog';
import { SEGMENTS } from '../../data/segments';
import { useSegmentCategories } from '../../hooks/useCatalog';
import { cn } from '../../lib/format';
import { catalogStore } from '../../services/catalogStore';
import type { ImageAsset, Product, Segment } from '../../types/commerce';
import { DropZone, Drawer, Field, inputCls, textareaCls } from './AdminUi';
import { cropForMobile, layoutFor, processUpload, slugify } from './imageTools';

interface Props {
  open: boolean;
  /** Category to edit; undefined = create new */
  category?: WomenCategoryDef;
  /** Create a new category pre-filled from this one ("Duplikat") */
  template?: WomenCategoryDef;
  /** Women or Men */
  segment: Segment;
  onClose: () => void;
}

const uploaded = (url: string, width: number, height: number, alt: string): ImageAsset => ({
  src: '',
  url,
  alt,
  ratio: width / height,
  focus: '50% 50%',
  credit: 'Uploaded via demo admin',
});

/** Resolve any ImageAsset (static file or uploaded) to a Blob for re-cropping. */
async function assetBlob(a: ImageAsset): Promise<Blob> {
  const widths = a.widths ?? [640, 1200];
  const href = a.url ? catalogStore.resolveUrl(a.url)! : `${a.src}-${widths[widths.length - 1]}.webp`;
  return (await fetch(href)).blob();
}

export function CategoryEditor({ open, category, template, segment, onClose }: Props) {
  const { notify } = useShop();
  const seg = SEGMENTS[segment];
  useSegmentCategories(segment);
  const isNew = !category;
  const [label, setLabel] = useState('');
  const [slug, setSlug] = useState('');
  const [eyebrow, setEyebrow] = useState(seg.collection);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slides, setSlides] = useState<HeroBanner[]>([]);
  const [active, setActive] = useState(0);
  const banner: HeroBanner | undefined = slides[active];
  /** Update (or, with undefined, remove) the slide being edited */
  const setBanner = (b: HeroBanner | undefined) => {
    setSlides((list) => (b ? list.map((x, i) => (i === active ? b : x)) : list.filter((_, i) => i !== active)));
    if (!b) setActive((a) => Math.max(0, a - 1));
  };
  const moveSlide = (from: number, d: -1 | 1) => {
    const to = from + d;
    if (to < 0 || to >= slides.length) return;
    setSlides((list) => {
      const next = [...list];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setActive(to);
  };
  const [cover, setCover] = useState<ImageAsset | undefined>();
  const [focusX, setFocusX] = useState(50);
  const [busy, setBusy] = useState<string | null>(null);
  const [copyProducts, setCopyProducts] = useState(false);
  const templateProducts = template ? catalogStore.products.filter((p) => p.subcategory === template.slug) : [];
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const src = category ?? template;
    setLabel(category ? category.label : template ? `${template.label} (Copy)` : '');
    setSlug(category?.slug ?? '');
    setEyebrow(src?.hero.eyebrow ?? seg.collection);
    setTitle(category ? category.hero.title : template ? `${template.hero.title} (Copy)` : '');
    setDescription(src?.hero.description ?? '');
    setSlides(src ? heroBanners(src.hero) : []);
    setCopyProducts(false);
    setActive(0);
    setCover(src?.cover);
    setFocusX(50);
    setErrors({});
  }, [open, category, template]);

  const finalSlug = isNew ? slug || slugify(label) : category!.slug;

  const uploadDesktop = async (files: File[], mode: 'add' | 'replace') => {
    setBusy(mode === 'add' ? 'add' : 'desktop');
    try {
      const made: HeroBanner[] = [];
      for (const file of files) {
        const img = await processUpload(file, 2400);
        const url = await catalogStore.saveImage(img.blob);
        const desktop = uploaded(url, img.width, img.height, `${title || label} — campaign banner`);
        // automatic layout: copy on the clearest band, matching text colour, phone crop on the subjects
        const auto = await layoutFor(img.blob);
        const crop = await cropForMobile(img.blob, auto.focusX);
        const mUrl = await catalogStore.saveImage(crop.blob);
        made.push({ copyLeft: auto.copyLeft, copyWidth: auto.copyWidth, tone: auto.tone, desktop, mobile: uploaded(mUrl, crop.width, crop.height, desktop.alt) });
        setFocusX(Math.round(auto.focusX * 100));
      }
      if (mode === 'replace' && banner) {
        setBanner({ ...made[0] });
      } else {
        setSlides((list) => [...list, ...made]);
        setActive(slides.length + made.length - 1);
      }
    } catch {
      notify('Gagal memproses banner');
    } finally {
      setBusy(null);
    }
  };

  /** Re-run the automatic layout for the slide being edited. */
  const autoLayout = async () => {
    if (!banner) return;
    setBusy('auto');
    try {
      const blob = await assetBlob(banner.desktop);
      const auto = await layoutFor(blob);
      const crop = await cropForMobile(blob, auto.focusX);
      const url = await catalogStore.saveImage(crop.blob);
      setBanner({ ...banner, copyLeft: auto.copyLeft, copyWidth: auto.copyWidth, tone: auto.tone, mobile: uploaded(url, crop.width, crop.height, banner.desktop.alt) });
      setFocusX(Math.round(auto.focusX * 100));
      notify('Posisi teks & potongan HP diatur otomatis');
    } catch {
      notify('Gagal menganalisis gambar');
    } finally {
      setBusy(null);
    }
  };

  const recrop = async () => {
    if (!banner) return;
    setBusy('crop');
    try {
      const crop = await cropForMobile(await assetBlob(banner.desktop), focusX / 100);
      const url = await catalogStore.saveImage(crop.blob);
      setBanner({ ...banner, mobile: uploaded(url, crop.width, crop.height, banner.desktop.alt) });
    } catch {
      notify('Gagal memotong gambar');
    } finally {
      setBusy(null);
    }
  };

  const uploadMobile = async ([file]: File[]) => {
    if (!banner) return;
    setBusy('mobile');
    try {
      const img = await processUpload(file, 1200);
      const url = await catalogStore.saveImage(img.blob);
      setBanner({ ...banner, mobile: uploaded(url, img.width, img.height, banner.desktop.alt) });
    } finally {
      setBusy(null);
    }
  };

  const uploadCover = async ([file]: File[]) => {
    setBusy('cover');
    try {
      const img = await processUpload(file, 1200);
      const url = await catalogStore.saveImage(img.blob);
      setCover({ ...uploaded(url, img.width, img.height, `${label} — category cover`), focus: '50% 25%' });
    } catch {
      notify('Gagal memproses foto sampul');
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    const e: Record<string, string> = {};
    if (!label.trim()) e.label = 'Nama kategori wajib diisi';
    if (!title.trim()) e.title = 'Judul hero wajib diisi';
    // Slugs are unique across Women and Men (product sub-categories point at them)
    if (isNew && (!finalSlug || catalogStore.uniqueSlug(finalSlug, 'category') !== finalSlug)) e.slug = finalSlug ? 'Slug sudah dipakai' : 'Slug wajib diisi';
    setErrors(e);
    if (Object.keys(e).length) return;
    const base = category ?? { slug: finalSlug, label, hero: { ...(template?.hero ?? {}), eyebrow, title, description } };
    const def: WomenCategoryDef = {
      ...base,
      slug: finalSlug,
      label: label.trim(),
      cover,
      hero: { ...base.hero, eyebrow: eyebrow.trim(), title: title.trim(), description: description.trim(), banner: slides[0], banners: slides.length ? slides : undefined },
    };
    try {
      await catalogStore.saveCategory(def, segment);
      if (template && copyProducts && templateProducts.length) {
        const copies: Product[] = [];
        for (const p of templateProducts) copies.push(catalogStore.cloneProduct(p, { subcategory: finalSlug, name: p.name }, copies.map((c) => c.slug)));
        await catalogStore.addProducts(copies);
      }
      notify(template ? `Kategori diduplikat${copyProducts && templateProducts.length ? ` beserta ${templateProducts.length} produk` : ''}` : isNew ? 'Kategori ditambahkan' : 'Kategori diperbarui');
      onClose();
    } catch {
      notify('Gagal menyimpan — penyimpanan browser tidak tersedia');
    }
  };

  const fallbackNote = category?.hero.main ? 'Tanpa banner, hero memakai layout lengkungan bawaan.' : 'Tanpa banner, hero tampil sebagai teks saja.';

  return (
    <Drawer
      open={open}
      title={template ? `Duplikat kategori — ${template.label}` : isNew ? `Tambah kategori ${seg.label}` : `Edit kategori — ${category!.label}`}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-outline h-11 px-5">
            Batal
          </button>
          <button type="button" onClick={save} disabled={!!busy} className="btn-ink h-11 px-6">
            Simpan kategori
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        <section className="grid gap-5 sm:grid-cols-2">
          <Field label="Nama kategori (menu & filter) *" error={errors.label}>
            <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="cth. Batik Kimono" />
          </Field>
          <Field label="Slug URL" error={errors.slug} hint={`${seg.path}/${finalSlug || '…'}`}>
            <input className={inputCls} value={finalSlug} disabled={!isNew} onChange={(e) => setSlug(slugify(e.target.value))} />
          </Field>
        </section>

        {template && templateProducts.length > 0 && (
          <label className="flex cursor-pointer items-start gap-3 bg-mist px-4 py-3 text-sm">
            <input type="checkbox" checked={copyProducts} onChange={(e) => setCopyProducts(e.target.checked)} className="mt-0.5 h-4 w-4 accent-ink" />
            <span>
              Salin juga {templateProducts.length} produk dari “{template.label}” ke kategori baru
              <span className="block text-xs text-stone">Nama, harga, foto, ukuran & warna ikut tersalin — slug dan SKU dibuat baru. Edit tiap produk setelahnya.</span>
            </span>
          </label>
        )}

        <section className="grid gap-5">
          <h3 className="eyebrow text-[0.65rem]">{finalSlug === 'all' ? 'Teks hero' : 'Judul halaman kategori'}</h3>
          <Field label="Eyebrow">
            <input className={inputCls} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
          </Field>
          <Field label="Judul *" error={errors.title}>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Batik Long Outer" />
          </Field>
          <Field label="Deskripsi">
            <textarea className={textareaCls} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </section>

        {finalSlug !== 'all' && (
          <section>
            <h3 className="eyebrow mb-2 text-[0.65rem]">Foto sampul (tile di halaman {seg.label} & menu)</h3>
            <p className="mb-4 text-xs leading-relaxed text-stone">Foto potret (3:4) yang mewakili kategori ini. Kalau kosong, otomatis memakai foto produk pertama di kategori.</p>
            <div className="grid grid-cols-[140px_1fr] items-start gap-5">
              <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                {(cover ?? (category && catalogStore.coverOf(category, segment))) && <Img asset={(cover ?? catalogStore.coverOf(category!, segment))!} sizes="140px" />}
                {!cover && <span className="absolute inset-x-0 bottom-0 bg-ivory/85 px-2 py-1 text-center text-[0.6rem] text-stone">Otomatis</span>}
              </div>
              <div className="space-y-3">
                <DropZone onFiles={uploadCover} busy={busy === 'cover'} label={cover ? 'Ganti foto sampul' : 'Upload foto sampul'} />
                {cover && (
                  <button type="button" onClick={() => setCover(undefined)} className="text-xs text-danger underline underline-offset-4">
                    Hapus foto sampul (kembali otomatis)
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {finalSlug === 'all' ? (
          <section>
            <h3 className="eyebrow mb-2 text-[0.65rem]">Banner hero{slides.length > 1 ? ` — ${slides.length} slide (bergerak otomatis)` : ''}</h3>
            <p className="mb-4 text-xs leading-relaxed text-stone">
              Upload foto lebar (landscape, idealnya ≥ 2000 px) <strong className="font-medium text-ink">tanpa teks di gambar</strong> — judul & deskripsi di atas ditampilkan sebagai teks
              HTML. Banner selalu tampil utuh sesuai rasio aslinya, jadi model tidak terpotong. Tambah 2 slide atau lebih agar hero bergerak seperti hero beranda. {fallbackNote}
            </p>

            {slides.length > 0 && (
              <div className="mb-6">
                <p className="eyebrow mb-2 text-[0.58rem] text-stone">Slide — klik untuk mengedit, urutkan dengan panah</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slides.map((sl, i) => (
                    <div key={`${sl.desktop.url ?? sl.desktop.src}-${i}`}>
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        aria-pressed={i === active}
                        className={cn('relative block w-full overflow-hidden bg-sand transition-shadow', i === active ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100')}
                        style={{ aspectRatio: 16 / 9 }}
                      >
                        <Img asset={sl.desktop} sizes="160px" />
                        <span className="absolute top-1 left-1 bg-ink px-1.5 py-0.5 text-[0.6rem] text-ivory tabular-nums">{i + 1}</span>
                      </button>
                      <div className="mt-1 flex justify-between text-stone">
                        <span className="flex">
                          <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0} className="p-1 disabled:opacity-25" aria-label={`Geser slide ${i + 1} ke kiri`}>
                            <ArrowLeft size={13} />
                          </button>
                          <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} className="p-1 disabled:opacity-25" aria-label={`Geser slide ${i + 1} ke kanan`}>
                            <ArrowRight size={13} />
                          </button>
                        </span>
                        {Math.abs(sl.desktop.ratio / slides[0].desktop.ratio - 1) > 0.06 && (
                          <span className="self-center text-[0.58rem] text-bronze" title="Rasio berbeda dari slide 1 — ditampilkan utuh dengan latar blur">
                            rasio beda
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <DropZone multiple compact onFiles={(f) => uploadDesktop(f, 'add')} busy={busy === 'add'} label="+ Tambah slide" />
                </div>
              </div>
            )}

            {banner ? (
              <>
                {/* Live desktop preview */}
                <p className="eyebrow mb-2 text-[0.58rem] text-stone">Preview desktop — slide {active + 1}</p>
                <div className="relative overflow-hidden bg-sand" style={{ aspectRatio: banner.desktop.ratio }}>
                  <Img asset={banner.desktop} sizes="700px" />
                  <div
                    className={cn('absolute inset-y-0 flex flex-col justify-center', banner.tone === 'light' ? 'text-ivory' : 'text-ink')}
                    style={{ left: `${banner.copyLeft ?? 19}%`, width: `${banner.copyWidth ?? 34}%` }}
                  >
                    <p className="text-[0.4rem] tracking-[0.3em] uppercase opacity-70 sm:text-[0.5rem]">{eyebrow}</p>
                    <span className="my-1.5 block h-px w-[40%] bg-current opacity-25" />
                    <p className="font-serif text-[clamp(0.9rem,3.2vw,1.6rem)] leading-none">{title || 'Judul'}</p>
                    <p className="mt-1.5 line-clamp-2 text-[0.45rem] opacity-75 sm:text-[0.55rem]">{description}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-stone">Posisi teks, warna teks & potongan HP diatur otomatis saat upload. Sesuaikan manual bila perlu.</p>
                  <button type="button" onClick={autoLayout} disabled={!!busy} className="btn-outline h-9 px-4 text-[0.62rem]">
                    {busy === 'auto' ? 'Menganalisis…' : `Atur otomatis slide ${active + 1}`}
                  </button>
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-3">
                  <Field label={`Posisi teks — ${banner.copyLeft ?? 19}% dari kiri`}>
                    <input type="range" min={3} max={66} value={banner.copyLeft ?? 19} onChange={(e) => setBanner({ ...banner, copyLeft: +e.target.value })} className="w-full accent-ink" />
                  </Field>
                  <Field label={`Lebar kolom teks — ${banner.copyWidth ?? 34}%`}>
                    <input type="range" min={20} max={50} value={banner.copyWidth ?? 34} onChange={(e) => setBanner({ ...banner, copyWidth: +e.target.value })} className="w-full accent-ink" />
                  </Field>
                  <Field label="Warna teks">
                    <select className={inputCls} value={banner.tone ?? 'dark'} onChange={(e) => setBanner({ ...banner, tone: e.target.value as 'dark' | 'light' })}>
                      <option value="dark">Gelap (untuk foto terang)</option>
                      <option value="light">Terang (untuk foto gelap)</option>
                    </select>
                  </Field>
                </div>

                {/* Mobile crop */}
                <div className="mt-8 grid gap-5 sm:grid-cols-[180px_1fr]">
                  <div>
                    <p className="eyebrow mb-2 text-[0.58rem] text-stone">Preview HP</p>
                    <div className="relative overflow-hidden bg-sand" style={{ aspectRatio: banner.mobile.ratio }}>
                      <Img asset={banner.mobile} sizes="180px" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Field label={`Fokus potongan HP — ${focusX}% (geser ke posisi model)`}>
                      <input type="range" min={0} max={100} value={focusX} onChange={(e) => setFocusX(+e.target.value)} className="w-full accent-ink" />
                    </Field>
                    <button type="button" onClick={recrop} disabled={!!busy} className="btn-outline h-10 px-4 text-[0.65rem]">
                      {busy === 'crop' ? 'Memotong…' : 'Potong ulang untuk HP'}
                    </button>
                    <div>
                      <p className="mb-2 text-xs text-stone">…atau upload foto khusus HP (potret/kotak):</p>
                      <DropZone onFiles={uploadMobile} busy={busy === 'mobile'} label="Upload foto HP" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <DropZone onFiles={(f) => uploadDesktop(f, 'replace')} busy={busy === 'desktop'} label={`Ganti gambar slide ${active + 1}`} />
                  <button type="button" onClick={() => setBanner(undefined)} className="border border-danger/40 py-3 text-xs text-danger hover:bg-danger/5">
                    Hapus slide {active + 1}
                  </button>
                </div>
              </>
            ) : (
              <DropZone multiple onFiles={(f) => uploadDesktop(f, 'add')} busy={busy === 'add'} label="Upload banner hero — boleh beberapa sekaligus (klik / drag)" />
            )}
          </section>
        ) : (
          <p className="bg-mist px-4 py-3 text-xs leading-relaxed text-stone">
            Halaman kategori tidak memakai banner hero — produk langsung tampil di bawah judul & deskripsi. Banner hero besar hanya ada di halaman {seg.path} (kartu “All {seg.label}”).
          </p>
        )}
      </div>
    </Drawer>
  );
}
