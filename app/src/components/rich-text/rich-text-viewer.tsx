import { cn } from '@/lib/utils';

import 'quill/dist/quill.bubble.css';

/**
 * Додає клас "ql-ui" до всіх <span> усередині <li>, бо інакше нумерація
 * "злітає". Такий собі прикольчик Quill
 */
function addQlUiClasses(html: string): string {
  if (!html) return '';

  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(html, 'text/html');
  const spanList = parsedDocument.querySelectorAll('li > span');

  for (const span of spanList) {
    span.classList.add('ql-ui');
    span.setAttribute('contenteditable', 'false');
  }

  return parsedDocument.body.innerHTML;
}

type RichTextViewerProps = {
  value: string;
  className?: string;
};

export function RichTextViewer({ value, className }: RichTextViewerProps) {
  const processedContent = addQlUiClasses(value);

  return (
    <div
      className={cn('ql-editor rich-text-viewer', className)}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
