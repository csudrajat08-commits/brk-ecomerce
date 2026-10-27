import { ArrowDown, ArrowUp, Copy, Download, ExternalLink, Pencil, Plus, RotateCcw, Search, Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { PageTop } from '../../components/layout/Layout';
import { Img } from '../../components/ui/Img';
import { useShop } from '../../context/ShopContext';
import { categories as baseCategories } from '../../data/catalog';
import { heroBanners, type WomenCategoryDef } from '../../data/womenCatalog';
import { SEGMENT_KEYS, SEGMENTS } from '../../data/segments';
import { useCatalogVersion, useMainCategories, useSegmentCategories } from '../../hooks/useCatalog';
import { cn, formatIDR } from '../../lib/format';
import { catalogStore, type ExportBundle } from '../../services/catalogStore';
import type { Category, Product, Segment } from '../../types/commerce';
import { inputCls } from './AdminUi';
import { CategoryEditor } from './CategoryEditor';
import { CategorySelect, matchesFilter } from './CategoryFilter';
import { HeroEditor } from './HeroEditor';
import { HomeTileEditor } from './HomeTileEditor';
import { CollectionsGrid, SectionCard } from './HomeSections';
import { NewArrivalsEditor } from './NewArrivalsEditor';
import { ProductForm } from './ProductForm';

type Tab = 'products' | 'categories' | 'home' | 'data';
const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'products', label: 'Produk' },
  { id: 'categories', label: 'Kategori & Hero' },
  { id: 'home', label: 'Homepage' },
  { id: 'data', label: 'Data' },
];

const ORIGIN_BADGE = {
  base: { label: 'Bawaan', cls: 'bg-mist text-stone' },
  edited: { label: 'Diedit', cls: 'bg-bronze/15 text-bronze' },
  added: { label: 'Baru', cls: 'bg-ink text-ivory' },
};

export default function AdminPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'products';
  useCatalogVersion();

  useEffect(() => {
    document.title = 'Admin (demo) — Batik Riana Kesuma';
  }, []);

  return (
    <PageTop>
      <div className="container-brk pt-8 pb-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-bronze">Admin · Demo</p>
            <h1 className="display mt-3 text-5xl md:text-6xl">Kelola katalog</h1>
          </div>
          {catalogStore.mode === 'server' ? (
            <p className="max-w-md text-xs leading-relaxed text-stone">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#3f8f5a] align-middle" />
              Tersimpan di <strong className="font-medium text-ink">server dev (folder project /admin-data)</strong> — tampil di semua perangkat yang membuka website ini, termasuk HP di
              Wi-Fi yang sama.
            </p>
          ) : (
            <p className="max-w-md text-xs leading-relaxed text-stone">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-bronze align-middle" />
              Server dev tidak terhubung — perubahan disimpan di <strong className="font-medium text-ink">browser ini saja</strong>. Jalankan <code>npm run dev</code> agar tersimpan
              untuk semua perangkat.
            </p>
          )}
        </div>

        {catalogStore.unavailable && (
          <p className="mt-6 bg-danger/10 px-4 py-3 text-sm text-danger">Penyimpanan tidak tersedia (mode privat?). Perubahan tidak bisa disimpan.</p>
        )}
        {catalogStore.localPending && <MigrationNotice />}

        <div role="tablist" className="scrollbar-none mt-10 flex gap-1 overflow-x-auto border-b border-ink/15">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setParams({ tab: t.id })}
              className={cn('shrink-0 border-b-2 px-4 py-3 text-xs whitespace-nowrap tracking-[0.14em] uppercase transition-colors', tab === t.id ? 'border-ink text-ink' : 'border-transparent text-stone hover:text-ink')}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="pt-8">
          {tab === 'products' && <ProductsTab />}
          {tab === 'categories' && <CategoriesTab />}
          {tab === 'home' && <HomeTab />}
          {tab === 'data' && <DataTab />}
        </div>
      </div>
    </PageTop>
  );
}

/* ------------------------------------------------------------------ */

