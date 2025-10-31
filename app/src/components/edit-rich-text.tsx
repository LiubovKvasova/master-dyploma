import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.bubble.css';
import { cn } from '@/lib/utils';

type EditRichTextProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function EditRichText({ value, onChange, placeholder, className }: EditRichTextProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Якщо у контейнері вже є розмітка від Quill — чистимо її
    editorRef.current.innerHTML = '';

    const quill = new Quill(editorRef.current, {
      theme: 'bubble',
      placeholder,
      modules: {
        toolbar: [
          [{ header: 1 }, { header: 2 }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean'],
        ],
      },
    });

    quill.root.innerHTML = value || '';
    quill.on('text-change', () => {
      onChange(quill.root.innerHTML);
    });

    const focusHandler = () => editorRef.current?.classList.add('has-focus');
    const blurHandler = () => editorRef.current?.classList.remove('has-focus');

    quill.root.addEventListener('focus', () => focusHandler);
    quill.root.addEventListener('blur', () => blurHandler);

    quillRef.current = quill;

    // 🧹 Очищення DOM вручну при демонтажі
    return () => {
      quill.root.removeEventListener('focus', () => focusHandler);
      quill.root.removeEventListener('blur', () => blurHandler);
      quillRef.current = null;

      if (editorRef.current) {
        editorRef.current.innerHTML = ''; // повністю прибирає toolbar і container
      }
    };
  }, []);

  return (
    <div
      className={cn(
        'rich-text-component',
        'border dark:bg-input/30 border-input rounded-md bg-transparent',
        'shadow-xs transition-[color,box-shadow] outline-none',
        'has-focus:border-ring has-focus:ring-ring/50 has-focus:ring-[3px]',
        className,
      )}
      ref={editorRef}
    />
  );
}
