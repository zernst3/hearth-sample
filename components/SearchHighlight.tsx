'use client';

export default function SearchHighlight({ text, query }: { text: string; query: string }) {
  if (!query) {
    return <span>{text}</span>;
  }
  const html = text.replace(new RegExp(query, 'gi'), (m) => `<mark>${m}</mark>`);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
