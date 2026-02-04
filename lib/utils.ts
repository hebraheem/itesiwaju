import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ROOT_LAYOUT_HEADER_HEIGHT = 80;

export const PAGE_PADDING_X = 24;

export const USER_ROLES = Object.freeze({
  admin: "admin",
  member: "member",
  pro: "pro",
  treasurer: "treasurer",
});

export const USER_STATUSES = Object.freeze({
  active: "active",
  suspended: "suspended",
  inactive: "inactive",
});

export const EVENT_STATUSES = Object.freeze({
  upcoming: "upcoming",
  ongoing: "ongoing",
  completed: "completed",
  cancelled: "cancelled",
});

export const parseDate = (dateString: number): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString(undefined, options);
};

export const buildAddress = (
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null,
): string => {
  if (!address) return "N/A";
  const { street, city, state, country } = address;
  return [street, city, state, country]
    .filter((part) => part && part.trim() !== "")
    .join(", ");
};
