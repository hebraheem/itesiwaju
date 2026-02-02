import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ROOT_LAYOUT_HEADER_HEIGHT = 80;

export const PAGE_PADDING_X = 24;
