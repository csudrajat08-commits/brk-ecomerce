import { AnimatePresence, motion } from 'motion/react';
import { ImagePlus, X } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { useEscape, useLockBody } from '../../hooks/useUi';
import { cn } from '../../lib/format';

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="eyebrow mb-2 block text-[0.62rem] text-ink/70">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : hint && <span className="mt-1.5 block text-xs text-stone">{hint}</span>}
    </label>
  );
}

export const inputCls = 'h-11 w-full border border-ink/20 bg-paper px-3 text-sm text-ink placeholder:text-stone/60 focus:border-ink focus:outline-none';
export const textareaCls = 'w-full border border-ink/20 bg-paper px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-stone/60 focus:border-ink focus:outline-none';

export function Drawer({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useLockBody(open);
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute inset-y-0 right-0 flex w-full max-w-[760px] flex-col bg-ivory"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/10 px-5 md:px-8">
              <h2 className="font-serif text-2xl">{title}</h2>
              <button type="button" onClick={onClose} className="-mr-2 p-2" aria-label="Tutup">
                <X size={20} strokeWidth={1.25} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">{children}</div>
            {footer && <div className="shrink-0 border-t border-ink/10 bg-paper/60 px-5 py-4 md:px-8">{footer}</div>}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Click-or-drop file picker for images. */
export function DropZone({ onFiles, multiple, label, busy, compact }: { onFiles: (files: File[]) => void; multiple?: boolean; label: string; busy?: boolean; compact?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const take = (list: FileList | null) => {
    const files = [...(list ?? [])].filter((f) => f.type.startsWith('image/'));
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        take(e.dataTransfer.files);
      }}
      disabled={busy}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 border border-dashed text-center text-xs text-stone transition-colors disabled:opacity-50',
        compact ? 'aspect-[3/4]' : 'py-8',
        over ? 'border-ink bg-mist' : 'border-ink/30 hover:border-ink hover:bg-mist/60',
      )}
    >
      <ImagePlus size={20} strokeWidth={1.1} className="text-ink" />
      <span>{busy ? 'Memproses…' : label}</span>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => (take(e.target.files), (e.target.value = ''))} />
    </button>
  );
}
