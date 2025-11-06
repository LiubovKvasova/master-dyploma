'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ImageCarouselProps = {
  images: string[];
  className?: string;
};

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <>
      <div className={cn('relative overflow-hidden', className)} ref={emblaRef}>
        <div className="flex">
          {images.map((src, idx) => (
            <div
              key={idx}
              className="flex-[0_0_100%] flex justify-center items-center bg-[#0c1222] rounded-md"
            >
              <img
                src={src}
                className="max-h-64 w-auto object-contain cursor-zoom-in select-none"
                onClick={() => setPreviewImage(src)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Буллети */}
      <div className="flex justify-center gap-2 mt-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={cn(
              'h-2 w-2 rounded-full transition-all',
              (selectedIndex === idx) ? 'bg-white scale-125' : 'bg-neutral-500',
            )}
            onClick={() => scrollTo(idx)}
          />
        ))}
      </div>

      {/* Fullscreen Preview */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogTitle></DialogTitle>
        <DialogContent
          className={cn(
            'p-0 bg-black border-none flex justify-center items-center w-max h-fit',
            'sm:max-w-[calc(100vw-2rem)]',
          )}
          aria-describedby=""
        >
          {previewImage && (
            <img
              src={previewImage}
              className="object-contain max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)]"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
