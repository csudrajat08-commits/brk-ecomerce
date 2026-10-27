import { Fragment } from 'react';

/**
 * Renders admin-editable title markup: `*words*` become italic, new lines
 * become line breaks (hidden on phones when `breakFrom` is set, e.g. 'md').
 */
export function RichTitle({ text, breakFrom }: { text: string; breakFrom?: 'md' }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && (breakFrom ? <br className="hidden md:block" /> : <br />)}
          {li > 0 && breakFrom && ' '}
          {line.split(/(\*[^*]+\*)/g).map((part, pi) => (part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <em key={pi}>{part.slice(1, -1)}</em> : <Fragment key={pi}>{part}</Fragment>))}
        </Fragment>
      ))}
    </>
  );
}
