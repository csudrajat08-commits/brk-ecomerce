import { ExternalLink, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Img } from '../../components/ui/Img';
import { RichTitle } from '../../components/ui/RichTitle';
import { useShop } from '../../context/ShopContext';
import type { HomeContent, HomeSectionKey } from '../../data/homeContent';
import { useCollections, useHomeContent } from '../../hooks/useCatalog';
import { catalogStore } from '../../services/catalogStore';
import type { Collection, ImageAsset } from '../../types/commerce';
import { ContentDrawer, type FieldSpec } from './ContentEditor';

const FULL = [{ label: 'Desktop & HP', aspect: '4 / 5' }];

/** What each homepage section lets the admin edit, with the real photo frames. */
export const SECTION_SPECS: Record<HomeSectionKey, { title: string; where: string; fields: FieldSpec[] }> = {
  announcements: {
    title: 'Bar pengumuman',
    where: 'Strip hitam paling atas di semua halaman, berganti tiap 5 detik.',
    fields: [
      {
        kind: 'list',
        key: 'announcements',
        label: 'Pengumuman',
        item: 'Pengumuman',
        min: 1,
        max: 6,
        blank: { text: '', to: '/' },
        fields: [
          { kind: 'text', key: 'text', label: 'Teks', hint: 'Singkat — di HP terpotong setelah ±40 huruf' },
          { kind: 'link', key: 'to', label: 'Link' },
        ],
      },
    ],
  },
  categories: {
    title: 'Judul “Shop by category”',
    where: 'Judul besar dan teks pengantar di atas 5 tile kategori.',
    fields: [
      { kind: 'title', key: 'title', label: 'Judul' },
      { kind: 'textarea', key: 'intro', label: 'Teks pengantar' },
    ],
  },
  newArrivals: {
    title: 'Judul “New Arrivals”',
    where: 'Judul section produk terbaru.',
    fields: [{ kind: 'title', key: 'title', label: 'Judul' }],
  },
  editorial: {
    title: 'Editorial',
    where: 'Section gelap (03) dengan foto kampanye besar, foto kecil dan potongan kain.',
    fields: [
      { kind: 'image', key: 'image', label: 'Foto utama (besar, kiri)', previews: FULL },
      { kind: 'text', key: 'label', label: 'Keterangan di atas foto utama' },
      { kind: 'title', key: 'title', label: 'Judul' },
      { kind: 'textarea', key: 'text', label: 'Paragraf' },
      { kind: 'text', key: 'ctaLabel', label: 'Teks tombol' },
      { kind: 'link', key: 'ctaTo', label: 'Link tombol' },
      { kind: 'text', key: 'linkLabel', label: 'Teks link kedua' },
      { kind: 'link', key: 'linkTo', label: 'Link kedua' },
      { kind: 'image', key: 'detailImage', label: 'Foto kecil (hanya desktop)', previews: [{ label: 'Desktop', aspect: '3 / 4' }] },
      { kind: 'text', key: 'detailCaption', label: 'Keterangan foto kecil' },
      { kind: 'image', key: 'fabricImage', label: 'Potongan kain (strip lebar)', previews: [{ label: 'Desktop', aspect: '4 / 1' }, { label: 'HP', aspect: '3 / 1' }] },
      { kind: 'text', key: 'fabricCaption', label: 'Keterangan kain (kiri)' },
      { kind: 'text', key: 'fabricTag', label: 'Keterangan kain (kanan)' },
    ],
  },
  collections: {
    title: 'Judul “Featured collections”',
    where: 'Judul di atas daftar koleksi.',
    fields: [{ kind: 'title', key: 'title', label: 'Judul' }],
  },
  art: {
    title: 'The art of batik',
    where: 'Section (05) tentang proses batik: 3 foto proses, deretan nama motif dan 4 angka.',
    fields: [
      { kind: 'title', key: 'title', label: 'Judul' },
      { kind: 'textarea', key: 'text', label: 'Paragraf' },
      {
        kind: 'list',
        key: 'steps',
        label: 'Proses (3 foto)',
        item: 'Langkah',
        fields: [
          { kind: 'image', key: 'image', label: 'Foto', previews: FULL },
          { kind: 'text', key: 'title', label: 'Judul' },
          { kind: 'text', key: 'term', label: 'Istilah (huruf kecil kapital)' },
          { kind: 'textarea', key: 'text', label: 'Teks' },
        ],
      },
      { kind: 'textarea', key: 'motifs', label: 'Deretan nama motif (berjalan saat di-scroll)', hint: 'Pisahkan dengan  ·  (titik tengah)' },
      {
        kind: 'list',
        key: 'facts',
        label: 'Angka (4 kolom)',
        item: 'Angka',
        fields: [
          { kind: 'text', key: 'value', label: 'Angka', hint: 'Contoh: 1997, ~300, JP · EU' },
          { kind: 'text', key: 'label', label: 'Keterangan' },
        ],
      },
    ],
  },
  wholesale: {
    title: 'Atelier services (Wholesale)',
    where: 'Section (06) layanan seragam, custom, wholesale dan OEM.',
    fields: [
      { kind: 'image', key: 'image', label: 'Foto utama', previews: FULL },
      { kind: 'image', key: 'detailImage', label: 'Foto kecil (tumpuk, hanya tablet & desktop)', previews: [{ label: 'Tablet & desktop', aspect: '1 / 1' }] },
      { kind: 'title', key: 'title', label: 'Judul' },
      { kind: 'textarea', key: 'text', label: 'Paragraf' },
      {
        kind: 'list',
        key: 'services',
        label: 'Layanan (urutan = Seragam · Custom · Wholesale · OEM di form enquiry)',
        item: 'Layanan',
        fields: [
          { kind: 'text', key: 'title', label: 'Nama layanan' },
          { kind: 'textarea', key: 'text', label: 'Teks' },
        ],
      },
      {
        kind: 'list',
        key: 'terms',
        label: 'Info di bawah foto (3 kolom)',
        item: 'Info',
        fields: [
          { kind: 'text', key: 'k', label: 'Label' },
          { kind: 'text', key: 'v', label: 'Isi' },
        ],
      },
      { kind: 'text', key: 'note', label: 'Catatan di samping tombol' },
    ],
  },
};

