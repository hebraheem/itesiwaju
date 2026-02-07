import { z } from "zod";

export const recordPaymentSchema = z.object({
  amount: z.string().min(1, "Amount is required").transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      throw new Error("Amount must be a positive number");
    }
    return num;
  }),
  paymentType: z.enum(["fine_payment", "borrow_payment", "due_payment"]),
  description: z.string().optional(),
});

export const recordBorrowSchema = z.object({
  amount: z.string().min(1, "Amount is required").transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      throw new Error("Amount must be a positive number");
    }
    return num;
  }),
  dueDate: z.string().min(1, "Due date is required").transform((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date.getTime();
  }),
  description: z.string().optional(),
});

export const recordFineSchema = z.object({
  amount: z.string().min(1, "Amount is required").transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      throw new Error("Amount must be a positive number");
    }
    return num;
  }),
  reason: z.string().min(1, "Reason is required"),
});
