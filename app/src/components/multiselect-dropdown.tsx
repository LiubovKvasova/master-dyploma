import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Option = {
  value: string;
  label: string;
};

type MultiSelectDropdownProps = {
  label?: string;
  className?: string;
  options: Option[];
  values: string[];
  setValues: (values: string[]) => void;
};

export function MultiSelectDropdown({
  label = 'Вибір опцій',
  className,
  options,
  values,
  setValues,
}: MultiSelectDropdownProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      setValues(values.filter((v) => v !== value));
    } else {
      setValues([...values, value]);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full">
            <span>{label}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                menuOpen ? 'rotate-180' : ''
              )}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-full">
          {options
            .filter((option) => !values.includes(option.value))
            .map((option) => (
              <DropdownMenuItem key={option.value} onClick={() => toggleValue(option.value)}>
                {option.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* обрані значення */}
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((value) => {
          const option = options.find((opt) => opt.value === value);

          if (!option) {
            return null;
          }

          return (
            <Button
              key={value}
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => toggleValue(value)}
            >
              {option.label} ✕
            </Button>
          );
        })}
      </div>
    </div>
  );
}
