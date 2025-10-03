import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SlideFadeProps = {
  show: boolean;
  children: ReactNode;
  className?: string;
  maxHeight?: string;
};

export function SlideFade({
  show,
  children,
  className,
  maxHeight = 'max-h-40',
}: SlideFadeProps) {
  return (
    <div
      className={cn(
        'transition-all duration-300 overflow-hidden',
        show ? `${maxHeight} opacity-100` : 'max-h-0 opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
}