/** Edits made earlier in browser-only mode, offered for upload to the shared server storage. */
function MigrationNotice() {
  const { notify } = useShop();
  const [busy, setBusy] = useState(false);
  const pending = catalogStore.localPending!;
  const migrate = async () => {
    setBusy(true);
    try {
      await catalogStore.migrateLocalToServer();
      notify('Data dari browser ini sudah dipindahkan ke server');
    } catch {
      notify('Gagal memindahkan data');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-6 flex flex-col gap-3 bg-bronze/12 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">
        Ada <strong className="font-medium">{pending.products} perubahan produk</strong>
        {pending.categories > 0 && ` dan ${pending.categories} perubahan kategori`} yang masih tersimpan di browser ini saja — belum terlihat di perangkat lain.
      </p>
      <button type="button" onClick={migrate} disabled={busy} className="btn-ink h-10 shrink-0 px-5 text-[0.65rem]">
        {busy ? 'Memindahkan…' : 'Pindahkan ke server'}
      </button>
    </div>
  );
}

function ProductsTab() {
  const { notify } = useShop();
  const subcats = [...useSegmentCategories('women'), ...useSegmentCategories('men')];
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('women:batik-long-outer');
  const [editing, setEditing] = useState<Product | undefined>();
  const [template, setTemplate] = useState<Product | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const [kind, value] = filter.split(':');
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return catalogStore.products.filter((p) => matchesFilter(p, filter) && (!t || `${p.name} ${p.sku} ${p.motif}`.toLowerCase().includes(t)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filter, catalogStore.version]);

  const remove = async (p: Product) => {
    if (!window.confirm(`Hapus “${p.name}” dari katalog?`)) return;
    await catalogStore.deleteProduct(p.id);
    notify('Produk dihapus');
  };

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="relative flex-1 lg:max-w-xs">
            <Search size={15} strokeWidth={1.25} className="absolute top-1/2 left-3 -translate-y-1/2 text-stone" />
            <input className={cn(inputCls, 'pl-9')} placeholder="Cari nama / SKU / motif" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <CategorySelect className="sm:w-64" value={filter} onChange={setFilter} />
        </div>
        <div className="flex items-center gap-4">
          {catalogStore.deletedCount > 0 && (
            <button type="button" onClick={() => catalogStore.restoreDeleted().then(() => notify('Produk terhapus dipulihkan'))} className="text-xs text-stone underline underline-offset-4 hover:text-ink">
              Pulihkan {catalogStore.deletedCount} produk terhapus
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            className="btn-ink h-11 px-5"
          >
            <Plus size={15} strokeWidth={1.5} /> Tambah produk
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-stone">{list.length} produk</p>
      <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
        {list.map((p) => {
          const origin = catalogStore.originOf(p.id);
          const badge = ORIGIN_BADGE[origin];
          const sub = subcats.find((c) => c.slug === p.subcategory)?.label;
          return (
            <li key={p.id} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 py-3 sm:grid-cols-[3.5rem_1fr_8rem_5rem_11.5rem]">
              <div className="relative aspect-[3/4] overflow-hidden bg-sand">{p.images[0] ? <Img asset={p.images[0]} sizes="56px" /> : null}</div>
              <div className="min-w-0">
                <p className="truncate text-sm">{p.name}</p>
                <p className="mt-0.5 truncate text-xs text-stone">
                  {p.sku} · {sub ?? baseCategories.find((c) => c.slug === p.category)?.shortName}
                  <span className={cn('ml-2 px-1.5 py-0.5 text-[0.6rem] tracking-[0.1em] uppercase', badge.cls)}>{badge.label}</span>
                </p>
              </div>
              <p className="hidden text-sm tabular-nums sm:block">{formatIDR(p.price)}</p>
              <p className="hidden text-xs text-stone tabular-nums sm:block">Stok {p.stock}</p>
              <div className="flex items-center justify-end">
                <Link to={`/product/${p.slug}`} className="p-2 text-stone hover:text-ink" aria-label="Lihat di toko" title="Lihat di toko">
                  <ExternalLink size={15} strokeWidth={1.25} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setTemplate(undefined);
                    setEditing(p);
                    setFormOpen(true);
                  }}
                  className="p-2 hover:text-bronze"
                  aria-label={`Edit ${p.name}`}
                  title="Edit"
                >
                  <Pencil size={15} strokeWidth={1.25} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(undefined);
                    setTemplate(p);
                    setFormOpen(true);
                  }}
                  className="p-2 hover:text-bronze"
                  aria-label={`Duplikat ${p.name}`}
                  title="Duplikat"
                >
                  <Copy size={15} strokeWidth={1.25} />
                </button>
                {origin === 'edited' && (
                  <button type="button" onClick={() => catalogStore.resetProduct(p.id).then(() => notify('Dikembalikan ke versi bawaan'))} className="p-2 text-stone hover:text-ink" aria-label="Kembalikan ke bawaan" title="Kembalikan ke bawaan">
                    <RotateCcw size={15} strokeWidth={1.25} />
                  </button>
                )}
                <button type="button" onClick={() => remove(p)} className="p-2 text-danger/80 hover:text-danger" aria-label={`Hapus ${p.name}`} title="Hapus">
                  <Trash2 size={15} strokeWidth={1.25} />
                </button>
              </div>
            </li>
          );
        })}
        {list.length === 0 && <li className="py-10 text-center text-sm text-stone">Belum ada produk di filter ini.</li>}
      </ul>

      <ProductForm open={formOpen} product={editing} template={template} defaultSubcategory={kind === 'women' || kind === 'men' ? value : ''} onClose={() => setFormOpen(false)} />
    </>
  );
}

