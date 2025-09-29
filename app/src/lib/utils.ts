import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { JOB_CATEGORIES } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const filterObjectKeys = (obj: object, keys: string[]) => {
  const entries = Object.entries(obj);
  const filteredEntries = entries.filter(([key]) => keys.includes(key));

  return Object.fromEntries(filteredEntries);
};

export const getCategoryName = (categoryId: string): string => {
  const category = JOB_CATEGORIES.find((category) => category.value === categoryId);
  return category?.label ?? categoryId;
};
