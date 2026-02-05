import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Calendar, UserPlus, Wallet } from "lucide-react";

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

export const EVENT_TYPES = Object.freeze({
  meeting: "meeting",
  social: "social",
  fundraiser: "fundraiser",
  workshop: "workshop",
  others: "others",
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

export const ACTIVITY_TYPES = Object.freeze({
  payment: "payment",
  member: "member",
  profile: "profile",
  event: "event",
});

export const removeEmptyFields = <T extends Record<string, any>>(
  obj: T,
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    ),
  ) as Partial<T>;
};

export const quickActions = [
  {
    icon: Calendar,
    label: "quickActions.createEvent",
    href: "/events/create",
    color: "bg-orange-500",
  },
  {
    icon: UserPlus,
    label: "quickActions.addMember",
    href: "/members/create",
    color: "bg-blue-500",
  },
  {
    icon: Wallet,
    label: "quickActions.recordPayment",
    href: "/account-status",
    color: "bg-green-500",
  },
  // {
  //   icon: FileText,
  //   label: t("quickActions.viewReports"),
  //   href: "/reports",
  //   color: "bg-purple-500",
  // },
];

export const getMonth = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
  };

  return date.toLocaleDateString(undefined, options);
};