/* ------------------------------------------------------------------ */

function CategoriesTab() {
  const { notify } = useShop();
  const [params, setParams] = useSearchParams();
  const segment: Segment = params.get('seg') === 'men' ? 'men' : 'women';
  const seg = SEGMENTS[segment];
  const women = useSegmentCategories(segment);
  const [editing, setEditing] = useState<WomenCategoryDef | undefined>();
  const [catTemplate, setCatTemplate] = useState<WomenCategoryDef | undefined>();
  const [open, setOpen] = useState(false);
  const count = (slug: string) =>
    slug === 'all' ? catalogStore.products.filter((p) => catalogStore.segmentOf(p) === segment).length : catalogStore.products.filter((p) => p.subcategory === slug).length;

  return (
    <>
      {/* Women / Men */}
      <div role="tablist" aria-label="Segmen" className="mb-6 inline-flex border border-ink/20">
        {SEGMENT_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={segment === k}
            onClick={() => setParams({ tab: 'categories', seg: k })}
            className={cn('h-10 px-6 text-xs tracking-[0.14em] uppercase transition-colors', segment === k ? 'bg-ink text-ivory' : 'text-ink/70 hover:text-ink')}
          >
            {SEGMENTS[k].label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-stone">
          Kategori di halaman {seg.label}: atur nama, teks hero, dan banner hero (desktop + potongan HP). Produk masuk kategori lewat field “Kategori {seg.label}” di form produk.
        </p>
        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
          className="btn-ink h-11 shrink-0 px-5"
        >
          <Plus size={15} strokeWidth={1.5} /> Tambah kategori
        </button>
      </div>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {women.map((c) => {
          const heroImg = c.slug === 'all' ? (c.hero.banner?.desktop ?? c.hero.main) : catalogStore.coverOf(c, segment);
          const pos = women.filter((x) => x.slug !== 'all').findIndex((x) => x.slug === c.slug);
          const last = women.length - 2;
          const nSlides = heroBanners(c.hero).length;
          const layout = nSlides > 1 ? `Banner · ${nSlides} slide` : nSlides ? 'Banner' : c.hero.main ? 'Lengkungan' : 'Teks saja';
          return (
            <li key={c.slug} className="flex flex-col bg-paper">
              <div className="relative aspect-[16/7] overflow-hidden bg-sand">
                {heroImg ? <Img asset={heroImg} sizes="400px" focus="50% 22%" /> : <span className="absolute inset-0 flex items-center justify-center text-xs text-stone">Belum ada gambar</span>}
                {c.slug === 'all' ? (
                  <span className="absolute top-2 left-2 bg-ink px-2 py-1 text-[0.6rem] tracking-[0.12em] text-ivory uppercase">Halaman {seg.path}</span>
                ) : (
                  <div className="absolute top-2 right-2 flex bg-ivory/90">
                    <button type="button" disabled={pos <= 0} onClick={() => catalogStore.moveCategory(c.slug, -1, segment)} className="p-2 disabled:opacity-25" aria-label={`Naikkan ${c.label}`} title="Geser ke atas">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" disabled={pos >= last} onClick={() => catalogStore.moveCategory(c.slug, 1, segment)} className="p-2 disabled:opacity-25" aria-label={`Turunkan ${c.label}`} title="Geser ke bawah">
                      <ArrowDown size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl">{c.label}</p>
                    <p className="mt-0.5 text-xs text-stone">
                      {c.slug === 'all' ? `${seg.path} (halaman utama ${seg.label})` : `${seg.path}/${c.slug}`} · {count(c.slug)} produk · Hero: {layout}
                    </p>
                  </div>
                  {c.custom ? (
                    <span className="bg-ink px-1.5 py-0.5 text-[0.6rem] tracking-[0.1em] text-ivory uppercase">Baru</span>
                  ) : (
                    catalogStore.isCategoryEdited(c.slug, segment) && <span className="bg-bronze/15 px-1.5 py-0.5 text-[0.6rem] tracking-[0.1em] text-bronze uppercase">Diedit</span>
                  )}
                </div>
                <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-4 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setCatTemplate(undefined);
                      setEditing(c);
                      setOpen(true);
                    }}
                    className="link-under tracking-[0.12em] uppercase"
                  >
                    Edit & hero
                  </button>
                  {c.slug !== 'all' && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(undefined);
                        setCatTemplate(c);
                        setOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-stone hover:text-ink"
                    >
                      <Copy size={12} strokeWidth={1.4} /> Duplikat
                    </button>
                  )}
                  <Link to={c.slug === 'all' ? seg.path : `${seg.path}/${c.slug}`} className="text-stone hover:text-ink">
                    Lihat halaman
                  </Link>
                  {!c.custom && catalogStore.isCategoryEdited(c.slug, segment) && (
                    <button type="button" onClick={() => catalogStore.resetCategory(c.slug, segment).then(() => notify('Kategori dikembalikan ke bawaan'))} className="text-stone hover:text-ink">
                      Reset
                    </button>
                  )}
                  {c.custom && (
                    <button
                      type="button"
                      onClick={() => window.confirm(`Hapus kategori “${c.label}”? Produknya tidak ikut terhapus.`) && catalogStore.deleteCategory(c.slug, segment).then(() => notify('Kategori dihapus'))}
                      className="text-danger"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <CategoryEditor open={open} category={editing} template={catTemplate} segment={segment} onClose={() => setOpen(false)} />
    </>
  );
}

/* ------------------------------------------------------------------ */

/** Homepage sections in page order — the jump menu at the top of the Homepage tab. */
const HOME_BLOCKS = [
  { id: 'adm-announce', label: 'Pengumuman' },
  { id: 'adm-hero', label: 'Hero' },
  { id: 'adm-categories', label: 'Shop by category' },
  { id: 'adm-new', label: 'New Arrivals' },
  { id: 'adm-editorial', label: 'Editorial' },
  { id: 'adm-collections', label: 'Collections' },
  { id: 'adm-art', label: 'Art of batik' },
  { id: 'adm-wholesale', label: 'Wholesale' },
];

function Block({ id, title, children }: { id: string; title?: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-28 border-t border-ink/15 pt-10 first:mt-0 first:border-0 first:pt-0">
      {title && <h2 className="font-serif text-3xl">{title}</h2>}
      {children}
    </section>
  );
}

function HomeTab() {
  const { notify } = useShop();
  const tiles = useMainCategories();
  const [editing, setEditing] = useState<Category | undefined>();
  const [open, setOpen] = useState(false);
  const count = (slug: string) => catalogStore.products.filter((p) => p.category === slug).length;

  return (
    <>
      <div className="mb-12 bg-paper p-5">
        <p className="text-sm text-stone">Semua isi homepage — foto dan teks — diatur di sini, urut dari atas ke bawah. Lompat ke:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {HOME_BLOCKS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => document.getElementById(b.id)?.scrollIntoView({ behavior: 'smooth' })}
              className="h-9 border border-ink/20 px-3 text-xs hover:border-ink"
            >
              <span className="mr-1.5 text-stone tabular-nums">{String(i).padStart(2, '0')}</span>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Block id="adm-announce">
          <div className="mt-6">
            <SectionCard k="announcements" />
          </div>
        </Block>

        <Block id="adm-hero">
          <HeroEditor />
        </Block>

        <Block id="adm-categories" title="Shop by category">
          <div className="mt-6">
            <SectionCard k="categories" anchor="shop-by-category" />
          </div>
          <p className="mt-8 text-sm text-stone">5 tile kategori — produk yang tampil saat tile diklik diatur lewat “Kategori utama” di form produk.</p>
          <ul className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">
            {tiles.map((c, i) => (
              <li key={c.slug} className="flex flex-col bg-paper">
                <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                  <Img asset={c.image} sizes="240px" />
                  <span className="absolute top-2 left-2 bg-ivory/90 px-2 py-1 text-[0.6rem] tracking-[0.12em] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {catalogStore.isHomeTileEdited(c.slug) && <span className="absolute top-2 right-2 bg-bronze px-1.5 py-0.5 text-[0.6rem] tracking-[0.1em] text-ivory uppercase">Diedit</span>}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-serif text-lg leading-tight">{c.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-stone">{c.description}</p>
                  <p className="mt-1 text-[0.7rem] text-stone">
                    /shop/{c.slug} · {count(c.slug)} produk
                  </p>
                  <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-4 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(c);
                        setOpen(true);
                      }}
                      className="link-under tracking-[0.12em] uppercase"
                    >
                      Edit tile
                    </button>
                    {catalogStore.isHomeTileEdited(c.slug) && (
                      <button type="button" onClick={() => catalogStore.resetHomeTile(c.slug).then(() => notify('Tile dikembalikan ke bawaan'))} className="text-stone hover:text-ink">
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <HomeTileEditor open={open} category={editing} onClose={() => setOpen(false)} />
        </Block>

        <Block id="adm-new">
          <NewArrivalsEditor />
          <div className="mt-8">
            <SectionCard k="newArrivals" anchor="new-arrivals" />
          </div>
        </Block>

        <Block id="adm-editorial">
          <div className="mt-6">
            <SectionCard k="editorial" anchor="campaign-title" />
          </div>
        </Block>

        <Block id="adm-collections" title="Featured collections">
          <div className="mt-6">
            <SectionCard k="collections" anchor="collections-title" />
          </div>
          <p className="mt-8 text-sm text-stone">5 koleksi — fotonya juga dipakai di halaman /collections dan header toko tiap koleksi. Isi produknya diatur lewat field “Koleksi” di form produk.</p>
          <CollectionsGrid />
        </Block>

        <Block id="adm-art">
          <div className="mt-6">
            <SectionCard k="art" anchor="art-of-batik" />
          </div>
        </Block>

        <Block id="adm-wholesale">
          <div className="mt-6">
            <SectionCard k="wholesale" anchor="wholesale-title" />
          </div>
        </Block>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function DataTab() {
  const { notify } = useShop();
  const fileRef = useRef<HTMLInputElement>(null);
  const [usage, setUsage] = useState<string | null>(null);

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => e.usage != null && setUsage(`${(e.usage / 1024 / 1024).toFixed(1)} MB`));
  }, []);

  const exportData = async () => {
    const bundle = await catalogStore.exportBundle();
    const blob = new Blob([JSON.stringify(bundle)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `brk-admin-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify('File export diunduh');
  };

  const importData = async (file: File) => {
    try {
      const bundle = JSON.parse(await file.text()) as ExportBundle;
      if (!window.confirm('Import akan MENGGANTI semua perubahan admin di browser ini. Lanjutkan?')) return;
      await catalogStore.importBundle(bundle);
      notify('Data berhasil diimport');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'File tidak valid');
    }
  };

  const reset = async () => {
    if (!window.confirm('Hapus SEMUA perubahan admin (produk, kategori, gambar upload) dan kembali ke data bawaan?')) return;
    await catalogStore.resetAll();
    notify('Katalog dikembalikan ke data bawaan');
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="bg-paper p-6">
        <Download size={20} strokeWidth={1.1} />
        <h3 className="mt-4 font-serif text-2xl">Export</h3>
        <p className="mt-2 text-sm text-stone">Unduh semua perubahan (termasuk gambar upload) sebagai satu file JSON — untuk backup atau dipindah ke laptop presentasi.</p>
        <button type="button" onClick={exportData} className="btn-outline mt-6 h-11 px-5">
          Export JSON
        </button>
      </div>
      <div className="bg-paper p-6">
        <Upload size={20} strokeWidth={1.1} />
        <h3 className="mt-4 font-serif text-2xl">Import</h3>
        <p className="mt-2 text-sm text-stone">Muat file export dari browser lain. Perubahan yang ada sekarang akan diganti.</p>
        <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline mt-6 h-11 px-5">
          Pilih file…
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => (e.target.files?.[0] && importData(e.target.files[0]), (e.target.value = ''))} />
      </div>
      <div className="bg-paper p-6">
        <RotateCcw size={20} strokeWidth={1.1} />
        <h3 className="mt-4 font-serif text-2xl">Reset</h3>
        <p className="mt-2 text-sm text-stone">Kembalikan katalog ke data bawaan prototype.{usage && ` Penyimpanan terpakai: ${usage}.`}</p>
        <button type="button" onClick={reset} className="mt-6 h-11 border border-danger/40 px-5 text-[0.75rem] tracking-[0.18em] text-danger uppercase hover:bg-danger/5">
          Reset semua
        </button>
      </div>
    </div>
  );
}
