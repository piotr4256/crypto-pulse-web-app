import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * cn — pomocnicza funkcja służąca do dynamicznego łączenia i bezpiecznego 
 * scalania klas CSS (Tailwind). Rozwiązuje konflikty klas (np. px-4 i px-6).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
