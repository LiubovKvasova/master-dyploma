import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const filterObjectKeys = (obj: object, keys: string[]) => {
  const entries = Object.entries(obj);
  const filteredEntries = entries.filter(([key]) => keys.includes(key));

  return Object.fromEntries(filteredEntries);
};
