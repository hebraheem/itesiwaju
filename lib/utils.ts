import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Activity as ActivityIcon,
  Calendar,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

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

export const getMonth = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
  };

  return date.toLocaleDateString(undefined, options);
};

export const ACCOUNT_STATUSES = Object.freeze({
  good_standing: "good_standing",
  owing: "owing",
  overdue: "overdue",
});

type Role = keyof typeof USER_ROLES;

type QuickAction = {
  icon: any;
  label: string;
  href: string;
  color: string;
};

const ACTIONS: Record<string, QuickAction> = {
  createEvent: {
    icon: Calendar,
    label: "quickActions.createEvent",
    href: "/events/create",
    color: "bg-orange-500",
  },
  addMember: {
    icon: UserPlus,
    label: "quickActions.addMember",
    href: "/members/create",
    color: "bg-blue-500",
  },
  recordPayment: {
    icon: Wallet,
    label: "quickActions.recordPayment",
    href: "/account-status",
    color: "bg-green-500",
  },
  activity: {
    icon: ActivityIcon,
    label: "quickActions.viewActivity",
    href: "/activity",
    color: "bg-purple-500",
  },
};

const ROLE_ACTIONS: Record<Role, (keyof typeof ACTIONS)[]> = {
  admin: ["createEvent", "addMember", "recordPayment", "activity"],
  treasurer: ["recordPayment", "activity"],
  pro: ["createEvent", "activity"],
  member: ["activity"],
};

export const quickActions = (role: Role): QuickAction[] => {
  return (ROLE_ACTIONS[role] ?? []).map((key) => ACTIONS[key]);
};

export const accountStatus = (accountSummary: {
  totalOutStandingBorrow: number;
  totalOutStandingDues: number;
  totalOutStandingFine: number;
  moneyAtHand: number;
  fineToBalance: number;
  borrowedAmountToBalance: number;
  duesToBalance: number;
  noOfOwingMembers: number;
  noOfOverdueMembers: number;
}) => {
  return [
    {
      label: "stats.totalOutstanding",
      value:
        "€" +
        (
          (accountSummary?.totalOutStandingBorrow ?? 0) +
          (accountSummary?.totalOutStandingDues ?? 0) +
          (accountSummary?.totalOutStandingFine ?? 0)
        ).toLocaleString(),
      color: "text-orange-600",
    },
    {
      label: "stats.moneyAtHand",
      value: "€" + (accountSummary?.moneyAtHand ?? 0).toLocaleString(),
      color: "text-green-600",
    },
    {
      label: "stats.totalFine",
      value: "€" + (accountSummary?.totalOutStandingFine ?? 0).toLocaleString(),
      color: "text-orange-600",
    },
    {
      label: "stats.totalBorrowed",
      value:
        "€" + (accountSummary?.totalOutStandingBorrow ?? 0).toLocaleString(),
      color: "text-orange-600",
    },
    {
      label: "stats.totalDues",
      value: "€" + (accountSummary?.totalOutStandingDues ?? 0).toLocaleString(),
      color: "text-green-600",
    },
    {
      label: "stats.pendingPayments",
      value: accountSummary?.noOfOwingMembers ?? 0,
      color: "text-yellow-600",
    },
    {
      label: "stats.overdue",
      value: accountSummary?.noOfOverdueMembers ?? 0,
      color: "text-red-600",
    },
  ];
};

export function extractErrorMessage(raw: any) {
  if (!raw) return "Something went wrong";

  const str = typeof raw === "string" ? raw : raw.message || String(raw);
  let cleaned = str.replace(/\[Request ID:[^\]]+\]\s*/gi, "");
  cleaned = cleaned.split(" at ")[0];
  cleaned = cleaned.replace(/(Server Error|Uncaught Error|Error:)/gi, "");

  return cleaned.trim();
}

export const getMetadataDescription = (activity: ActivityType): any => {
  const { metadata, action } = activity;
  return {
    eventUpdated: { title: metadata?.title },
    eventCreated: { title: metadata?.title },
    eventDeleted: { title: metadata?.title, user: metadata?.user },
    eventCancelled: {
      title: metadata?.title,
      user: metadata?.user,
      reason: metadata?.reason,
    },
    record_borrow: {
      amount: metadata?.amount?.toLocaleString(),
      dueDate: parseDate(metadata?.dueDate),
      user: metadata?.user,
    },
    record_due: {
      amount: metadata?.amount?.toLocaleString(),
      dueDate: parseDate(metadata?.dueDate),
      user: metadata?.user,
    },
    record_fine: {
      amount: metadata?.amount?.toLocaleString(),
      reason: metadata?.reason,
      user: metadata?.user,
    },
    record_payment: {
      amount: metadata?.amount?.toLocaleString(),
      paymentType: metadata?.paymentType,
      user: metadata?.user,
    },
    delete_account: {
      user: metadata?.user,
    },
    passwordReset: {
      user: metadata?.user,
    },
    passwordUpdate: {
      user: metadata?.user,
    },
    userDeletion: {
      user: metadata?.user,
    },
    statusRoleUpdate: {
      user: metadata?.user,
      newStatus: metadata?.newStatus,
      newRole: metadata?.newRole,
    },
    profileUpdate: {
      user: metadata?.user,
    },
    account_created: {
      user: metadata?.user,
    },
    signUp: {
      user: metadata?.user,
      role: metadata?.role,
    },
  }[action];
};

export type ActivityType = {
  _id: Id<"activities">;
  _creationTime: number;
  action?: string | undefined;
  user?: string | undefined;
  receiver?: string | undefined;
  metadata: Record<string, any>;
  type: "member" | "payment" | "profile" | "event" | "system";
  description: string;
  userId: Id<"users">;
  timestamp: number;
};