const imagesIn = (v: unknown): ImageAsset[] => {
  if (!v || typeof v !== 'object') return [];
  if ('alt' in v && ('src' in v || 'url' in v)) return [v as ImageAsset];
  return Object.values(v).flatMap(imagesIn);
};

/** Card for one homepage section: preview + Edit / Reset. */
export function SectionCard({ k, anchor }: { k: HomeSectionKey; anchor?: string }) {
  const { notify } = useShop();
  const content = useHomeContent();
  const spec = SECTION_SPECS[k];
  const [open, setOpen] = useState(false);
  const value = content[k];
  // The announcement list is stored as an array; the drawer edits it as { announcements: [...] }
  const wrapped = k === 'announcements';
  const drawerValue = useMemo(() => (wrapped ? { announcements: value } : (value as object)), [wrapped, value]);
  const photos = imagesIn(value).slice(0, 4);
  const title = !wrapped && 'title' in (value as object) ? String((value as { title: string }).title) : '';
  const edited = catalogStore.isHomeSectionEdited(k);

  return (
    <div className="flex flex-col gap-5 bg-paper p-5 sm:flex-row sm:items-start">
      {photos.length > 0 && (
        <div className="flex shrink-0 gap-1.5">
          {photos.map((a, i) => (
            <div key={i} className="relative h-24 w-[4.5rem] overflow-hidden bg-sand">
              <Img asset={a} sizes="72px" />
            </div>
          ))}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-serif text-xl">{spec.title}</p>
          {edited && <span className="bg-bronze/15 px-1.5 py-0.5 text-[0.6rem] tracking-[0.1em] text-bronze uppercase">Diedit</span>}
        </div>
        <p className="mt-1 text-xs text-stone">{spec.where}</p>
        {title && (
          <p className="mt-2 truncate font-serif text-base text-ink/80">
            <RichTitle text={title.replace(/\n/g, ' ')} />
          </p>
        )}
        {wrapped && (
          <ul className="mt-2 space-y-0.5 text-xs text-ink/75">
            {(value as HomeContent['announcements']).map((a, i) => (
              <li key={i} className="truncate">
                — {a.text}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <button type="button" onClick={() => setOpen(true)} className="link-under inline-flex items-center gap-1 tracking-[0.12em] uppercase">
            <Pencil size={12} strokeWidth={1.4} /> Edit
          </button>
          {anchor && (
            <Link to={`/#${anchor}`} className="inline-flex items-center gap-1 text-stone hover:text-ink">
              Lihat <ExternalLink size={11} />
            </Link>
          )}
          {edited && (
            <button type="button" onClick={() => window.confirm(`Kembalikan “${spec.title}” ke versi bawaan?`) && catalogStore.resetHomeSection(k).then(() => notify('Dikembalikan ke bawaan'))} className="text-stone hover:text-ink">
              Reset
            </button>
          )}
        </div>
      </div>

      <ContentDrawer
        open={open}
        title={spec.title}
        fields={spec.fields}
        value={drawerValue}
        onClose={() => setOpen(false)}
        onSave={(v) => catalogStore.saveHomeSection(k, (wrapped ? (v as { announcements: unknown }).announcements : v) as never)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

const COLLECTION_FIELDS: FieldSpec[] = [
  {
    kind: 'image',
    key: 'image',
    label: 'Foto',
    previews: [
      { label: 'Desktop & /collections', aspect: '4 / 5' },
      { label: 'HP', aspect: '4 / 3' },
      { label: 'Tablet', aspect: '16 / 9' },
    ],
  },
  { kind: 'text', key: 'kicker', label: 'Teks kecil di atas nama' },
  { kind: 'text', key: 'name', label: 'Nama koleksi' },
  { kind: 'textarea', key: 'description', label: 'Deskripsi' },
];

/** The five featured collections: photo + copy per collection. */
export function CollectionsGrid() {
  const { notify } = useShop();
  const list = useCollections();
  const [editing, setEditing] = useState<Collection | undefined>();
  const count = (slug: string) => catalogStore.products.filter((p) => p.collection === slug).length;

  return (
    <>
      <ul className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">
        {list.map((c, i) => (
          <li key={c.slug} className="flex flex-col bg-paper">
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              <Img asset={c.image} sizes="240px" />
              <span className="absolute top-2 left-2 bg-ivory/90 px-2 py-1 text-[0.6rem] tracking-[0.12em] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              {catalogStore.isCollectionEdited(c.slug) && <span className="absolute top-2 right-2 bg-bronze px-1.5 py-0.5 text-[0.6rem] tracking-[0.1em] text-ivory uppercase">Diedit</span>}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[0.6rem] tracking-[0.14em] text-bronze uppercase">{c.kicker}</p>
              <p className="mt-1 font-serif text-lg leading-tight">{c.name}</p>
              <p className="mt-1 text-[0.7rem] text-stone">{count(c.slug)} produk</p>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-4 text-xs">
                <button type="button" onClick={() => setEditing(c)} className="link-under tracking-[0.12em] uppercase">
                  Edit koleksi
                </button>
                {catalogStore.isCollectionEdited(c.slug) && (
                  <button type="button" onClick={() => catalogStore.resetCollection(c.slug).then(() => notify('Koleksi dikembalikan ke bawaan'))} className="text-stone hover:text-ink">
                    Reset
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <ContentDrawer
        open={!!editing}
        title={`Koleksi · ${editing?.name ?? ''}`}
        fields={COLLECTION_FIELDS}
        value={editing ?? ({} as Collection)}
        onClose={() => setEditing(undefined)}
        onSave={(v) => catalogStore.saveCollection(editing!.slug, { name: v.name, kicker: v.kicker, description: v.description, image: v.image })}
      />
    </>
  );
}
