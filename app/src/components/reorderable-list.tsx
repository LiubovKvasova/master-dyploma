import { GripVerticalIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ReorderableList({
  items,
  setItems,
  className,
  labels,
}: {
  items: string[];
  setItems: (v: string[]) => void;
  className?: string;
  labels: Record<string, string>;
}) {
  let dragIndex: number | null = null;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {items.map((item, idx) => (
        <Card
          key={item}
          draggable
          onDragStart={() => (dragIndex = idx)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex === null) return;
            const newItems = [...items];
            const [moved] = newItems.splice(dragIndex, 1);
            newItems.splice(idx, 0, moved);
            setItems(newItems);
            dragIndex = null;
          }}
          className="flex flex-row p-3 cursor-move hover:bg-muted/60 transition"
        >
          <GripVerticalIcon />
          {labels[item]}
        </Card>
      ))}
    </div>
  );
}
