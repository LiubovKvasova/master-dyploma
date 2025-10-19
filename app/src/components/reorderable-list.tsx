import { GripVerticalIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ReorderableList({
  items,
  setItems,
}: {
  items: string[];
  setItems: (v: string[]) => void;
}) {
  const labels: Record<string, string> = {
    distance: 'Мінімальна відстань від дому',
    salary: 'Оплата праці',
    categories: 'Відповідність категоріям',
    reputation: 'Репутація роботодавця',
  };

  let dragIndex: number | null = null;

  return (
    <div>
      <h3 className="text-center mb-3 font-semibold">Пріоритетність критеріїв</h3>
      <div className="flex flex-col gap-2">
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
    </div>
  );
}
