import { convexServer } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  recordPaymentSchema,
  recordBorrowSchema,
  recordFineSchema,
  recordDueSchema,
} from "@/app/schemas/account.schema";

type ActionResponse = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
};

export async function recordPaymentAction(
  prev: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  const userId = formData.get("userId") as string;
  const amount = formData.get("amount") as string;
  const paymentType = formData.get("type") as string;
  const description = formData.get("description") as string;
  const authEmail = formData.get("authEmail") as string;

  try {
    const data = { amount, paymentType, description };
    const parsed = recordPaymentSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await convexServer.mutation(api.accounts.recordPayment, {
      userId: userId as Id<"users">,
      amount: parsed.data.amount,
      paymentType: parsed.data.paymentType,
      description: parsed.data.description,
      authEmail,
    });

    return {
      success: true,
      message: "Payment recorded successfully!",
    };
  } catch (error) {
    return {
      message:
        (error as Error)?.message ??
        "An unexpected error occurred. Please try again.",
      success: false,
    };
  }
}

export async function recordBorrowAction(
  prev: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  const userId = formData.get("userId") as string;
  const amount = formData.get("amount") as string;
  const dueDate = formData.get("dueDate") as string;
  const description = formData.get("description") as string;
  const authEmail = formData.get("authEmail") as string;

  try {
    const data = { amount, dueDate, description };
    const parsed = recordBorrowSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await convexServer.mutation(api.accounts.recordBorrow, {
      userId: userId as Id<"users">,
      amount: parsed.data.amount,
      dueDate: parsed.data.dueDate,
      description: parsed.data.description,
      authEmail,
    });

    return {
      success: true,
      message: "Borrow recorded successfully!",
    };
  } catch (error) {
    return {
      message:
        (error as Error)?.message ??
        "An unexpected error occurred. Please try again.",
      success: false,
    };
  }
}

export async function recordFineAction(
  prev: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  const userId = formData.get("userId") as string;
  const amount = formData.get("amount") as string;
  const reason = formData.get("reason") as string;
  const authEmail = formData.get("authEmail") as string;

  try {
    const data = { amount, reason };
    const parsed = recordFineSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await convexServer.mutation(api.accounts.recordFine, {
      userId: userId as Id<"users">,
      amount: parsed.data.amount,
      reason: parsed.data.reason,
      authEmail,
    });

    return {
      success: true,
      message: "Fine recorded successfully!",
    };
  } catch (error) {
    return {
      message:
        (error as Error)?.message ??
        "An unexpected error occurred. Please try again.",
      success: false,
    };
  }
}

export async function recordDueAction(
  prev: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  const userId = formData.get("userId") as string;
  const amount = formData.get("amount") as string;
  const description = formData.get("description") as string;
  const authEmail = formData.get("authEmail") as string;

  try {
    const data = { amount, description };
    const parsed = recordDueSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await convexServer.mutation(api.accounts.recordDue, {
      userId: userId as Id<"users">,
      ...parsed.data,
      authEmail,
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // Set the due date to 30 days from now
    });

    return {
      success: true,
      message: "Due recorded successfully!",
    };
  } catch (error) {
    return {
      message:
        (error as Error)?.message ??
        "An unexpected error occurred. Please try again.",
      success: false,
    };
  }
}
